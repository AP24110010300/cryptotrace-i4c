"""
CryptoTrace-I4C VASP API Routes
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ...core.models import VASPInfo
from ...core.vasp_registry import lookup_vasp_by_address, get_all_vasps

router = APIRouter(prefix="/vasp", tags=["VASP Registry"])

@router.get("/list", response_model=List[VASPInfo], summary="List all FIU-IND registered VASPs")
async def list_vasps():
    """Retrieve full directory of supported Indian & International Exchanges."""
    return get_all_vasps()

@router.get("/{address}", response_model=Optional[VASPInfo], summary="Look up VASP by wallet address")
async def identify_vasp(address: str):
    """
    Identifies whether an on-chain address belongs to a known exchange deposit
    or hot wallet cluster.
    """
    matched = lookup_vasp_by_address(address)
    if not matched:
        raise HTTPException(
            status_code=404,
            detail=f"Address '{address}' does not match any known VASP hot wallet or deposit cluster in the FIU-IND registry."
        )
    return matched
