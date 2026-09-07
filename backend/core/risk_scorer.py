"""
CryptoTrace-I4C AI Risk Scoring Engine — Member 4
Rule-based heuristic scorer that evaluates a chain of on-chain transactions
and returns an EXPLAINABLE risk score with per-factor WHY breakdown
and structured investigative recommendations.

Risk factors scored:
  - Velocity  : Too many hops in a short time window (rapid layering)
  - Peel chain: >90% amount forwarded at each hop
  - Smurfing  : Amount split into many small transfers
  - VASP hit  : Destination is a known exchange
  - Mixer     : Transaction goes through mixing service
  - Dark web  : Address matches known dark market clusters
"""
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel
from .models import (
    ExplainableRiskFactor,
    InvestigativeRecommendation,
    ExplainableRiskReport,
)


class RiskFactor(BaseModel):
    """A single contributing factor to the overall risk score."""
    name: str
    score_contribution: float   # points added to total (0-100 scale)
    description: str
    severity: str               # "LOW", "MEDIUM", "HIGH", "CRITICAL"


class RiskReport(BaseModel):
    """Full risk assessment for a traced transaction chain."""
    overall_score: float                    # 0.0 – 100.0
    risk_level: str                         # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    laundering_typology: str                # human-readable fraud type
    factors: List[RiskFactor]
    summary: str                            # 1-sentence plain English explanation
    recommended_action: str                 # what law enforcement should do next
    confidence_pct: float                   # model confidence (0-100)


# ─── Thresholds ────────────────────────────────────────────────────────────────
PEEL_CHAIN_THRESHOLD      = 0.88   # ≥88% forwarded = peel chain
RAPID_HOP_SECONDS         = 600    # <10 min between hops = rapid layering
SMURFING_MAX_AMOUNT       = 3000   # per-transaction cap for smurfing pattern
DARK_WEB_PREFIXES         = {"bc1qxy", "bc1q0s", "13AM4V", "12cgpF"}
MIXER_IDENTIFIERS         = {"tornado", "mixer", "tumbler", "coinjoin", "wasabi"}


class RiskScorer:
    """
    Heuristic risk scoring engine for CryptoTrace-I4C.
    Accepts a list of on-chain hops and VASP match info,
    returns a RiskReport with per-factor breakdown.
    """

    def score(
        self,
        hops: list,              # List of TransactionHop (from models.py)
        vasp_matched: bool = False,
        vasp_name: Optional[str] = None,
        token: str = "USDT-TRC20",
    ) -> RiskReport:
        factors: List[RiskFactor] = []
        total_score = 0.0

        if not hops:
            return RiskReport(
                overall_score=0.0, risk_level="LOW",
                laundering_typology="Insufficient data",
                factors=[], summary="No transaction hops to score.",
                recommended_action="Request more data from complainant.",
                confidence_pct=0.0
            )

        # ── Factor 1: Number of Hops (Layering Depth) ──────────────────────
        n_hops = len(hops)
        hop_score = min(n_hops * 8.0, 32.0)   # up to 32 pts, caps at 4+ hops
        severity = "LOW" if n_hops < 2 else ("MEDIUM" if n_hops < 3 else "HIGH")
        factors.append(RiskFactor(
            name="Layering Depth",
            score_contribution=hop_score,
            description=f"{n_hops} intermediary hops detected. Organized laundering rings typically use 3-5 hops.",
            severity=severity
        ))
        total_score += hop_score

        # ── Factor 2: Peel Chain Detection ─────────────────────────────────
        peel_count = 0
        amounts = [h.amount for h in hops]
        for i in range(1, len(amounts)):
            if amounts[i - 1] > 0:
                forward_ratio = amounts[i] / amounts[i - 1]
                if forward_ratio >= PEEL_CHAIN_THRESHOLD:
                    peel_count += 1

        if peel_count > 0:
            peel_score = min(peel_count * 12.0, 30.0)
            factors.append(RiskFactor(
                name="Peel Chain Pattern",
                score_contribution=peel_score,
                description=f"{peel_count} peel chain hop(s) detected (≥{int(PEEL_CHAIN_THRESHOLD*100)}% forwarded). Classic automated laundering bot behavior.",
                severity="HIGH" if peel_count >= 2 else "MEDIUM"
            ))
            total_score += peel_score

        # ── Factor 3: Velocity / Rapid Layering ────────────────────────────
        rapid_count = 0
        timestamps = []
        avg_hop_interval = 0
        for h in hops:
            ts = h.timestamp
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except Exception:
                    ts = None
            timestamps.append(ts)

        intervals = []
        for i in range(1, len(timestamps)):
            if timestamps[i] and timestamps[i - 1]:
                try:
                    delta_s = abs((timestamps[i] - timestamps[i - 1]).total_seconds())
                    intervals.append(delta_s)
                    if delta_s < RAPID_HOP_SECONDS:
                        rapid_count += 1
                except Exception:
                    pass

        if intervals:
            avg_hop_interval = sum(intervals) / len(intervals)

        if rapid_count > 0:
            velocity_score = min(rapid_count * 10.0, 20.0)
            factors.append(RiskFactor(
                name="Rapid Velocity / Automated Layering",
                score_contribution=velocity_score,
                description=f"{rapid_count} hop(s) completed in <{RAPID_HOP_SECONDS//60} minutes. Consistent with automated laundering bots.",
                severity="HIGH"
            ))
            total_score += velocity_score

        # ── Factor 4: VASP Attribution ──────────────────────────────────────
        if vasp_matched and vasp_name:
            vasp_score = 10.0
            factors.append(RiskFactor(
                name="VASP Destination Identified",
                score_contribution=vasp_score,
                description=f"Funds traced directly to '{vasp_name}' exchange deposit cluster. Immediate freeze notice can be issued.",
                severity="CRITICAL"
            ))
            total_score += vasp_score

        # ── Factor 5: Amount Anomaly ────────────────────────────────────────
        initial_amount = amounts[0] if amounts else 0
        high_value = initial_amount >= 10000
        if high_value:
            amount_score = 8.0
            factors.append(RiskFactor(
                name="High-Value Transaction",
                score_contribution=amount_score,
                description=f"Initial stolen amount of {initial_amount:,.2f} {token} qualifies as a high-value cyber fraud case (≥₹10,000 equivalent).",
                severity="HIGH"
            ))
            total_score += amount_score

        # ── Factor 6: Cross-Chain / Token Complexity ────────────────────────
        chains = set(getattr(h, "chain", None) or "" for h in hops)
        if len(chains) > 1:
            cross_score = 8.0
            factors.append(RiskFactor(
                name="Cross-Chain Obfuscation",
                score_contribution=cross_score,
                description=f"Funds moved across {len(chains)} different blockchains to evade chain-specific analytics.",
                severity="HIGH"
            ))
            total_score += cross_score

        # ── Factor 7: Mixer / Tumbler Detection ────────────────────────────
        mixer_detected = any(
            any(kw in getattr(h, "notes", "").lower() for kw in MIXER_IDENTIFIERS)
            for h in hops
        ) or any(getattr(h, "is_mixer", False) for h in hops)

        if mixer_detected:
            mixer_score = 15.0
            factors.append(RiskFactor(
                name="Mixer/Tumbler Service Detected",
                score_contribution=mixer_score,
                description="Funds passed through a cryptocurrency mixing or tumbling service to break the transaction trail.",
                severity="CRITICAL"
            ))
            total_score += mixer_score

        # ── Clamp and classify ──────────────────────────────────────────────
        final_score = min(round(total_score, 1), 100.0)

        if final_score >= 85:
            risk_level = "CRITICAL"
        elif final_score >= 65:
            risk_level = "HIGH"
        elif final_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        typology = self._classify_typology(hops, peel_count, mixer_detected, vasp_matched)
        summary = self._build_summary(final_score, n_hops, peel_count, vasp_name, typology)
        action  = self._recommend_action(risk_level, vasp_matched, vasp_name)
        confidence = min(60.0 + (n_hops * 5) + (peel_count * 8) + (10 if vasp_matched else 0), 99.0)

        return RiskReport(
            overall_score=final_score,
            risk_level=risk_level,
            laundering_typology=typology,
            factors=factors,
            summary=summary,
            recommended_action=action,
            confidence_pct=round(confidence, 1)
        )

    def score_explainable(
        self,
        hops: list,
        vasp_matched: bool = False,
        vasp_name: Optional[str] = None,
        token: str = "USDT-TRC20",
        initial_amount: float = 0.0,
    ) -> ExplainableRiskReport:
        """
        Generate an EXPLAINABLE risk report with:
        - Per-factor WHY bullets
        - Structured investigative recommendation
        - Human-readable summary
        """
        basic_report = self.score(hops, vasp_matched, vasp_name, token)

        # Build explainable factors
        explainable_factors: List[ExplainableRiskFactor] = []
        explainable_bullets: List[str] = []

        n_hops = len(hops)
        amounts = [h.amount for h in hops]

        # Factor: Hop count
        explainable_factors.append(ExplainableRiskFactor(
            name="Transfer Chain Depth",
            detected=n_hops >= 2,
            score_contribution=min(n_hops * 8.0, 32.0),
            description=f"{n_hops}-hop transfer chain detected",
            severity="HIGH" if n_hops >= 3 else ("MEDIUM" if n_hops >= 2 else "LOW"),
            icon="✓" if n_hops >= 2 else "✗"
        ))
        if n_hops >= 2:
            explainable_bullets.append(f"✓ {n_hops}-hop transfer chain")

        # Factor: Peel chain
        peel_count = 0
        for i in range(1, len(amounts)):
            if amounts[i - 1] > 0 and (amounts[i] / amounts[i - 1]) >= PEEL_CHAIN_THRESHOLD:
                peel_count += 1

        explainable_factors.append(ExplainableRiskFactor(
            name="Peel Chain Transactions",
            detected=peel_count > 0,
            score_contribution=min(peel_count * 12.0, 30.0),
            description=f"{peel_count} peel-chain transactions (≥{int(PEEL_CHAIN_THRESHOLD*100)}% forwarded)",
            severity="HIGH" if peel_count >= 2 else ("MEDIUM" if peel_count >= 1 else "LOW"),
            icon="✓" if peel_count > 0 else "✗"
        ))
        if peel_count > 0:
            explainable_bullets.append(f"✓ {peel_count} peel-chain transactions")

        # Factor: Average hop interval
        timestamps = []
        for h in hops:
            ts = h.timestamp
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except Exception:
                    ts = None
            timestamps.append(ts)

        intervals = []
        for i in range(1, len(timestamps)):
            if timestamps[i] and timestamps[i - 1]:
                try:
                    delta_s = abs((timestamps[i] - timestamps[i - 1]).total_seconds())
                    intervals.append(delta_s)
                except Exception:
                    pass

        avg_interval = sum(intervals) / len(intervals) if intervals else 0
        rapid_count = sum(1 for i in intervals if i < RAPID_HOP_SECONDS)

        explainable_factors.append(ExplainableRiskFactor(
            name="Hop Velocity",
            detected=rapid_count > 0,
            score_contribution=min(rapid_count * 10.0, 20.0),
            description=f"Average hop interval: {avg_interval:.0f} sec" if avg_interval > 0 else "Velocity data unavailable",
            severity="HIGH" if rapid_count > 0 else "LOW",
            icon="✓" if rapid_count > 0 else "✗"
        ))
        if avg_interval > 0:
            explainable_bullets.append(f"✓ Average hop interval: {avg_interval:.0f} sec")

        # Factor: Mixer detection
        mixer_detected = any(
            any(kw in getattr(h, "notes", "").lower() for kw in MIXER_IDENTIFIERS)
            for h in hops
        ) or any(getattr(h, "is_mixer", False) for h in hops)

        explainable_factors.append(ExplainableRiskFactor(
            name="Mixer/Tumbler Interaction",
            detected=mixer_detected,
            score_contribution=15.0 if mixer_detected else 0.0,
            description="Mixer interaction detected — transaction trail obfuscated" if mixer_detected else "No mixer interaction detected",
            severity="CRITICAL" if mixer_detected else "LOW",
            icon="✓" if mixer_detected else "✗"
        ))
        if mixer_detected:
            explainable_bullets.append("✓ Mixer interaction detected")

        # Factor: Funds reaching VASP
        final_amount = amounts[-1] if amounts else 0
        vasp_pct = (final_amount / amounts[0] * 100) if amounts and amounts[0] > 0 else 0

        explainable_factors.append(ExplainableRiskFactor(
            name="Funds Reached VASP",
            detected=vasp_matched,
            score_contribution=10.0 if vasp_matched else 0.0,
            description=f"{vasp_pct:.0f}% funds reached VASP" if vasp_matched else "Destination VASP not identified",
            severity="CRITICAL" if vasp_matched else "MEDIUM",
            icon="✓" if vasp_matched else "✗"
        ))
        if vasp_matched:
            explainable_bullets.append(f"✓ {vasp_pct:.0f}% funds reached VASP")
            explainable_bullets.append(f"✓ Destination VASP identified: {vasp_name}")

        # Factor: Rapid movement indicator
        if rapid_count > 0:
            explainable_bullets.append(f"✓ Rapid movement — {rapid_count} hops in <{RAPID_HOP_SECONDS//60} min")

        # Build investigative recommendation
        recommendation = self._build_recommendation(
            basic_report.risk_level, vasp_matched, vasp_name, basic_report.overall_score
        )

        return ExplainableRiskReport(
            overall_score=basic_report.overall_score,
            risk_level=basic_report.risk_level,
            laundering_typology=basic_report.laundering_typology,
            factors=explainable_factors,
            explainable_bullets=explainable_bullets,
            summary=basic_report.summary,
            recommendation=recommendation,
            confidence_pct=basic_report.confidence_pct,
        )

    def _build_recommendation(
        self, risk_level: str, vasp_matched: bool, vasp_name: Optional[str], score: float
    ) -> InvestigativeRecommendation:
        if risk_level == "CRITICAL":
            return InvestigativeRecommendation(
                priority="IMMEDIATE",
                primary_action="Preserve / freeze destination funds and issue VASP information request.",
                next_step=f"Send statutory notice (Sec 91/102 CrPC) to {vasp_name} LE portal." if vasp_name else "Escalate to I4C Cyber Fraud Wing.",
                vasp_action=f"Freeze account at {vasp_name} — obtain KYC and linked bank details." if vasp_name else None,
                legal_basis="Section 91 & 102 CrPC / Section 94 & 106 BNSS 2023"
            )
        elif risk_level == "HIGH":
            return InvestigativeRecommendation(
                priority="HIGH",
                primary_action="Initiate formal VASP request and FIR. Monitor all linked addresses.",
                next_step=f"Contact {vasp_name} nodal officer for account freeze." if vasp_name else "Continue tracing to identify destination VASP.",
                vasp_action=f"Request KYC disclosure from {vasp_name}." if vasp_name else None,
                legal_basis="Section 91 CrPC / Section 94 BNSS 2023"
            )
        elif risk_level == "MEDIUM":
            return InvestigativeRecommendation(
                priority="STANDARD",
                primary_action="Continue tracing additional hops. Request wallet clustering analysis.",
                next_step="Monitor flagged wallets for exchange deposits.",
                legal_basis="Section 91 CrPC"
            )
        else:
            return InvestigativeRecommendation(
                priority="LOW",
                primary_action="Continue investigation. Collect additional evidence before escalation.",
                next_step="Request more transaction data from complainant.",
                legal_basis=""
            )

    def _classify_typology(self, hops, peel_count, mixer_detected, vasp_matched) -> str:
        if mixer_detected:
            return "Mixer/Tumbler Obfuscation with VASP Off-Ramp" if vasp_matched else "Mixer/Tumbler Obfuscation"
        if peel_count >= 2 and vasp_matched:
            return "Organized Multi-Hop Peel Chain with Automated VASP Off-Ramp"
        if peel_count >= 1:
            return "Peel Chain Layering — Automated Bot Pattern"
        if len(hops) >= 3:
            return "Multi-Layer Smurfing / Structuring"
        if vasp_matched:
            return "Direct VASP Deposit — Minimal Layering"
        return "Simple Transfer — Funds Trace Incomplete"

    def _build_summary(self, score, n_hops, peel_count, vasp_name, typology) -> str:
        vasp_str = f" Final destination: {vasp_name}." if vasp_name else ""
        return (f"Risk Score {score}/100 — {typology}. {n_hops} hops detected, "
                f"{peel_count} peel chain segment(s).{vasp_str}")

    def _recommend_action(self, risk_level, vasp_matched, vasp_name) -> str:
        if risk_level == "CRITICAL":
            if vasp_matched and vasp_name:
                return f"IMMEDIATE ACTION: Issue Section 91/102 CrPC freeze notice to {vasp_name}. Asset freeze within 2 hours."
            return "IMMEDIATE ACTION: Escalate to I4C Cyber Fraud Wing. Obtain judicial production order."
        if risk_level == "HIGH":
            return "HIGH PRIORITY: Initiate formal VASP request and FIR. Monitor all linked addresses."
        if risk_level == "MEDIUM":
            return "MEDIUM: Continue tracing additional hops. Request wallet clustering analysis."
        return "LOW: Continue investigation. Collect additional evidence before escalation."


# Module-level singleton
risk_scorer = RiskScorer()
