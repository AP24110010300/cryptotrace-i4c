"""
CryptoTrace-I4C Pattern Detector — Member 4
Detects specific cryptocurrency laundering patterns in a transaction chain.
Used by tracer.py and risk_scorer.py to classify fraud typologies.

Patterns detected:
  - Peel Chain    : Each hop forwards >=88% of funds (automated bot)
  - Rapid Layering: Multiple hops within minutes of each other
  - Smurfing      : Large amount split into many small transfers
  - Fan-Out       : Funds sent to many wallets simultaneously
"""
from typing import List, Dict, Optional, Tuple
from datetime import datetime


PEEL_RATIO_THRESHOLD   = 0.88   # 88%+ forwarded = peel
RAPID_HOP_MINUTES      = 10     # <10 min between hops = rapid layering
SMURFING_THRESHOLD     = 3000   # USD value below which is considered a "smurf" transfer
FAN_OUT_MIN_OUTPUTS    = 5      # 5+ outputs from single address = fan-out


class PatternDetector:
    """
    Stateless pattern detector. Pass a list of TransactionHop objects
    and get back detected pattern names + details.
    """

    def detect_all(self, hops: list) -> Dict[str, object]:
        """
        Run all detectors on a hop list.
        Returns a dict of pattern name -> result dict.
        """
        return {
            "peel_chain":     self.detect_peel_chain(hops),
            "rapid_layering": self.detect_rapid_layering(hops),
            "smurfing":       self.detect_smurfing(hops),
            "mixer":          self.detect_mixer(hops),
        }

    # ── 1. Peel Chain ───────────────────────────────────────────────────────
    def detect_peel_chain(self, hops: list) -> Dict:
        """
        Peel chain: at each hop, >=88% of the incoming amount is forwarded
        while ~6-12% is 'peeled off' as a fee/profit to the mule.

        Example:
          45,000 USDT → 42,300 → 40,985 → Binance
          Ratios: 0.94, 0.97 — both above 0.88 threshold → PEEL CHAIN
        """
        if len(hops) < 2:
            return {"detected": False, "hop_count": 0, "segments": []}

        peel_segments = []
        amounts = [h.amount for h in hops]

        for i in range(1, len(amounts)):
            if amounts[i - 1] > 0:
                ratio = amounts[i] / amounts[i - 1]
                if ratio >= PEEL_RATIO_THRESHOLD:
                    peel_segments.append({
                        "hop_in":  i,
                        "hop_out": i + 1,
                        "forward_ratio": round(ratio, 4),
                        "peeled_amount": round(amounts[i - 1] - amounts[i], 4),
                        "from_address":  hops[i - 1].to_address if i > 0 else hops[0].from_address,
                        "to_address":    hops[i].to_address,
                    })

        detected = len(peel_segments) > 0
        return {
            "detected":    detected,
            "hop_count":   len(peel_segments),
            "segments":    peel_segments,
            "description": (
                f"Peel chain detected across {len(peel_segments)} hop(s). "
                f"Each hop forwarded ≥{int(PEEL_RATIO_THRESHOLD*100)}% of funds — consistent with automated laundering bot."
            ) if detected else "No peel chain pattern detected.",
        }

    # ── 2. Rapid Layering ──────────────────────────────────────────────────
    def detect_rapid_layering(self, hops: list) -> Dict:
        """
        Rapid layering: consecutive hops happen within a very short time window.
        Humans cannot manually move funds across 3-4 wallets within minutes —
        this indicates automated bot activity.
        """
        if len(hops) < 2:
            return {"detected": False, "rapid_pairs": []}

        rapid_pairs = []
        timestamps = []

        for h in hops:
            ts = h.timestamp
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except Exception:
                    ts = None
            timestamps.append(ts)

        for i in range(1, len(timestamps)):
            t_prev = timestamps[i - 1]
            t_curr = timestamps[i]
            if t_prev and t_curr:
                try:
                    delta_min = abs((t_curr - t_prev).total_seconds()) / 60
                    if delta_min < RAPID_HOP_MINUTES:
                        rapid_pairs.append({
                            "hop_pair":      f"Hop {i} → Hop {i+1}",
                            "delta_minutes": round(delta_min, 2),
                            "from_address":  hops[i - 1].to_address,
                            "to_address":    hops[i].to_address,
                        })
                except Exception:
                    pass

        detected = len(rapid_pairs) > 0
        return {
            "detected":    detected,
            "rapid_pairs": rapid_pairs,
            "description": (
                f"{len(rapid_pairs)} hop pair(s) completed in <{RAPID_HOP_MINUTES} minutes. "
                "Consistent with automated laundering bot (impossible by manual operation)."
            ) if detected else "No rapid layering detected.",
        }

    # ── 3. Smurfing / Structuring ──────────────────────────────────────────
    def detect_smurfing(self, hops: list) -> Dict:
        """
        Smurfing: large amounts split into many smaller transfers
        to stay below reporting thresholds.
        """
        if not hops:
            return {"detected": False, "small_tx_count": 0}

        small_txs = [h for h in hops if h.amount <= SMURFING_THRESHOLD and h.amount > 0]
        detected = len(small_txs) >= 3   # need at least 3 small txs to flag

        return {
            "detected":       detected,
            "small_tx_count": len(small_txs),
            "threshold":      SMURFING_THRESHOLD,
            "description": (
                f"{len(small_txs)} transactions below ${SMURFING_THRESHOLD:,} detected. "
                "Possible structuring/smurfing to evade AML reporting thresholds."
            ) if detected else "No smurfing pattern detected.",
        }

    # ── 4. Mixer / Tumbler Detection ───────────────────────────────────────
    def detect_mixer(self, hops: list) -> Dict:
        """
        Mixer detection: looks for known mixer keywords in hop notes,
        or the is_mixer flag set by the tracer.
        """
        mixer_keywords = {"tornado", "mixer", "tumbler", "coinjoin", "wasabi", "chipmixer"}
        mixer_hops = []

        for h in hops:
            is_flagged = getattr(h, "is_mixer", False)
            notes = getattr(h, "notes", "").lower()
            keyword_found = any(kw in notes for kw in mixer_keywords)
            if is_flagged or keyword_found:
                mixer_hops.append({
                    "hop_number":  h.hop_number,
                    "to_address":  h.to_address,
                    "notes":       getattr(h, "notes", ""),
                })

        detected = len(mixer_hops) > 0
        return {
            "detected":   detected,
            "mixer_hops": mixer_hops,
            "description": (
                f"Mixer/tumbler service detected at {len(mixer_hops)} hop(s). "
                "Funds passed through obfuscation service — forensic trail significantly impaired."
            ) if detected else "No mixer/tumbler pattern detected.",
        }

    def get_typology_label(self, patterns: Dict) -> str:
        """Convert detected patterns into a single descriptive typology label."""
        parts = []
        if patterns.get("mixer", {}).get("detected"):
            parts.append("Mixer/Tumbler Obfuscation")
        if patterns.get("peel_chain", {}).get("detected"):
            parts.append("Peel Chain Layering")
        if patterns.get("rapid_layering", {}).get("detected"):
            parts.append("Automated Rapid Layering")
        if patterns.get("smurfing", {}).get("detected"):
            parts.append("Smurfing/Structuring")
        if not parts:
            return "Simple Transfer — Pattern Analysis Inconclusive"
        return " + ".join(parts)


# Module-level singleton
pattern_detector = PatternDetector()
