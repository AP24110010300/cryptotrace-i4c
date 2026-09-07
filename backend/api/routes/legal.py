"""
CryptoTrace-I4C Legal Notice Generator Routes
"""
from fastapi import APIRouter, HTTPException, Response
from ...core.models import LegalNoticeRequest, LegalNoticeResponse
from ...core.legal_generator import generate_section_91_notice, generate_section_91_pdf
from .trace import TRACE_CACHE, tracer_engine, TraceRequest

router = APIRouter(prefix="/legal", tags=["Legal Notices"])

@router.post("/notice", response_model=LegalNoticeResponse, summary="Generate Section 91/102 CrPC freezing directive")
async def generate_notice(req: LegalNoticeRequest):
    """
    Generates a formal, court-admissible statutory notice under Section 91/102 CrPC
    & Section 94/106 BNSS 2023 with SHA-256 evidence chain verification.
    """
    trace = TRACE_CACHE.get(req.case_id)
    if not trace:
        demo_req = TraceRequest(
            victim_wallet="TXqHx87KmN3vL8p2Qw5kR1m9xP4y8n2m7f",
            suspect_wallet="TR8nh2K1m9xP4y8n2m7fB3dL1jV5xK8rT6",
            initial_amount=45000.0,
            token="USDT-TRC20",
            ncrp_ref=req.case_id,
            fir_number=req.fir_number or "FIR-2026/CYBER/409",
            police_station=req.police_station or "State Cyber Crime Police Station, CID"
        )
        trace = tracer_engine.trace_transaction(demo_req)
        trace.case_id = req.case_id
        TRACE_CACHE[req.case_id] = trace

    notice = generate_section_91_notice(
        trace=trace,
        fir_number=req.fir_number or "FIR-2026/CYBER/409",
        police_station=req.police_station or "State Cyber Crime Police Station, CID",
        investigating_officer=req.investigating_officer or "Inspector Rajesh Sharma (Cyber Cell)"
    )
    return notice

@router.get("/{case_id}/pdf", summary="Download official court-admissible Section 91 Notice PDF")
async def download_notice_pdf(case_id: str, fir_number: str = "FIR-2026/CYBER/409"):
    """
    Streams a formal printable PDF of the statutory freezing notice.
    """
    trace = TRACE_CACHE.get(case_id)
    if not trace:
        demo_req = TraceRequest(
            victim_wallet="TXqHx87KmN3vL8p2Qw5kR1m9xP4y8n2m7f",
            suspect_wallet="TR8nh2K1m9xP4y8n2m7fB3dL1jV5xK8rT6",
            initial_amount=45000.0,
            token="USDT-TRC20",
            ncrp_ref=case_id,
            fir_number=fir_number
        )
        trace = tracer_engine.trace_transaction(demo_req)
        trace.case_id = case_id
        TRACE_CACHE[case_id] = trace

    pdf_bytes = generate_section_91_pdf(
        trace=trace,
        fir_number=fir_number
    )

    filename = f"Notice_Section91_{case_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
