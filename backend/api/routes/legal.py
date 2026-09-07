"""
CryptoTrace-I4C Legal Notice Generator Routes
Now includes Evidence Package generation (14-item comprehensive PDF).
"""
from fastapi import APIRouter, HTTPException, Response
from ...core.models import LegalNoticeRequest, LegalNoticeResponse
from ...core.legal_generator import generate_section_91_notice, generate_section_91_pdf
from ...core.evidence_packager import generate_evidence_package_pdf
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
        raise HTTPException(status_code=404, detail=f"Case ID '{req.case_id}' not found. Please execute a trace first.")

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
        raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' not found. Please execute a trace first.")

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

@router.get("/{case_id}/evidence-package", summary="Download comprehensive 14-item evidence package PDF")
async def download_evidence_package(
    case_id: str,
    fir_number: str = "FIR-2026/CYBER/409",
    complainant_name: str = "Complainant",
    ncrp_ref: str = "",
    incident_date: str = "",
):
    """
    Generates and downloads the comprehensive 14-item evidence package PDF.
    Includes: NCRP/FIR metadata, transaction trail, VASP attribution, FIU-IND info,
    risk explanation, flow graph, legal notice, SHA-256 hash, manifest, and chain of custody.
    """
    trace = TRACE_CACHE.get(case_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' not found. Please execute a trace first.")

    pdf_bytes = generate_evidence_package_pdf(
        trace=trace,
        fir_number=fir_number,
        complainant_name=complainant_name,
        ncrp_ref=ncrp_ref or case_id,
        incident_date=incident_date,
    )

    filename = f"EvidencePackage_{case_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
