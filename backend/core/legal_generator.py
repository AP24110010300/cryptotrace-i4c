"""
CryptoTrace-I4C Automated Statutory Notice Generator
Generates Section 91 & Section 102 CrPC (BNSS Sections 94 & 106) Freezing Notices
with both Text and Court-Admissible PDF format.
"""
import io
import uuid
from datetime import datetime, timezone
from typing import Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
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

def generate_section_91_pdf(
    trace: TraceResult,
    fir_number: str = "FIR-2026/CYBER/409",
    police_station: str = "State Cyber Crime Police Station, CID",
    investigating_officer: str = "Inspector Rajesh Sharma (Cyber Cell)"
) -> bytes:
    """
    Generates a formal, court-admissible PDF version of the Section 91/102 CrPC Notice.
    """
    vasp_name = trace.destination_vasp.name if trace.destination_vasp else "Crypto Asset Service Provider"
    nodal_email = trace.destination_vasp.nodal_officer_email if trace.destination_vasp else "compliance@exchange.com"
    notice_id = f"LEA/I4C/SEC91/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).strftime('%d-%b-%Y %H:%M:%S UTC')

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=32,
        bottomMargin=32
    )

    styles = getSampleStyleSheet()
    normal = styles['Normal']
    normal.fontSize = 8.5
    normal.leading = 11

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    sub_title_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=1
    )

    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("OFFICE OF THE SUPERINTENDENT OF POLICE", title_style))
    elements.append(Paragraph("CYBER CRIME INVESTIGATION DIVISION • INDIAN CYBER CRIME COORDINATION CENTRE (I4C)", sub_title_style))
    elements.append(Paragraph("MINISTRY OF HOME AFFAIRS • GOVERNMENT OF INDIA", ParagraphStyle('Gov', parent=sub_title_style, fontSize=8, textColor=colors.HexColor('#64748b'))))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceAfter=8))

    # 2. Metadata Grid Table
    meta_data = [
        [
            Paragraph(f"<b>Notice Ref:</b> {notice_id}", normal),
            Paragraph(f"<b>Date:</b> {now_str}", normal)
        ],
        [
            Paragraph(f"<b>Crime Ref / FIR:</b> {fir_number}", normal),
            Paragraph(f"<b>Investigating Unit:</b> {police_station}", normal)
        ],
        [
            Paragraph(f"<b>Target Entity:</b> {vasp_name}", normal),
            Paragraph(f"<b>Nodal Email:</b> {nodal_email}", normal)
        ],
        [
            Paragraph("<b>Statutory Powers:</b> Sec 91 & 102 CrPC / Sec 94 & 106 BNSS 2023", normal),
            Paragraph("<b>Certification:</b> Sec 65B Indian Evidence Act / BSA 2023", normal)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[260, 260])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 8))

    # 3. Subject
    subj_style = ParagraphStyle('Subj', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor('#b91c1c'))
    elements.append(Paragraph(f"SUBJECT: MANDATORY ASSET FREEZE & LOG PRESERVATION DIRECTIVE IN CYBER FRAUD PROCEEDINGS ({fir_number})", subj_style))
    elements.append(Spacer(1, 6))

    # 4. Crime Background
    elements.append(Paragraph("1. Particulars of Offense & Investigation Trail", section_heading))
    p_bg = f"A criminal cyber fraud complaint was lodged on the National Cybercrime Reporting Portal (1930 Helpline). Complainant was defrauded of <b>{trace.total_stolen_amount:,.2f} {trace.token}</b>. Automated multi-hop blockchain forensics established that stolen proceeds were de-layered through {len(trace.hops)} hops and deposited into your exchange platform at wallet address <b>{trace.destination_wallet}</b> (Memo/Tag: <b>{trace.deposit_memo or 'N/A'}</b>)."
    elements.append(Paragraph(p_bg, normal))
    elements.append(Spacer(1, 6))

    # 5. Hop Transaction Summary Table
    elements.append(Paragraph("2. Forensic Multi-Hop Transaction Trail", section_heading))
    table_rows = [
        [
            Paragraph("<b>Hop</b>", normal),
            Paragraph("<b>From Address</b>", normal),
            Paragraph("<b>To Address</b>", normal),
            Paragraph("<b>Amount</b>", normal),
            Paragraph("<b>Type / Notes</b>", normal)
        ]
    ]
    for h in trace.hops:
        from_short = f"{h.from_address[:8]}...{h.from_address[-6:]}"
        to_short = f"{h.to_address[:8]}...{h.to_address[-6:]}"
        table_rows.append([
            Paragraph(f"#{h.hop_number}", normal),
            Paragraph(from_short, normal),
            Paragraph(to_short, normal),
            Paragraph(f"{h.amount:,.2f} {h.token}", normal),
            Paragraph("Peel Mule" if h.is_peel_chain else ("VASP Deposit" if h.hop_number == len(trace.hops) else "Suspect Layer"), normal)
        ])
    t_hops = Table(table_rows, colWidths=[35, 120, 120, 85, 160])
    t_hops.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t_hops)
    elements.append(Spacer(1, 8))

    # 6. Statutory Directives
    elements.append(Paragraph("3. Mandatory Statutory Directives (Action Within 2 Hours)", section_heading))
    directives = [
        f"<b>a) Immediate Freezing:</b> Instantly freeze and halt all withdrawals, trading, transfers, or off-ramping associated with deposit address <b>{trace.destination_wallet}</b> (Memo/Tag: <b>{trace.deposit_memo or 'N/A'}</b>).",
        "<b>b) Log & KYC Preservation:</b> Furnish verified Aadhaar/Passport KYC records, linked Indian bank accounts, UPI handles, registered mobile numbers, and complete IP access audit logs.",
        "<b>c) Compliance Confirmation:</b> Confirm asset freeze execution via return email to this investigating authority within two (2) hours."
    ]
    for d in directives:
        elements.append(Paragraph(d, normal))
        elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 6))

    # 7. Evidence Hash Seal Box
    seal_data = [
        [
            Paragraph(f"<b>SHA-256 Evidence Seal:</b> {trace.sha256_audit_hash}<br/><b>Risk Confidence:</b> {trace.risk_score}% | <b>Typology:</b> {trace.laundering_typology}", normal)
        ]
    ]
    t_seal = Table(seal_data, colWidths=[520])
    t_seal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#3b82f6')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_seal)
    elements.append(Spacer(1, 10))

    # 8. Sign-off
    sign_style = ParagraphStyle('Sign', parent=normal, fontName='Helvetica-Bold', alignment=2)
    elements.append(Paragraph(f"Authorized Investigating Officer: {investigating_officer}", sign_style))
    elements.append(Paragraph(f"{police_station} • Indian Cyber Crime Coordination Centre (I4C)", ParagraphStyle('SignSub', parent=normal, alignment=2, textColor=colors.HexColor('#64748b'))))

    doc.build(elements)
    return buffer.getvalue()
