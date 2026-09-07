"""
CryptoTrace-I4C Automated Statutory Notice Generator
Generates Section 91 & Section 102 CrPC (BNSS Sections 94 & 106) Freezing Notices.
"""
import uuid
from datetime import datetime, timezone
from .models import TraceResult, LegalNoticeResponse

def generate_section_91_notice(
    trace: TraceResult,
    fir_number: str = "FIR-2026/CYBER/409",
    police_station: str = "State Cyber Crime Police Station, CID",
    investigating_officer: str = "Inspector Rajesh Sharma (Cyber Cell)"
) -> LegalNoticeResponse:
    vasp_name = trace.destination_vasp.name if trace.destination_vasp else "Crypto Asset Service Provider"
    nodal_email = trace.destination_vasp.nodal_officer_email if trace.destination_vasp else "compliance@exchange.com"
    notice_id = f"LEA/I4C/SEC91/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).strftime('%d-%b-%Y %H:%M:%S UTC')

    notice_text = f"""========================================================================================
                     OFFICE OF THE SUPERINTENDENT OF POLICE
                    CYBER CRIME INVESTIGATION DIVISION / I4C
========================================================================================
Notice Reference: {notice_id}
Date & Time of Dispatch: {now_str}
Statutory Powers: Section 91 & Section 102, Code of Criminal Procedure, 1973 (CrPC)
                  Read with Section 94 & Section 106, Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
                  Section 65B, Indian Evidence Act / BSA 2023 Compliant Digital Certificate

TO:
  The Designated Nodal Officer / Law Enforcement Response Team
  Entity: {vasp_name}
  Official Nodal Email: {nodal_email}

SUBJECT: MANDATORY STATUTORY DIRECTIVE FOR IMMEDIATE ASSET FREEZE, DE-HOSTING, AND
         LOG PRESERVATION UNDER SEC 91/102 CrPC IN CYBER FRAUD PROCEEDINGS
         (CRIME/FIR REFERENCE: {fir_number})

1. PARTICULARS OF CYBER OFFENSE:
   A criminal complaint has been registered on the National Cybercrime Reporting Portal (NCRP)
   and registered under FIR No: {fir_number} at {police_station}.
   The complainant was defrauded of {trace.total_stolen_amount:,.2f} {trace.token} through an orchestrated
   cyber-financial fraud ring.

2. FORENSIC TRANSACTION TRAIL (ESTABLISHED VIA CRYPTOTRACE-I4C):
   Automated multi-hop blockchain analytics has traced the proceeds of crime directly into your
   exchange infrastructure:

   • Victim Wallet: {trace.victim_wallet}
   • Primary Suspect Collection Wallet: {trace.hops[0].to_address}
   • Initial On-Chain TX Hash: {trace.initial_tx_hash}
   • Total Intermediary Hops Traced: {len(trace.hops)}
   • Final Deposit Address on Your Exchange: {trace.destination_wallet}
   • Associated Deposit Memo / Tag: {trace.deposit_memo or 'N/A'}
   • Total Transferred Value at Deposit: {trace.hops[-1].amount:,.2f} {trace.token}
   • Timestamp of Final Deposit: {trace.hops[-1].timestamp}
   • Forensic Typology Identified: {trace.laundering_typology}
   • Algorithmic Risk Confidence: {trace.risk_score}%

3. STATUTORY DIRECTIVES (COMPLIANCE REQUIRED WITHIN TWO HOURS):
   Pursuant to statutory powers vested under Section 91 and Section 102 CrPC, you are hereby
   DIRECTED TO:

   a) IMMEDIATELY FREEZE / RESTRICT ALL WITHDRAWALS, transfers, P2P orders, and off-ramping
      for the account associated with deposit address {trace.destination_wallet}
      (Memo/Tag: {trace.deposit_memo or 'N/A'}).
   b) PRESERVE AND FURNISH within 24 hours:
      - Complete KYC dossier (National Identity/Aadhaar/Passport, Full Name, DOB, Address)
      - Registered mobile number, alternate phone, and verified email address
      - Bank account numbers, UPI IDs, and payment methods linked for INR fiat withdrawals
      - IP access logs, Device Fingerprints, IMEI, MAC address, and User-Agent headers
      - Complete internal transaction history of this account for the preceding 90 days.
   c) CONFIRM EXECUTION OF FREEZE via email response to this office within TWO (2) HOURS.

4. PENAL WARNING:
   Take notice that non-compliance with statutory notices issued under Section 91/102 CrPC
   attracts penal consequences under Section 175 and Section 204 of the Indian Penal Code (IPC) /
   corresponding provisions of Bharatiya Nyaya Sanhita (BNS) 2023.

5. EVIDENCE INTEGRITY & CHAIN OF CUSTODY:
   • Forensic SHA-256 Audit Seal: {trace.sha256_audit_hash}
   • Investigating Officer: {investigating_officer}
   • Unit: {police_station}
========================================================================================"""

    return LegalNoticeResponse(
        notice_id=notice_id,
        generated_at=now_str,
        vasp_name=vasp_name,
        nodal_email=nodal_email,
        destination_wallet=trace.destination_wallet,
        deposit_memo=trace.deposit_memo,
        notice_text=notice_text,
        sha256_audit_hash=trace.sha256_audit_hash
    )
