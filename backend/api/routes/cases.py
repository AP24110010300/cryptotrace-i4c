"""
CryptoTrace-I4C Case Management API Routes
"""
import json
import os
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException
from ...core.models import CaseIntakeRequest, CaseRecord

router = APIRouter(prefix="/cases", tags=["Case Management"])

# In-memory case storage for live registered cases
CASES_DB: dict[str, CaseRecord] = {}

@router.get("", response_model=List[CaseRecord], summary="List all active fraud cases")
async def list_cases():
    """Retrieve all cyber fraud complaints registered in the system."""
    return list(CASES_DB.values())

@router.get("/{case_id}", response_model=CaseRecord, summary="Get case details by ID")
async def get_case(case_id: str):
    """Fetch single case record by Case ID."""
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' not found.")
    return CASES_DB[case_id]

@router.post("", response_model=CaseRecord, status_code=201, summary="Register new fraud complaint")
async def create_case(req: CaseIntakeRequest):
    """
    Intake a new cyber fraud incident reported via NCRP or 1930 Helpline.
    """
    new_id = f"CT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    record = CaseRecord(
        case_id=new_id,
        complainant_name=req.complainant_name,
        ncrp_acknowledgement=req.ncrp_acknowledgement,
        fir_number=req.fir_number or f"FIR-2026/CYBER/{uuid.uuid4().hex[:4].upper()}",
        crime_category=req.crime_category,
        victim_wallet=req.victim_wallet,
        suspect_wallet=req.suspect_wallet,
        stolen_amount=req.stolen_amount,
        token=req.token,
        status="PENDING_TRACE",
        created_at=datetime.now(timezone.utc).isoformat()
    )
    CASES_DB[new_id] = record
    return record
