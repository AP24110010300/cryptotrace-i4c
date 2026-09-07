"""
CryptoTrace-I4C Risk Score API Route — Member 4 / Member 6
Exposes the M4 RiskScorer directly via REST for frontend and testing.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from ...core.risk_scorer import risk_scorer, RiskReport
from ...core.pattern_detector import pattern_detector
from ...core.models import TransactionHop
from .trace import TRACE_CACHE

router = APIRouter(prefix="/risk", tags=["AI Risk Scoring"])


class RiskAnalysisRequest(BaseModel):
    case_id: Optional[str] = None
    hops: Optional[List[TransactionHop]] = None
    token: str = "USDT-TRC20"
    vasp_matched: bool = False
    vasp_name: Optional[str] = None


@router.post("", response_model=RiskReport, summary="Run M4 AI risk scoring on a transaction chain")
async def score_risk(req: RiskAnalysisRequest):
    """
    Accepts either a case_id (to look up a traced case) or a direct list of hops.
    Returns full risk report: score, level, typology, per-factor breakdown, and recommendation.
    """
    hops = req.hops

    if req.case_id and req.case_id in TRACE_CACHE:
        trace = TRACE_CACHE[req.case_id]
        hops  = trace.hops
        vasp_matched = trace.destination_vasp is not None
        vasp_name    = trace.destination_vasp.name if trace.destination_vasp else None
        token        = trace.token
    else:
        vasp_matched = req.vasp_matched
        vasp_name    = req.vasp_name
        token        = req.token

    if not hops:
        raise HTTPException(status_code=400, detail="Provide either a valid case_id or a list of hops.")

    return risk_scorer.score(
        hops=hops,
        vasp_matched=vasp_matched,
        vasp_name=vasp_name,
        token=token
    )


@router.get("/{case_id}/patterns", summary="Detect laundering patterns for a traced case")
async def get_patterns(case_id: str):
    """
    Runs the M4 PatternDetector on a traced case and returns pattern analysis:
    peel chain, rapid layering, smurfing, and mixer detection results.
    """
    if case_id not in TRACE_CACHE:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found. Run /api/trace first.")
    trace    = TRACE_CACHE[case_id]
    patterns = pattern_detector.detect_all(trace.hops)
    typology = pattern_detector.get_typology_label(patterns)
    return {
        "case_id":  case_id,
        "typology": typology,
        "patterns": patterns,
    }
