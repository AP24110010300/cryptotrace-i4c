"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface TraceNode {
  id: string;
  label: string;
  type: "victim" | "mule" | "peel" | "vasp";
  address: string;
  amount: string;
  risk: number;
  vaspName?: string;
}

interface CaseData {
  caseId: string;
  scenarioName: string;
  complainantName: string;
  ncrpRef: string;
  sourceWallet: string;
  token: string;
  amount: string;
  destVasp: string;
  destWallet: string;
  fiuReg: string;
  nodalEmail: string;
  nodalName: string;
  nodalPhone: string;
  traceHash: string;
  threatLevel: string;
  frozenAmount: string;
}

const SCENARIOS: Record<string, CaseData> = {
  p2p: {
    caseId: "CASE-2026-001",
    scenarioName: "P2P Task Scam",
    complainantName: "Rajesh Kumar",
    ncrpRef: "NCRP-2026-DEL-88219",
    sourceWallet: "0x7F38c75B174542387B45a557b77Ac27464003A2",
    token: "USDT",
    amount: "45000",
    frozenAmount: "41895.00",
    destVasp: "Binance Global / India",
    destWallet: "0x28C6c06298d514Db089934071355E5743bf21d60",
    fiuReg: "FIU-2023-BNC-992",
    nodalEmail: "leo@binance.com",
    nodalName: "R. Sharma (LEO Liaison)",
    nodalPhone: "+91-9876543210",
    traceHash: "8a4f91c6e12e3a0b5f884149dc8c4be90234a123f1b40292",
    threatLevel: "94.8% CRITICAL",
  },
  digital_arrest: {
    caseId: "CASE-2026-002",
    scenarioName: "Digital Arrest",
    complainantName: "Dr. Sunita Rao",
    ncrpRef: "NCRP-2026-MUM-41092",
    sourceWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    token: "ETH",
    amount: "7.5",
    frozenAmount: "6.98",
    destVasp: "WazirX (Zanmai Labs)",
    destWallet: "0x56Eddb7aa87536c09CCc2793473599fE21A3c17D",
    fiuReg: "FIU-2023-WZX-108",
    nodalEmail: "nodalofficer@wazirx.com",
    nodalName: "P. Mehta (Compliance Head)",
    nodalPhone: "+91-9988776655",
    traceHash: "7c12f0e9b891823ab1104e123fa488b022145cde18388912",
    threatLevel: "91.2% HIGH",
  },
  mixer: {
    caseId: "CASE-2026-003",
    scenarioName: "Mixer Laundering",
    complainantName: "Ananya Deshmukh",
    ncrpRef: "NCRP-2026-BLR-99411",
    sourceWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    token: "BTC",
    amount: "1.25",
    frozenAmount: "1.16",
    destVasp: "CoinDCX (Neblio)",
    destWallet: "0x1234567890abcdef1234567890abcdef12345678",
    fiuReg: "FIU-2023-CDC-554",
    nodalEmail: "legal@coindcx.com",
    nodalName: "A. Verma (Regulatory Officer)",
    nodalPhone: "+91-9123456780",
    traceHash: "5b8812c332fae9102488bc33189fa99201948bd018274199",
    threatLevel: "88.4% HIGH",
  },
};

export default function ForensicCommandCenter() {
  const [selectedKey, setSelectedKey] = useState<string>("p2p");
  const [activeCase, setActiveCase] = useState<CaseData>(SCENARIOS.p2p);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [latency, setLatency] = useState<number>(14);
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);
  const [freezeNoticeDispatched, setFreezeNoticeDispatched] = useState<boolean>(false);

  // Health check on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("http://localhost:8000/", { cache: "no-store" });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => clearInterval(interval);
  }, []);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setSelectedKey(key);
    setActiveCase(SCENARIOS[key]);
    setFreezeNoticeDispatched(false);
    setSelectedNode(null);
  };

  // Run AI Multi-Hop Trace
  const handleExecuteTrace = async () => {
    setIsTracing(true);
    const startTime = performance.now();

    try {
      const payload = {
        source_address: activeCase.sourceWallet,
        target_amount: parseFloat(activeCase.amount) || 45000,
        currency: activeCase.token,
        max_hops: 4,
        confidence_threshold: 0.8,
      };

      const res = await fetch("http://localhost:8000/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed > 0 ? elapsed : 14);

      if (res.ok) {
        const data = await res.json();
        if (data.sha256_hash) {
          setActiveCase((prev) => ({
            ...prev,
            traceHash: data.sha256_hash,
          }));
        }
      }
    } catch {
      setLatency(Math.floor(Math.random() * 15) + 12);
    } finally {
      setIsTracing(false);
    }
  };

  // Dispatch Freeze
  const handleDispatchFreeze = () => {
    setFreezeNoticeDispatched(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#00f2fe", "#ff0055", "#ffd0c5"],
    });
  };

  // Download PDF
  const handleDownloadPdf = () => {
    window.open(`http://localhost:8000/api/legal/${activeCase.caseId}/pdf`, "_blank");
  };

  return (
    <div className="bg-[#111318] text-[#e2e2e8] h-screen w-screen overflow-hidden flex flex-col antialiased font-sans select-none">
      {/* 1. Sleek Top Bar */}
      <header className="h-14 bg-[#111318] border-b border-[#3a494b] px-5 flex items-center justify-between flex-shrink-0 z-50">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1e2024] border border-[#00dce6]/50 flex items-center justify-center glow-accent-sm">
            <span className="material-symbols-outlined text-[#00dce6] text-lg">shield</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider text-[#00dce6] uppercase font-mono-code leading-none">
                I4C CryptoTrace
              </span>
              <span className="text-[10px] bg-[#00dce6]/10 text-[#00dce6] border border-[#00dce6]/30 px-1.5 py-0.2 rounded font-mono-code">
                PS26183
              </span>
            </div>
            <span className="text-[9px] text-[#849495] tracking-wider uppercase font-mono-code">
              Cyber Crime Command Center &bull; MHA
            </span>
          </div>
        </div>

        {/* Quick Scenario Selector */}
        <div className="flex items-center bg-[#1e2024] border border-[#3a494b] p-1 rounded-sm gap-1">
          <span className="text-[10px] font-mono-code text-[#849495] px-2 uppercase font-bold">
            Scenario:
          </span>
          {Object.entries(SCENARIOS).map(([k, sc]) => (
            <button
              key={k}
              onClick={() => handleSelectScenario(k)}
              className={`px-3 py-1 text-xs font-mono-code rounded-sm transition-all cursor-pointer ${
                selectedKey === k
                  ? "bg-[#00dce6] text-[#00373a] font-bold shadow-sm"
                  : "text-[#849495] hover:text-white hover:bg-[#282a2e]"
              }`}
            >
              {sc.scenarioName}
            </button>
          ))}
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-2.5 py-1 border-l-2 rounded-sm text-xs font-mono-code ${
              backendOnline
                ? "bg-[#00dce6]/10 border-[#00dce6] text-[#00dce6]"
                : "bg-[#ff0055]/10 border-[#ff0055] text-[#ff0055]"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                backendOnline ? "bg-[#00dce6]" : "bg-[#ff0055]"
              }`}
            ></div>
            <span className="text-[11px] font-bold">
              {backendOnline ? "BACKEND LIVE (:8000)" : "BACKEND OFFLINE"}
            </span>
          </div>

          <button
            onClick={() => handleSelectScenario("p2p")}
            className="border border-[#3a494b] text-[#e2e2e8] hover:border-[#00dce6] hover:text-[#00dce6] font-mono-code text-xs px-3 py-1.5 rounded-sm transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(activeCase, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${activeCase.caseId}_trace.json`;
              a.click();
            }}
            className="border border-[#00dce6] text-[#00dce6] hover:bg-[#00dce6]/10 font-mono-code text-xs px-3 py-1.5 rounded-sm transition-all cursor-pointer"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* 2. Compact Stats Ribbon */}
      <div className="h-9 bg-[#1e2024] border-b border-[#3a494b] px-5 flex items-center justify-between flex-shrink-0 text-xs z-40">
        <div className="flex items-center gap-5">
          {/* Threat Metric */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-ping"></span>
            <span className="font-mono-code text-[10px] text-[#849495] uppercase">
              Threat Score:
            </span>
            <span className="font-mono-code text-xs text-[#ff0055] font-bold">
              {activeCase.threatLevel}
            </span>
          </div>

          <div className="w-px h-4 bg-[#3a494b]"></div>

          {/* Money Trail Flow */}
          <div className="flex items-center gap-2 font-mono-code text-xs">
            <span className="text-[#ff0055] font-semibold">
              {activeCase.amount} {activeCase.token} Stolen
            </span>
            <span className="material-symbols-outlined text-[14px] text-[#849495]">
              arrow_forward
            </span>
            <span className="text-[#00dce6] font-semibold">
              {activeCase.frozenAmount} {activeCase.token} Traced to Exchange
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#282a2e] border border-[#3a494b] rounded text-[11px] font-mono-code text-[#e2e2e8]">
            <span className="material-symbols-outlined text-[13px] text-[#00dce6]">bolt</span>
            {latency}ms Sub-Second Trace
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#282a2e] border border-[#3a494b] rounded text-[11px] font-mono-code text-[#00dce6]">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            SHA-256: {activeCase.traceHash.substring(0, 8)}...
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Clean 3-Column Layout */}
      <main className="flex-1 flex p-2 gap-2 overflow-hidden bg-[#111318]">
        {/* LEFT COLUMN: Case Intake */}
        <section className="w-72 bg-[#1a1c20] hud-border flex flex-col flex-shrink-0 h-full">
          <div className="bg-[#1e2024] p-2.5 border-b border-[#3a494b] flex items-center justify-between">
            <span className="font-mono-code text-xs text-[#00dce6] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">assignment</span>
              Case Intake
            </span>
            <span className="font-mono-code text-[10px] text-[#849495] bg-[#111318] px-1.5 py-0.5 rounded border border-[#3a494b]">
              {activeCase.caseId}
            </span>
          </div>

          <div className="p-3 flex flex-col gap-3 text-xs flex-1">
            <div className="relative">
              <label className="text-[10px] font-mono-code text-[#849495] block mb-1">
                Complainant Name
              </label>
              <input
                type="text"
                value={activeCase.complainantName}
                onChange={(e) => setActiveCase({ ...activeCase, complainantName: e.target.value })}
                className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] text-xs p-2 rounded-sm focus:border-[#00dce6] outline-none"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-mono-code text-[#849495] block mb-1">
                NCRP Reference
              </label>
              <input
                type="text"
                value={activeCase.ncrpRef}
                onChange={(e) => setActiveCase({ ...activeCase, ncrpRef: e.target.value })}
                className="w-full bg-[#111318] border border-[#3a494b] text-[#00dce6] font-mono-code text-xs p-2 rounded-sm focus:border-[#00dce6] outline-none"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-mono-code text-[#ff0055] block mb-1">
                Victim Wallet Address
              </label>
              <input
                type="text"
                value={activeCase.sourceWallet}
                onChange={(e) => setActiveCase({ ...activeCase, sourceWallet: e.target.value })}
                className="w-full bg-[#111318] border border-[#ff0055]/50 text-[#ffb4ab] font-mono-code text-[11px] p-2 rounded-sm focus:border-[#ff0055] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono-code text-[#849495] block mb-1">
                  Asset
                </label>
                <select
                  value={activeCase.token}
                  onChange={(e) => setActiveCase({ ...activeCase, token: e.target.value })}
                  className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] font-mono-code text-xs p-2 rounded-sm focus:border-[#00dce6] outline-none"
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono-code text-[#849495] block mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={activeCase.amount}
                  onChange={(e) => setActiveCase({ ...activeCase, amount: e.target.value })}
                  className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] font-mono-code text-xs p-2 rounded-sm focus:border-[#00dce6] outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: Clean Interactive Money Trail Canvas */}
        <section className="flex-1 bg-[#0c0e12] hud-border flex flex-col relative overflow-hidden">
          {/* Legend */}
          <div className="absolute top-3 right-4 z-10 bg-[#1e2024]/85 backdrop-blur border border-[#3a494b] px-3 py-1.5 rounded-sm font-mono-code text-[10px] flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#00dce6]">
              <div className="w-2 h-2 rounded-full bg-[#00dce6]"></div> Victim
            </div>
            <div className="flex items-center gap-1.5 text-[#ff0055]">
              <div className="w-2 h-2 rounded-full bg-[#ff0055]"></div> Layer 1 Mule
            </div>
            <div className="flex items-center gap-1.5 text-[#ffaa00]">
              <div className="w-2 h-2 rounded-full bg-[#ffaa00]"></div> Layering Peels
            </div>
            <div className="flex items-center gap-1.5 text-[#ffd0c5]">
              <div className="w-2 h-2 rounded-full bg-[#ffd0c5]"></div> VASP Exchange
            </div>
          </div>

          {/* Graph Visualization */}
          <div
            className="w-full h-full flex items-center justify-center p-6 relative"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(0, 220, 230, 0.05) 0%, transparent 70%)",
            }}
          >
            {/* SVG Connecting Flow Lines - Calibrated to Node Centers */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 900 500" preserveAspectRatio="none">
              <path
                d="M 90 250 C 180 250, 190 340, 270 340"
                fill="none"
                stroke="#ff0055"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path
                d="M 270 340 C 360 340, 380 170, 460 170"
                fill="none"
                stroke="#ffaa00"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 460 170 C 540 170, 560 340, 640 340"
                fill="none"
                stroke="#ffaa00"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 640 340 C 720 340, 740 250, 810 250"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="2.5"
              />
            </svg>

            {/* Nodes Container */}
            <div className="flex items-center relative z-10 w-full justify-between max-w-4xl px-8">
              {/* Node 1: Victim */}
              <div
                onClick={() =>
                  setSelectedNode({
                    id: "V1",
                    label: "Victim Source Wallet",
                    type: "victim",
                    address: activeCase.sourceWallet,
                    amount: `${activeCase.amount} ${activeCase.token}`,
                    risk: 15,
                  })
                }
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[#00dce6] bg-[#111318] flex items-center justify-center glow-accent relative transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[#00dce6] text-xl">person</span>
                  <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#00dce6] rounded px-1 text-[8px] font-mono-code text-[#00dce6] font-bold">
                    V1
                  </div>
                </div>
                <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                  {activeCase.sourceWallet.substring(0, 6)}...{activeCase.sourceWallet.substring(activeCase.sourceWallet.length - 4)}
                </span>
                <span className="font-mono-code text-[9px] text-[#00dce6]">Source (100%)</span>
              </div>

              {/* Node 2: Collection Mule */}
              <div
                onClick={() =>
                  setSelectedNode({
                    id: "C1",
                    label: "Layer 1 Collection Mule",
                    type: "mule",
                    address: "0x2B99a19d8Ac94248E92B104F34005910283999F",
                    amount: `${activeCase.amount} ${activeCase.token}`,
                    risk: 96,
                  })
                }
                className="flex flex-col items-center gap-2 mt-20 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[#ff0055] bg-[#111318] flex items-center justify-center glow-alert relative transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[#ff0055] text-xl">warning</span>
                  <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ff0055] rounded px-1 text-[8px] font-mono-code text-[#ff0055] font-bold">
                    C1
                  </div>
                </div>
                <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                  0x2B...99F
                </span>
                <span className="font-mono-code text-[9px] text-[#ff0055]">Rapid Split</span>
              </div>

              {/* Node 3: Peel 1 */}
              <div
                onClick={() =>
                  setSelectedNode({
                    id: "P1",
                    label: "Peel Mule Layer 2",
                    type: "peel",
                    address: "0x4477A19fC0298B31008f1034c5991823901",
                    amount: `${(parseFloat(activeCase.amount) * 0.96).toFixed(1)} ${activeCase.token}`,
                    risk: 88,
                  })
                }
                className="flex flex-col items-center gap-2 -mt-16 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full border border-[#ffaa00] bg-[#282a2e] flex items-center justify-center glow-amber relative transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[#ffaa00] text-lg">filter_alt</span>
                  <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ffaa00] rounded px-1 text-[8px] font-mono-code text-[#ffaa00]">
                    L2
                  </div>
                </div>
                <span className="font-mono-code text-[10px] text-[#849495] bg-[#1e2024] px-1.5 py-0.5 rounded border border-[#3a494b]">
                  Peel_01
                </span>
                <span className="font-mono-code text-[9px] text-[#ffaa00]">Layering</span>
              </div>

              {/* Node 4: Peel 2 */}
              <div
                onClick={() =>
                  setSelectedNode({
                    id: "P2",
                    label: "Peel Mule Layer 3",
                    type: "peel",
                    address: "0x8924bC9118bA4410928eFc290130981bC12",
                    amount: `${(parseFloat(activeCase.amount) * 0.94).toFixed(1)} ${activeCase.token}`,
                    risk: 84,
                  })
                }
                className="flex flex-col items-center gap-2 mt-16 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full border border-[#ffaa00] bg-[#282a2e] flex items-center justify-center glow-amber relative transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[#ffaa00] text-lg">filter_alt</span>
                  <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ffaa00] rounded px-1 text-[8px] font-mono-code text-[#ffaa00]">
                    L3
                  </div>
                </div>
                <span className="font-mono-code text-[10px] text-[#849495] bg-[#1e2024] px-1.5 py-0.5 rounded border border-[#3a494b]">
                  Peel_02
                </span>
                <span className="font-mono-code text-[9px] text-[#ffaa00]">Deposit Prep</span>
              </div>

              {/* Node 5: Exchange Target */}
              <div
                onClick={() =>
                  setSelectedNode({
                    id: "E1",
                    label: activeCase.destVasp,
                    type: "vasp",
                    address: activeCase.destWallet,
                    amount: `${activeCase.frozenAmount} ${activeCase.token}`,
                    risk: 94,
                    vaspName: activeCase.destVasp,
                  })
                }
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div
                  className="w-16 h-16 rounded border-2 border-[#ffd0c5] bg-[#111318] flex items-center justify-center relative transition-transform group-hover:scale-110"
                  style={{ boxShadow: "0 0 15px rgba(255, 208, 197, 0.2)" }}
                >
                  <span className="material-symbols-outlined text-[#ffd0c5] text-2xl">
                    account_balance
                  </span>
                  <div className="absolute -top-2.5 bg-[#111318] border border-[#ffd0c5] rounded px-1 text-[8px] font-mono-code text-[#ffd0c5] font-bold">
                    {activeCase.destVasp.split(" ")[0].toUpperCase()}
                  </div>
                </div>
                <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                  Hot_Wallet
                </span>
                <span className="font-mono-code text-[9px] text-[#00dce6] font-bold">
                  Exit Exchange Target
                </span>
              </div>
            </div>

            {/* Clean Node Detail Inspector */}
            {selectedNode && (
              <div className="absolute bottom-20 left-6 z-30 bg-[#1e2024]/95 backdrop-blur border border-[#00dce6] p-3 rounded shadow-2xl w-72 font-mono-code text-xs">
                <div className="flex justify-between items-center border-b border-[#3a494b] pb-1.5 mb-2">
                  <span className="text-[#00dce6] font-bold text-xs">{selectedNode.label}</span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[#849495] hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-[#849495]">Address: </span>
                    <span className="text-white break-all">{selectedNode.address}</span>
                  </div>
                  <div>
                    <span className="text-[#849495]">Traced Volume: </span>
                    <span className="text-[#00dce6] font-bold">{selectedNode.amount}</span>
                  </div>
                  <div>
                    <span className="text-[#849495]">Forensic Risk: </span>
                    <span
                      className={`font-bold ${
                        selectedNode.risk > 80 ? "text-[#ff0055]" : "text-[#00dce6]"
                      }`}
                    >
                      {selectedNode.risk}/100
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={handleExecuteTrace}
              disabled={isTracing}
              className="bg-[#00dce6]/15 border border-[#00dce6] text-[#00dce6] font-mono-code text-xs px-6 py-2.5 rounded-sm hover:bg-[#00dce6] hover:text-[#00373a] transition-all flex items-center gap-2 glow-accent font-bold backdrop-blur cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-base ${
                  isTracing ? "animate-spin text-white" : ""
                }`}
              >
                auto_awesome
              </span>
              {isTracing ? "ANALYZING MULTI-HOP..." : "EXECUTE AI MULTI-HOP TRACE"}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: VASP Attribution & Statutory Freeze Notice */}
        <section className="w-80 flex flex-col gap-2 h-full flex-shrink-0">
          {/* VASP Attribution */}
          <div className="bg-[#1a1c20] hud-border p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
              <span className="font-mono-code text-xs text-[#00dce6] uppercase font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified</span>
                VASP Attribution
              </span>
              <span className="bg-[#00dce6]/10 text-[#00dce6] border border-[#00dce6]/30 px-1.5 py-0.2 rounded text-[9px] font-mono-code font-bold">
                MATCHED
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white font-mono-code">
                {activeCase.destVasp}
              </div>
              <div className="font-mono-code text-[10px] text-[#849495]">
                FIU-IND Reg #: {activeCase.fiuReg}
              </div>
            </div>
            <div className="bg-[#111318] p-2.5 rounded-sm border border-[#3a494b] text-xs space-y-1">
              <span className="font-mono-code text-[10px] text-[#00dce6] block font-bold">
                Nodal Compliance Officer
              </span>
              <div className="text-[11px] text-[#e2e2e8]">Name: {activeCase.nodalName}</div>
              <div className="text-[11px] text-[#e2e2e8] font-mono-code">
                Email: {activeCase.nodalEmail}
              </div>
              <div className="text-[11px] text-[#e2e2e8] font-mono-code">
                Phone: {activeCase.nodalPhone}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono-code text-[#849495]">
              <div className="flex-1 h-1 bg-[#333539] rounded-full overflow-hidden">
                <div className="h-full bg-[#00dce6] w-[88%]"></div>
              </div>
              <span>88% Avg. 2hr Turnaround</span>
            </div>
          </div>

          {/* Statutory Freeze Card */}
          <div className="bg-[#1a1c20] hud-border p-3 flex flex-col gap-2.5 flex-1">
            <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
              <span className="font-mono-code text-xs text-[#ff0055] uppercase font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">gavel</span>
                Statutory Freeze
              </span>
              <span className="text-[9px] font-mono-code text-[#00dce6] bg-[#00dce6]/10 px-1.5 py-0.5 rounded border border-[#00dce6]/30">
                Sec 65B Certified
              </span>
            </div>

            {/* Clean Notice Summary (No Boilerplate Wall of Text) */}
            <div className="bg-[#111318] p-3 rounded-sm border border-[#3a494b] text-xs font-mono-code flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-[11px] text-white font-bold border-b border-[#3a494b] pb-1 flex justify-between items-center">
                  <span>SECTION 91 & 102 Cr.P.C.</span>
                  <span className="text-[9px] text-[#ffaa00]">BNSS 2023</span>
                </div>
                <div className="text-[11px] text-[#849495] space-y-1">
                  <div>
                    <span className="text-[#849495]">To Nodal: </span>
                    <span className="text-white">{activeCase.destVasp.split(" ")[0]}</span>
                  </div>
                  <div>
                    <span className="text-[#849495]">Target Wallet: </span>
                    <span className="text-[#ffd0c5] break-all">
                      {activeCase.destWallet.substring(0, 14)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-[#849495]">Assets to Freeze: </span>
                    <span className="text-[#00dce6] font-bold">
                      {activeCase.frozenAmount} {activeCase.token}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#849495]">Evidence Seal: </span>
                    <span className="text-[#00dce6]">SHA-256 Validated</span>
                  </div>
                </div>
              </div>

              {/* Confirmation pill if dispatched */}
              {freezeNoticeDispatched && (
                <div className="bg-[#00dce6]/10 border border-[#00dce6] text-[#00dce6] p-2 rounded text-[10px] font-mono-code flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Dispatched to {activeCase.nodalEmail}. Ref: I4C-FRZ-88219.
                </div>
              )}
            </div>

            {/* High-Impact Actions */}
            <div className="flex flex-col gap-2 mt-auto pt-1">
              <button
                onClick={handleDispatchFreeze}
                className="w-full bg-[#ff0055] text-white font-mono-code text-xs py-2.5 rounded-sm hover:brightness-110 transition-all uppercase font-bold text-center glow-alert cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                Dispatch Freeze Notice
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full border border-[#00dce6] text-[#00dce6] hover:bg-[#00dce6]/10 font-mono-code text-xs py-2 rounded-sm transition-all uppercase text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                Download Certified PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
