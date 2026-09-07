"""
CryptoTrace-I4C Graph Builder
Formats TraceResult into React Flow nodes and edges with hierarchical layout.
"""
from typing import Dict, Any, List
from .models import TraceResult, ReactFlowGraph

def build_react_flow_graph(trace: TraceResult) -> ReactFlowGraph:
    """Transforms a TraceResult into a React Flow canvas data structure."""
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # 1. Victim Node (Start)
    nodes.append({
        "id": "node-victim",
        "type": "victimNode",
        "data": {
            "label": "Victim Wallet (Complainant)",
            "address": trace.victim_wallet,
            "amount": trace.total_stolen_amount,
            "token": trace.token,
            "status": "COMPLAINT_FILED",
            "hop": 0
        },
        "position": {"x": 50, "y": 220}
    })

    curr_x = 340
    prev_node_id = "node-victim"

    for i, hop in enumerate(trace.hops):
        is_last = (i == len(trace.hops) - 1)
        node_id = f"node-hop-{hop.hop_number}"

        if is_last and trace.destination_vasp:
            node_type = "vaspNode"
            label = f"VASP: {trace.destination_vasp.name}"
        elif hop.is_mixer:
            node_type = "mixerNode"
            label = f"Mixer/Tumbler Service (Hop #{hop.hop_number})"
        elif hop.is_peel_chain:
            node_type = "peelNode"
            label = f"Peel Chain Mule #{hop.hop_number}"
        else:
            node_type = "suspectNode"
            label = f"Suspect Wallet #{hop.hop_number}"

        y_offset = 220 + (45 if i % 2 == 1 else -45)

        nodes.append({
            "id": node_id,
            "type": node_type,
            "data": {
                "label": label,
                "address": hop.to_address,
                "amount": hop.amount,
                "token": hop.token,
                "timestamp": hop.timestamp,
                "hop_number": hop.hop_number,
                "is_peel_chain": hop.is_peel_chain,
                "is_vasp": is_last and (trace.destination_vasp is not None),
                "vasp_details": trace.destination_vasp.model_dump() if (is_last and trace.destination_vasp) else None,
                "deposit_memo": trace.deposit_memo if is_last else None,
                "notes": hop.notes
            },
            "position": {"x": curr_x, "y": y_offset}
        })

        # Edge from previous node
        edges.append({
            "id": f"edge-{prev_node_id}-{node_id}",
            "source": prev_node_id,
            "target": node_id,
            "label": f"{hop.amount:,.2f} {hop.token}",
            "animated": True,
            "style": {
                "stroke": "#ef4444" if hop.hop_number == 1 else ("#3b82f6" if is_last else "#f59e0b"),
                "strokeWidth": 2.5
            },
            "data": {
                "tx_hash": hop.tx_hash,
                "timestamp": hop.timestamp,
                "notes": hop.notes
            }
        })

        prev_node_id = node_id
        curr_x += 290

    meta = {
        "case_id": trace.case_id,
        "total_hops": len(trace.hops),
        "total_stolen": trace.total_stolen_amount,
        "token": trace.token,
        "risk_score": trace.risk_score,
        "typology": trace.laundering_typology,
        "destination_vasp": trace.destination_vasp.name if trace.destination_vasp else "Unknown Exchange",
        "audit_hash": trace.sha256_audit_hash,
        "duration_ms": trace.trace_duration_ms
    }

    return ReactFlowGraph(nodes=nodes, edges=edges, meta=meta)
