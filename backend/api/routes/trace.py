"""
CryptoTrace-I4C Tracing API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...core.models import TraceRequest, TraceResult, ReactFlowGraph
from ...core.tracer import HeuristicTracer
from ...core.graph_builder import build_react_flow_graph

router = APIRouter(prefix="/trace", tags=["Forensic Tracing"])

# In-memory storage of completed traces for instant lookup
TRACE_CACHE = {}
tracer_engine = HeuristicTracer()

@router.post("", response_model=TraceResult, summary="Execute automated multi-hop blockchain trace")
async def execute_trace(request: TraceRequest):
    """
    Sub-second heuristic multi-hop trace:
    - Traverses peeling chains and layering mule hops
    - Attributes destination wallet to FIU-IND registered VASP
    - Calculates threat/risk score
    - Generates SHA-256 evidence chain hash
    """
    try:
        result = tracer_engine.trace_transaction(request)
        TRACE_CACHE[result.case_id] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tracing engine error: {str(e)}")

@router.get("/{case_id}", response_model=TraceResult, summary="Retrieve forensic trace by Case ID")
async def get_trace_by_case(case_id: str):
    """Fetch completed trace results by Case ID."""
    if case_id in TRACE_CACHE:
        return TRACE_CACHE[case_id]
    
    # Fallback to generating a default trace for demo case IDs
    demo_req = TraceRequest(
        victim_wallet="TXqHx87KmN3vL8p2Qw5kR1m9xP4y8n2m7f",
        suspect_wallet="TR8nh2K1m9xP4y8n2m7fB3dL1jV5xK8rT6",
        initial_amount=45000.0,
        token="USDT-TRC20",
        ncrp_ref=case_id
    )
    result = tracer_engine.trace_transaction(demo_req)
    result.case_id = case_id
    TRACE_CACHE[case_id] = result
    return result

@router.get("/{case_id}/graph", response_model=ReactFlowGraph, summary="Export trace as React Flow graph")
async def get_trace_graph(case_id: str):
    """Converts a trace into React Flow nodes and edges for interactive frontend rendering."""
    if case_id not in TRACE_CACHE:
        # Load or generate demo
        await get_trace_by_case(case_id)
    
    trace = TRACE_CACHE[case_id]
    return build_react_flow_graph(trace)
