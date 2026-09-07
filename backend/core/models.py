"""
CryptoTrace-I4C Core Pydantic Models & API Schemas
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class TransactionHop(BaseModel):
    tx_hash: str
    from_address: str
    to_address: str
    amount: float
    token: str # BTC, ETH, USDT-TRC20, USDT-ERC20
    timestamp: str
    hop_number: int
    is_peel_chain: bool = False
    is_mixer: bool = False
    notes: str = ""

class VASPInfo(BaseModel):
    vasp_id: str
    name: str
    country: str
    is_fiu_registered: bool
    fiu_registration_number: str = ""
    supported_chains: List[str] = Field(default_factory=list)
    jurisdiction: str = ""
    compliance_contact: str = ""
    le_contact: str = ""
    compliance_portal: str
    notice_method: str = ""
    last_verified_date: str = ""
    source_confidence: str = ""
    nodal_officer_email: str
    escalation_phone: str
    known_deposit_patterns: List[str] = Field(default_factory=list)

class TraceRequest(BaseModel):
    victim_wallet: str = Field(..., description="Victim wallet address reported on 1930/NCRP")
    suspect_wallet: str = Field(..., description="Primary scammer collection wallet")
    initial_amount: float = Field(..., gt=0, description="Amount of cryptocurrency stolen")
    token: str = Field("USDT-TRC20", description="Cryptocurrency symbol (BTC, ETH, USDT-TRC20, etc.)")
    ncrp_ref: Optional[str] = Field(None, description="1930 Helpline or NCRP complaint reference ID")
    fir_number: Optional[str] = Field("FIR-2026/CYBER/409", description="FIR number registered at police station")
    police_station: Optional[str] = Field("State Cyber Crime Police Station, CID", description="Investigating unit")
    complainant_name: Optional[str] = Field(None, description="Name of the complainant/victim")
    incident_date: Optional[str] = Field(None, description="Date of the incident (YYYY-MM-DD)")

class ExplainableRiskFactor(BaseModel):
    """A single explainable risk factor with WHY context."""
    name: str
    detected: bool = True
    score_contribution: float
    description: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    icon: str = "✓"

class InvestigativeRecommendation(BaseModel):
    """Structured investigative recommendation for the IO."""
    priority: str  # "IMMEDIATE", "HIGH", "STANDARD", "LOW"
    primary_action: str
    next_step: str
    vasp_action: Optional[str] = None
    legal_basis: str = ""

class ExplainableRiskReport(BaseModel):
    """Full explainable risk report with WHY factors and IO recommendation."""
    overall_score: float
    risk_level: str
    laundering_typology: str
    factors: List[ExplainableRiskFactor]
    explainable_bullets: List[str]  # Human-readable "✓ 4-hop transfer chain" style
    summary: str
    recommendation: InvestigativeRecommendation
    confidence_pct: float

class TraceResult(BaseModel):
    case_id: str
    victim_wallet: str
    initial_tx_hash: str
    token: str
    total_stolen_amount: float
    hops: List[TransactionHop]
    destination_wallet: str
    destination_vasp: Optional[VASPInfo] = None
    deposit_memo: Optional[str] = None
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Heuristic threat score (0-100)")
    laundering_typology: str
    trace_duration_ms: float
    sha256_audit_hash: str
    explainable_risk: Optional[ExplainableRiskReport] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CaseIntakeRequest(BaseModel):
    complainant_name: str
    phone_number: str
    ncrp_acknowledgement: str
    fir_number: Optional[str] = None
    crime_category: str = "Telegram Part-Time Job Scam"
    victim_wallet: str
    suspect_wallet: str
    stolen_amount: float
    token: str = "USDT-TRC20"

class CaseRecord(BaseModel):
    case_id: str
    complainant_name: str
    ncrp_acknowledgement: str
    fir_number: Optional[str] = None
    crime_category: str
    victim_wallet: str
    suspect_wallet: str
    stolen_amount: float
    token: str
    status: str = "PENDING_TRACE" # PENDING_TRACE, TRACED, NOTICE_SENT, FROZEN
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    trace_result: Optional[TraceResult] = None

class LegalNoticeRequest(BaseModel):
    case_id: str
    fir_number: Optional[str] = "FIR-2026/CYBER/409"
    police_station: Optional[str] = "State Cyber Crime Police Station, CID"
    investigating_officer: Optional[str] = "Inspector Rajesh Sharma (Cyber Cell)"

class LegalNoticeResponse(BaseModel):
    notice_id: str
    generated_at: str
    vasp_name: str
    nodal_email: str
    destination_wallet: str
    deposit_memo: Optional[str] = None
    notice_text: str
    sha256_audit_hash: str

class ReactFlowGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    meta: Dict[str, Any]

