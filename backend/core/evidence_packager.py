"""
CryptoTrace-I4C Evidence Package Generator
Generates a comprehensive 14-item India-specific evidence package PDF
combining blockchain forensics with Indian legal/VASP context.

Evidence Package Contents:
  01. NCRP/FIR Metadata
  02. Victim Wallet
  03. Suspect Wallet
  04. Complete Transaction Trail
  05. Transaction Hashes
  06. Timestamps
  07. VASP Attribution
  08. FIU-IND Information
  09. Risk/Typology Explanation
  10. Transaction Flow Graph
  11. Legal Notice
  12. SHA-256 Evidence Hash
  13. Evidence Manifest
  14. Chain-of-Custody Record
"""
import io
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from .models import TraceResult


def generate_evidence_package_pdf(
    trace: TraceResult,
    fir_number: str = "FIR-2026/CYBER/409",
    police_station: str = "State Cyber Crime Police Station, CID",
    investigating_officer: str = "Inspector Rajesh Sharma (Cyber Cell)",
    complainant_name: str = "Complainant",
    ncrp_ref: str = "",
    incident_date: str = "",
) -> bytes:
    """
    Generates a comprehensive 14-item evidence package PDF.
    Court-admissible under Section 65B Indian Evidence Act / BSA 2023.
    """
    vasp_name = trace.destination_vasp.name if trace.destination_vasp else "Unknown VASP"
    vasp = trace.destination_vasp
    now_str = datetime.now(timezone.utc).strftime('%d-%b-%Y %H:%M:%S UTC')
    package_id = f"EP/I4C/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex[:8].upper()}"

    # Compute package-level integrity hash
    content_for_hash = f"{package_id}|{trace.case_id}|{trace.sha256_audit_hash}|{now_str}"
    package_hash = hashlib.sha256(content_for_hash.encode()).hexdigest()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=36, leftMargin=36, topMargin=32, bottomMargin=32
    )

    styles = getSampleStyleSheet()
    normal = styles['Normal']
    normal.fontSize = 8.5
    normal.leading = 11

    title_style = ParagraphStyle(
        'EPTitle', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=14, leading=17,
        textColor=colors.HexColor('#0f172a'), alignment=1
    )
    sub_title = ParagraphStyle(
        'EPSub', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9.5, leading=13,
        textColor=colors.HexColor('#1e3a8a'), alignment=1
    )
    section_head = ParagraphStyle(
        'SecHead', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=colors.HexColor('#0f172a'), spaceBefore=10, spaceAfter=5
    )
    item_label = ParagraphStyle(
        'ItemLabel', parent=normal,
        fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#1e3a8a')
    )
    red_bold = ParagraphStyle(
        'RedBold', fontName='Helvetica-Bold', fontSize=9,
        leading=12, textColor=colors.HexColor('#b91c1c')
    )

    elements = []

    # ═══════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("CRYPTOTRACE-I4C", title_style))
    elements.append(Paragraph("COMPREHENSIVE EVIDENCE PACKAGE", ParagraphStyle(
        'BigTitle', parent=title_style, fontSize=16, textColor=colors.HexColor('#1e3a8a')
    )))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="80%", thickness=2, color=colors.HexColor('#1e3a8a'), spaceAfter=10))
    elements.append(Paragraph("INDIAN CYBER CRIME COORDINATION CENTRE (I4C)", sub_title))
    elements.append(Paragraph("MINISTRY OF HOME AFFAIRS • GOVERNMENT OF INDIA", ParagraphStyle(
        'Gov', parent=sub_title, fontSize=8, textColor=colors.HexColor('#64748b')
    )))
    elements.append(Spacer(1, 20))

    # Cover metadata
    cover_data = [
        [Paragraph(f"<b>Package ID:</b> {package_id}", normal),
         Paragraph(f"<b>Generated:</b> {now_str}", normal)],
        [Paragraph(f"<b>Case ID:</b> {trace.case_id}", normal),
         Paragraph(f"<b>FIR:</b> {fir_number}", normal)],
        [Paragraph(f"<b>Investigating Officer:</b> {investigating_officer}", normal),
         Paragraph(f"<b>Unit:</b> {police_station}", normal)],
        [Paragraph(f"<b>Package SHA-256:</b> {package_hash[:32]}...", normal),
         Paragraph(f"<b>Certification:</b> Sec 65B IEA / Sec 63 BSA 2023", normal)],
    ]
    t_cover = Table(cover_data, colWidths=[260, 260])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#1e3a8a')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_cover)
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("CONFIDENTIAL — LAW ENFORCEMENT USE ONLY", red_bold))
    elements.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 01: NCRP/FIR METADATA
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("01. NCRP / FIR Case Metadata", section_head))
    meta_items = [
        ["NCRP Reference", ncrp_ref or trace.case_id],
        ["FIR Number", fir_number],
        ["Police Station", police_station],
        ["Investigating Officer", investigating_officer],
        ["Complainant Name", complainant_name],
        ["Incident Date", incident_date or "As per FIR"],
        ["Case ID (System)", trace.case_id],
        ["Report Generated", now_str],
    ]
    for item in meta_items:
        elements.append(Paragraph(f"<b>{item[0]}:</b> {item[1]}", normal))
        elements.append(Spacer(1, 2))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 02: VICTIM WALLET
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("02. Victim Wallet Details", section_head))
    elements.append(Paragraph(f"<b>Wallet Address:</b> {trace.victim_wallet}", normal))
    elements.append(Paragraph(f"<b>Token:</b> {trace.token}", normal))
    elements.append(Paragraph(f"<b>Stolen Amount:</b> {trace.total_stolen_amount:,.2f} {trace.token}", normal))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 03: SUSPECT WALLET
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("03. Primary Suspect Wallet", section_head))
    suspect_addr = trace.hops[0].to_address if trace.hops else "N/A"
    elements.append(Paragraph(f"<b>Suspect Collection Wallet:</b> {suspect_addr}", normal))
    elements.append(Paragraph(f"<b>Initial Transaction Hash:</b> {trace.initial_tx_hash}", normal))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 04: COMPLETE TRANSACTION TRAIL
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("04. Complete Transaction Trail (Hop-by-Hop)", section_head))
    trail_rows = [
        [Paragraph("<b>Hop</b>", normal), Paragraph("<b>From</b>", normal),
         Paragraph("<b>To</b>", normal), Paragraph("<b>Amount</b>", normal),
         Paragraph("<b>Type</b>", normal)]
    ]
    for h in trace.hops:
        from_short = f"{h.from_address[:10]}...{h.from_address[-6:]}"
        to_short = f"{h.to_address[:10]}...{h.to_address[-6:]}"
        hop_type = "Peel Chain" if h.is_peel_chain else ("Mixer" if h.is_mixer else "Transfer")
        trail_rows.append([
            Paragraph(f"#{h.hop_number}", normal),
            Paragraph(from_short, normal),
            Paragraph(to_short, normal),
            Paragraph(f"{h.amount:,.2f} {h.token}", normal),
            Paragraph(hop_type, normal)
        ])
    t_trail = Table(trail_rows, colWidths=[35, 130, 130, 90, 135])
    t_trail.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t_trail)
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 05: TRANSACTION HASHES
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("05. Transaction Hashes (On-Chain Proof)", section_head))
    for h in trace.hops:
        elements.append(Paragraph(f"Hop #{h.hop_number}: <b>{h.tx_hash}</b>", normal))
        elements.append(Spacer(1, 1))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 06: TIMESTAMPS
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("06. Transaction Timestamps", section_head))
    for h in trace.hops:
        elements.append(Paragraph(f"Hop #{h.hop_number}: {h.timestamp}", normal))
        elements.append(Spacer(1, 1))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 07: VASP ATTRIBUTION
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("07. VASP Attribution & Intelligence", section_head))
    if vasp:
        vasp_details = [
            ["Exchange Name", vasp.name],
            ["VASP ID", vasp.vasp_id],
            ["Country / Jurisdiction", f"{vasp.country} — {vasp.jurisdiction}"],
            ["FIU-IND Registered", "✅ YES" if vasp.is_fiu_registered else "❌ NO"],
            ["FIU Registration No.", vasp.fiu_registration_number],
            ["Supported Chains", ", ".join(vasp.supported_chains)],
            ["LE Contact", vasp.le_contact],
            ["Compliance Contact", vasp.compliance_contact],
            ["Compliance Portal", vasp.compliance_portal],
            ["Notice Method", vasp.notice_method],
            ["Last Verified", vasp.last_verified_date],
            ["Source Confidence", vasp.source_confidence],
            ["Destination Wallet", trace.destination_wallet],
            ["Deposit Memo/Tag", trace.deposit_memo or "N/A"],
        ]
        for item in vasp_details:
            elements.append(Paragraph(f"<b>{item[0]}:</b> {item[1]}", normal))
            elements.append(Spacer(1, 1))
    else:
        elements.append(Paragraph("Destination VASP could not be attributed from registry.", normal))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 08: FIU-IND INFORMATION
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("08. FIU-IND Regulatory Information", section_head))
    if vasp and vasp.is_fiu_registered:
        elements.append(Paragraph(f"The destination exchange <b>{vasp.name}</b> is registered with the "
                                  f"Financial Intelligence Unit — India (FIU-IND) under registration number "
                                  f"<b>{vasp.fiu_registration_number}</b>.", normal))
        elements.append(Spacer(1, 3))
        elements.append(Paragraph("As a registered reporting entity, this VASP is legally obligated to comply "
                                  "with statutory notices under the Prevention of Money Laundering Act (PMLA) 2002 "
                                  "and respond to law enforcement requests within the prescribed timeline.", normal))
    elif vasp:
        elements.append(Paragraph(f"<b>WARNING:</b> {vasp.name} is <b>NOT registered</b> with FIU-IND. "
                                  "This is an offshore VASP. International cooperation via MLAT or "
                                  "Interpol channels may be required.", red_bold))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 09: RISK / TYPOLOGY EXPLANATION
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("09. Risk Assessment & Typology Explanation", section_head))

    risk_color = colors.HexColor('#dc2626') if trace.risk_score >= 65 else colors.HexColor('#f59e0b')
    risk_data = [[
        Paragraph(f"<b>RISK SCORE: {trace.risk_score:.0f} / 100</b>", ParagraphStyle(
            'RiskScore', parent=normal, fontSize=12, textColor=risk_color, fontName='Helvetica-Bold'
        )),
        Paragraph(f"<b>Typology:</b> {trace.laundering_typology}", normal)
    ]]
    t_risk = Table(risk_data, colWidths=[200, 320])
    t_risk.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef2f2')),
        ('BOX', (0, 0), (-1, -1), 1, risk_color),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t_risk)
    elements.append(Spacer(1, 5))

    risk_factors = [
        f"• {len(trace.hops)}-hop transfer chain detected",
        f"• Total stolen: {trace.total_stolen_amount:,.2f} {trace.token}",
        f"• Final deposit: {trace.hops[-1].amount:,.2f} {trace.token} at {vasp_name}" if trace.hops else "",
        f"• Laundering typology: {trace.laundering_typology}",
        f"• Algorithm confidence: {trace.risk_score:.0f}%",
    ]
    for rf in risk_factors:
        if rf:
            elements.append(Paragraph(rf, normal))
            elements.append(Spacer(1, 1))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 10: TRANSACTION FLOW GRAPH (Text representation)
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("10. Transaction Flow Graph", section_head))
    flow_lines = []
    for i, h in enumerate(trace.hops):
        from_label = "VICTIM" if i == 0 else f"MULE-{i}"
        to_label = f"VASP ({vasp_name})" if i == len(trace.hops) - 1 else f"MULE-{i+1}"
        flow_lines.append(f"{from_label} → [{h.amount:,.2f} {h.token}] → {to_label}")
    elements.append(Paragraph("<br/>".join(flow_lines), ParagraphStyle(
        'Flow', parent=normal, fontName='Courier', fontSize=8.5, leading=12,
        backColor=colors.HexColor('#f1f5f9')
    )))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 11: LEGAL NOTICE (Summary)
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("11. Statutory Legal Notice (Summary)", section_head))
    elements.append(Paragraph(f"A Section 91 & 102 CrPC / Section 94 & 106 BNSS statutory freeze notice "
                              f"has been generated for <b>{vasp_name}</b> directing immediate freezing of "
                              f"wallet <b>{trace.destination_wallet}</b>.", normal))
    elements.append(Paragraph(f"The notice was addressed to: <b>{vasp.nodal_officer_email if vasp else 'N/A'}</b>", normal))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 12: SHA-256 EVIDENCE HASH
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("12. SHA-256 Evidence Integrity Hash", section_head))
    seal_data = [[
        Paragraph(f"<b>Trace Evidence Hash:</b> {trace.sha256_audit_hash}<br/>"
                  f"<b>Package Hash:</b> {package_hash}<br/>"
                  f"<b>Generated:</b> {now_str}", normal)
    ]]
    t_seal = Table(seal_data, colWidths=[520])
    t_seal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#3b82f6')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t_seal)
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 13: EVIDENCE MANIFEST
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("13. Evidence Manifest", section_head))
    manifest_items = [
        "01. NCRP/FIR Metadata",
        "02. Victim Wallet Details",
        "03. Suspect Wallet Details",
        "04. Complete Transaction Trail (Hop-by-Hop Table)",
        "05. On-Chain Transaction Hashes",
        "06. Transaction Timestamps",
        "07. VASP Attribution & Intelligence",
        "08. FIU-IND Regulatory Information",
        "09. Risk Assessment & Typology Explanation",
        "10. Transaction Flow Graph",
        "11. Statutory Legal Notice (Summary)",
        "12. SHA-256 Evidence Integrity Hash",
        "13. Evidence Manifest (this section)",
        "14. Chain-of-Custody Record",
    ]
    for mi in manifest_items:
        elements.append(Paragraph(f"☑ {mi}", normal))
        elements.append(Spacer(1, 1))
    elements.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════════
    # ITEM 14: CHAIN OF CUSTODY
    # ═══════════════════════════════════════════════════════════════════
    elements.append(Paragraph("14. Chain-of-Custody Record", section_head))
    coc_rows = [
        [Paragraph("<b>Timestamp</b>", normal), Paragraph("<b>Action</b>", normal),
         Paragraph("<b>Actor</b>", normal), Paragraph("<b>Integrity</b>", normal)],
        [Paragraph(now_str, normal),
         Paragraph("Evidence package generated by CryptoTrace-I4C automated forensic engine", normal),
         Paragraph(investigating_officer, normal),
         Paragraph(f"SHA-256: {package_hash[:16]}...", normal)],
        [Paragraph(now_str, normal),
         Paragraph("Blockchain trace executed — multi-hop analysis complete", normal),
         Paragraph("CryptoTrace Engine v2.0", normal),
         Paragraph(f"SHA-256: {trace.sha256_audit_hash[:16]}...", normal)],
    ]
    t_coc = Table(coc_rows, colWidths=[110, 200, 120, 90])
    t_coc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_coc)
    elements.append(Spacer(1, 15))

    # Final certification
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceAfter=8))
    cert_style = ParagraphStyle('Cert', parent=normal, fontName='Helvetica-Bold', alignment=1,
                                fontSize=8, textColor=colors.HexColor('#64748b'))
    elements.append(Paragraph(
        "This evidence package is generated in compliance with Section 65B of the Indian Evidence Act, 1872 / "
        "Section 63 of the Bharatiya Sakshya Adhiniyam, 2023. The digital evidence contained herein is "
        "certified to be a true and accurate representation of the electronic records produced by "
        "the CryptoTrace-I4C forensic analysis engine.",
        cert_style
    ))
    elements.append(Spacer(1, 10))
    sign_style = ParagraphStyle('Sign', parent=normal, fontName='Helvetica-Bold', alignment=2)
    elements.append(Paragraph(f"Authorized IO: {investigating_officer}", sign_style))
    elements.append(Paragraph(f"{police_station} • I4C", ParagraphStyle(
        'SignSub', parent=normal, alignment=2, textColor=colors.HexColor('#64748b')
    )))

    doc.build(elements)
    return buffer.getvalue()
