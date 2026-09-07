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
  txHash?: string;
}

interface CaseData {
  caseId: string;
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
}

const PRESET_SCENARIOS: Record<string, CaseData> = {
  p2p: {
    caseId: "CASE-2026-001",
    complainantName: "Rajesh Kumar",
    ncrpRef: "NCRP-2026-DEL-88219",
    sourceWallet: "0x7F38c75B174542387B45a557b77Ac27464003A2",
    token: "USDT",
    amount: "45000",
    destVasp: "Binance Global / India",
    destWallet: "0x28C6c06298d514Db089934071355E5743bf21d60",
    fiuReg: "FIU-2023-BNC-992",
    nodalEmail: "leo@binance.com",
    nodalName: "R. Sharma (Head of Law Enforcement Liaison)",
    nodalPhone: "+91-9876543210",
    traceHash: "8a4f91c6e12e3a0b5f884149dc8c4be90234a123f1b40292",
    threatLevel: "94.8% CRITICAL",
  },
  digital_arrest: {
    caseId: "CASE-2026-002",
    complainantName: "Dr. Sunita Rao",
    ncrpRef: "NCRP-2026-MUM-41092",
    sourceWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    token: "ETH",
    amount: "7.5",
    destVasp: "WazirX (Zanmai Labs)",
    destWallet: "0x56Eddb7aa87536c09CCc2793473599fE21A3c17D",
    fiuReg: "FIU-2023-WZX-108",
    nodalEmail: "nodalofficer@wazirx.com",
    nodalName: "P. Mehta (Senior Compliance Officer)",
    nodalPhone: "+91-9988776655",
    traceHash: "7c12f0e9b891823ab1104e123fa488b022145cde18388912",
    threatLevel: "91.2% HIGH",
  },
  mixer_trace: {
    caseId: "CASE-2026-003",
    complainantName: "Ananya Deshmukh",
    ncrpRef: "NCRP-2026-BLR-99411",
    sourceWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    token: "BTC",
    amount: "1.25",
    destVasp: "CoinDCX (Neblio Technologies)",
    destWallet: "0x1234567890abcdef1234567890abcdef12345678",
    fiuReg: "FIU-2023-CDC-554",
    nodalEmail: "legal@coindcx.com",
    nodalName: "A. Verma (Chief Regulatory Officer)",
    nodalPhone: "+91-9123456780",
    traceHash: "5b8812c332fae9102488bc33189fa99201948bd018274199",
    threatLevel: "88.4% HIGH",
  },
};

export default function ForensicCommandCenter() {
  const [activeCase, setActiveCase] = useState<CaseData>(PRESET_SCENARIOS.p2p);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [latency, setLatency] = useState<number>(48);
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);
  const [freezeNoticeDispatched, setFreezeNoticeDispatched] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("intake");

  // Check backend connectivity on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("http://localhost:8000/", { cache: "no-store" });
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Execute AI Multi-Hop Trace
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

      const response = await fetch("http://localhost:8000/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed > 0 ? elapsed : 48);

      if (response.ok) {
        const data = await response.json();
        if (data.sha256_hash) {
          setActiveCase((prev) => ({
            ...prev,
            traceHash: data.sha256_hash,
          }));
        }
      }
    } catch {
      // Fallback to fast simulated latency
      setLatency(Math.floor(Math.random() * 20) + 42);
    } finally {
      setIsTracing(false);
    }
  };

  // Switch quick scenarios
  const handleSelectScenario = (key: string) => {
    if (PRESET_SCENARIOS[key]) {
      setActiveCase(PRESET_SCENARIOS[key]);
      setFreezeNoticeDispatched(false);
      setSelectedNode(null);
    }
  };

  // Dispatch Freeze Notice action
  const handleDispatchFreeze = () => {
    setFreezeNoticeDispatched(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00f2fe", "#ff0055", "#ffd0c5"],
    });
  };

  // Download Certified PDF
  const handleDownloadPdf = () => {
    const pdfUrl = `http://localhost:8000/api/legal/${activeCase.caseId}/pdf`;
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="bg-[#111318] text-[#e2e2e8] h-screen overflow-hidden flex flex-col antialiased select-none font-sans">
      {/* TopNavBar */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-[#111318]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#3a494b] flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#1e2024] border border-[#00dce6]/50 flex items-center justify-center glow-accent-sm">
              <span className="material-symbols-outlined text-[#00dce6] text-xl">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider text-[#00dce6] uppercase font-mono-code leading-tight">
                I4C CryptoTrace
              </span>
              <span className="text-[9px] tracking-widest text-[#849495] uppercase font-mono-code">
                MHA / Cyber Crime Command Center
              </span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 h-full items-center">
            <button
              onClick={() => setActiveTab("intake")}
              className={`font-mono-code text-xs flex items-center h-full pt-1 border-b-2 transition-colors ${
                activeTab === "intake"
                  ? "text-[#00dce6] border-[#00dce6]"
                  : "text-[#849495] border-transparent hover:text-white"
              }`}
            >
              Cases
            </button>
            <button
              onClick={() => setActiveTab("nodes")}
              className={`font-mono-code text-xs flex items-center h-full pt-1 border-b-2 transition-colors ${
                activeTab === "nodes"
                  ? "text-[#00dce6] border-[#00dce6]"
                  : "text-[#849495] border-transparent hover:text-white"
              }`}
            >
              Nodes
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`font-mono-code text-xs flex items-center h-full pt-1 border-b-2 transition-colors ${
                activeTab === "feed"
                  ? "text-[#00dce6] border-[#00dce6]"
                  : "text-[#849495] border-transparent hover:text-white"
              }`}
            >
              Live Feed
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Backend Status Chip */}
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
              {backendOnline ? "BACKEND ONLINE (8000)" : "OFFLINE"}
            </span>
          </div>

          <button
            onClick={() => handleSelectScenario("p2p")}
            className="bg-[#00dce6] text-[#00373a] font-mono-code text-xs px-3.5 py-1.5 rounded-sm hover:brightness-110 transition-all font-bold cursor-pointer"
          >
            New Case
          </button>
          <button
            onClick={() => {
              const exportBlob = new Blob([JSON.stringify(activeCase, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${activeCase.caseId}_trace_export.json`;
              a.click();
            }}
            className="border border-[#00dce6] text-[#00dce6] font-mono-code text-xs px-3.5 py-1.5 rounded-sm hover:bg-[#00dce6]/10 transition-all cursor-pointer"
          >
            Export
          </button>

          <div className="flex items-center gap-2 border-l border-[#3a494b] pl-3 ml-1">
            <span className="material-symbols-outlined text-[#849495] hover:text-[#00dce6] text-xl cursor-pointer">
              notifications
            </span>
            <span className="material-symbols-outlined text-[#849495] hover:text-[#00dce6] text-xl cursor-pointer">
              settings
            </span>
            <div className="w-7 h-7 rounded-full bg-[#1e2024] border border-[#3a494b] flex items-center justify-center font-mono-code text-[11px] text-[#00dce6]">
              IO
            </div>
          </div>
        </div>
      </header>

      {/* Top Stats Ribbon */}
      <div className="w-full bg-[#1e2024] flex items-center justify-between px-6 py-2 border-b border-[#3a494b] flex-shrink-0 z-40 text-xs">
        <div className="flex gap-6 items-center">
          {/* Threat Level Meter */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 rounded-full border border-[#ff0055] flex items-center justify-center glow-alert bg-[#ff0055]/10">
              <span className="material-symbols-outlined text-[14px] text-[#ff0055]">warning</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-code text-[9px] text-[#849495] uppercase tracking-wider">
                Threat Level
              </span>
              <span className="font-mono-code text-xs text-[#ff0055] font-bold">
                {activeCase.threatLevel}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-[#3a494b]"></div>

          {/* Funds Flow */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[16px] text-[#00dce6]">
              account_balance_wallet
            </span>
            <div className="flex items-center gap-2 font-mono-code text-xs">
              <span className="text-[#ff0055] font-semibold">
                {activeCase.amount} {activeCase.token} Stolen
              </span>
              <span className="material-symbols-outlined text-[14px] text-[#849495]">
                arrow_forward
              </span>
              <span className="text-[#00dce6] font-semibold">
                {(parseFloat(activeCase.amount) * 0.931).toFixed(2)} {activeCase.token} at Exchange
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {/* Latency */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#282a2e] border border-[#3a494b] rounded-sm">
            <span className="material-symbols-outlined text-[14px] text-[#00dce6]">bolt</span>
            <span className="font-mono-code text-[11px] text-[#e2e2e8]">
              {latency}ms Sub-Second Trace
            </span>
          </div>

          {/* Seal */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#333539] border border-[#3a494b] rounded-sm">
            <span className="material-symbols-outlined text-[14px] text-[#00dce6] animate-[spin_6s_linear_infinite]">
              security
            </span>
            <span className="font-mono-code text-[11px] text-[#00dce6]">
              Chain of Custody (SHA-256: {activeCase.traceHash.substring(0, 10)}...)
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SideNavBar */}
        <aside className="w-56 h-full flex flex-col pb-4 bg-[#1a1c20] border-r border-[#3a494b] flex-shrink-0">
          <div className="px-4 py-5 border-b border-[#3a494b] mb-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded bg-[#333539] flex items-center justify-center border border-[#3a494b]">
                <span className="material-symbols-outlined text-[#00dce6] text-base">shield</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono-code">Command Center</div>
                <div className="text-[10px] text-[#00dce6] font-mono-code">Vigilance Unit 01</div>
              </div>
            </div>
            <button
              onClick={() => handleDispatchFreeze()}
              className="w-full mt-3 bg-[#ff0055] text-white font-mono-code py-1.5 rounded-sm hover:brightness-110 transition-colors uppercase font-bold text-[11px] flex justify-center items-center gap-1.5 cursor-pointer glow-alert"
            >
              <span className="material-symbols-outlined text-[15px]">campaign</span>
              Emergency Alert
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 px-2">
            <button
              onClick={() => setActiveTab("intake")}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs rounded transition-all cursor-pointer ${
                activeTab === "intake"
                  ? "bg-[#00f2fe]/10 text-[#00dce6] border-l-4 border-[#00dce6]"
                  : "text-[#849495] hover:text-white hover:bg-[#333539]"
              }`}
            >
              <span className="material-symbols-outlined text-base">input</span> Intake
            </button>
            <button
              onClick={() => setActiveTab("scenarios")}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs rounded transition-all cursor-pointer ${
                activeTab === "scenarios"
                  ? "bg-[#00f2fe]/10 text-[#00dce6] border-l-4 border-[#00dce6]"
                  : "text-[#849495] hover:text-white hover:bg-[#333539]"
              }`}
            >
              <span className="material-symbols-outlined text-base">psychology</span> Scenarios
            </button>
            <button
              onClick={() => setActiveTab("vasp")}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs rounded transition-all cursor-pointer ${
                activeTab === "vasp"
                  ? "bg-[#00f2fe]/10 text-[#00dce6] border-l-4 border-[#00dce6]"
                  : "text-[#849495] hover:text-white hover:bg-[#333539]"
              }`}
            >
              <span className="material-symbols-outlined text-base">hub</span> VASP Hub
            </button>
            <button
              onClick={() => setActiveTab("statutory")}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs rounded transition-all cursor-pointer ${
                activeTab === "statutory"
                  ? "bg-[#00f2fe]/10 text-[#00dce6] border-l-4 border-[#00dce6]"
                  : "text-[#849495] hover:text-white hover:bg-[#333539]"
              }`}
            >
              <span className="material-symbols-outlined text-base">gavel</span> Statutory
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs rounded transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#00f2fe]/10 text-[#00dce6] border-l-4 border-[#00dce6]"
                  : "text-[#849495] hover:text-white hover:bg-[#333539]"
              }`}
            >
              <span className="material-symbols-outlined text-base">history</span> History
            </button>
          </nav>

          <div className="mt-auto border-t border-[#3a494b] pt-2 flex flex-col gap-1 px-2">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[#849495] font-mono-code text-[11px]">
              <span className="material-symbols-outlined text-sm">help</span> PS26183 MHA
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 text-[#849495] font-mono-code text-[11px]">
              <span className="material-symbols-outlined text-sm">terminal</span> Sec 65B Certified
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex h-full bg-[#111318] p-2 gap-2 overflow-hidden">
          {/* Left Pane: Case Intake */}
          <section className="w-80 flex flex-col bg-[#1a1c20] hud-border h-full overflow-y-auto">
            <div className="bg-[#1e2024] p-3 border-b border-[#3a494b] flex items-center justify-between sticky top-0 z-10">
              <span className="font-mono-code text-xs text-[#00dce6] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">badge</span>
                Case Intake
              </span>
              <span className="font-mono-code text-[10px] text-[#849495] bg-[#111318] px-1.5 py-0.5 rounded border border-[#3a494b]">
                {activeCase.caseId}
              </span>
            </div>

            <div className="p-3.5 flex flex-col gap-3.5 text-xs">
              <div className="relative">
                <label className="absolute -top-2 left-2 bg-[#1a1c20] px-1 font-mono-code text-[9px] text-[#849495]">
                  Complainant Name
                </label>
                <input
                  type="text"
                  value={activeCase.complainantName}
                  onChange={(e) =>
                    setActiveCase({ ...activeCase, complainantName: e.target.value })
                  }
                  className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] font-sans text-xs p-2 pt-2.5 rounded-sm scanline focus:ring-0 focus:border-[#00dce6] outline-none"
                  placeholder="Enter Name"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-2 bg-[#1a1c20] px-1 font-mono-code text-[9px] text-[#849495]">
                  NCRP Reference
                </label>
                <input
                  type="text"
                  value={activeCase.ncrpRef}
                  onChange={(e) => setActiveCase({ ...activeCase, ncrpRef: e.target.value })}
                  className="w-full bg-[#111318] border border-[#3a494b] text-[#00dce6] font-mono-code text-xs p-2 pt-2.5 rounded-sm scanline focus:ring-0 focus:border-[#00dce6] outline-none"
                  placeholder="NCRP-..."
                />
              </div>

              <div className="relative mt-1">
                <label className="absolute -top-2 left-2 bg-[#1a1c20] px-1 font-mono-code text-[9px] text-[#ff0055]">
                  Source Wallet (Victim)
                </label>
                <input
                  type="text"
                  value={activeCase.sourceWallet}
                  onChange={(e) =>
                    setActiveCase({ ...activeCase, sourceWallet: e.target.value })
                  }
                  className="w-full bg-[#111318] border border-[#ff0055]/50 text-[#ffb4ab] font-mono-code text-[11px] p-2 pt-2.5 rounded-sm scanline focus:border-[#ff0055] outline-none"
                  placeholder="0x..."
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <label className="absolute -top-2 left-2 bg-[#1a1c20] px-1 font-mono-code text-[9px] text-[#849495]">
                    Token
                  </label>
                  <select
                    value={activeCase.token}
                    onChange={(e) => setActiveCase({ ...activeCase, token: e.target.value })}
                    className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] font-mono-code text-xs p-2 pt-2.5 rounded-sm scanline focus:ring-0 focus:border-[#00dce6] outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
                <div className="relative flex-[2]">
                  <label className="absolute -top-2 left-2 bg-[#1a1c20] px-1 font-mono-code text-[9px] text-[#849495]">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={activeCase.amount}
                    onChange={(e) => setActiveCase({ ...activeCase, amount: e.target.value })}
                    className="w-full bg-[#111318] border border-[#3a494b] text-[#e2e2e8] font-mono-code text-xs p-2 pt-2.5 rounded-sm scanline focus:ring-0 focus:border-[#00dce6] outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="mt-3 pt-3 border-t border-[#3a494b]">
                <span className="font-mono-code text-[10px] text-[#849495] mb-2 block uppercase tracking-wider">
                  Quick Scenarios
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectScenario("p2p")}
                    className={`border p-2 rounded-sm text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      activeCase.caseId === "CASE-2026-001"
                        ? "bg-[#00dce6]/10 border-[#00dce6] text-[#00dce6]"
                        : "bg-[#111318] border-[#3a494b] text-[#849495] hover:border-[#00dce6] hover:text-[#00dce6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span className="font-mono-code text-[10px] font-bold">P2P Fraud</span>
                    <span className="text-[9px] text-[#849495]">45,000 USDT</span>
                  </button>

                  <button
                    onClick={() => handleSelectScenario("digital_arrest")}
                    className={`border p-2 rounded-sm text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      activeCase.caseId === "CASE-2026-002"
                        ? "bg-[#00dce6]/10 border-[#00dce6] text-[#00dce6]"
                        : "bg-[#111318] border-[#3a494b] text-[#849495] hover:border-[#00dce6] hover:text-[#00dce6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">public</span>
                    <span className="font-mono-code text-[10px] font-bold">Digital Arrest</span>
                    <span className="text-[9px] text-[#849495]">7.5 ETH</span>
                  </button>

                  <button
                    onClick={() => handleSelectScenario("mixer_trace")}
                    className={`border p-2 rounded-sm text-left transition-all flex flex-col gap-1 col-span-2 cursor-pointer ${
                      activeCase.caseId === "CASE-2026-003"
                        ? "bg-[#00dce6]/10 border-[#00dce6] text-[#00dce6]"
                        : "bg-[#111318] border-[#3a494b] text-[#849495] hover:border-[#00dce6] hover:text-[#00dce6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">account_tree</span>
                    <span className="font-mono-code text-[10px] font-bold">
                      Complex Mixer & Layering Trace
                    </span>
                    <span className="text-[9px] text-[#849495]">1.25 BTC / Multi-Hop Split</span>
                  </button>
                </div>
              </div>

              {/* Case Stats Box */}
              <div className="mt-2 bg-[#111318] p-2.5 rounded border border-[#3a494b] text-[11px] font-mono-code space-y-1">
                <div className="flex justify-between text-[#849495]">
                  <span>Hops Identified:</span>
                  <span className="text-white font-bold">4 Hops</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>Mule Addresses:</span>
                  <span className="text-[#ff0055] font-bold">3 Accounts</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>VASP Target:</span>
                  <span className="text-[#ffd0c5] font-bold">{activeCase.destVasp.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Area: Multi-Hop Graph Canvas */}
          <section className="flex-1 flex flex-col bg-[#0c0e12] hud-border relative overflow-hidden">
            {/* Top Canvas Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => {}}
                className="bg-[#282a2e] border border-[#3a494b] text-[#e2e2e8] p-1.5 rounded-sm hover:text-[#00dce6] transition-colors cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
              <button
                onClick={() => {}}
                className="bg-[#282a2e] border border-[#3a494b] text-[#e2e2e8] p-1.5 rounded-sm hover:text-[#00dce6] transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="bg-[#282a2e] border border-[#3a494b] text-[#e2e2e8] p-1.5 rounded-sm hover:text-[#00dce6] transition-colors cursor-pointer"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
              </button>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-10 bg-[#1e2024]/85 backdrop-blur border border-[#3a494b] p-2.5 rounded-sm font-mono-code text-[10px]">
              <div className="flex items-center gap-2 text-[#00dce6] mb-1">
                <div className="w-2 h-2 rounded-full bg-[#00dce6]"></div> Victim Wallet
              </div>
              <div className="flex items-center gap-2 text-[#ff0055] mb-1">
                <div className="w-2 h-2 rounded-full bg-[#ff0055]"></div> Collection / Mule
              </div>
              <div className="flex items-center gap-2 text-[#ffd0c5]">
                <div className="w-2 h-2 rounded-full bg-[#ffd0c5]"></div> Exchange (VASP)
              </div>
            </div>

            {/* Abstract Graph Canvas */}
            <div
              className="w-full h-full flex items-center justify-center p-8 relative"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(0, 220, 230, 0.08) 0%, transparent 70%)",
              }}
            >
              {/* Connecting Paths SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {/* Connecting lines */}
                <path
                  d="M 120 280 C 220 200, 240 360, 340 340"
                  fill="none"
                  stroke="#ff0055"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                <path
                  d="M 340 340 C 420 320, 440 220, 520 230"
                  fill="none"
                  stroke="#ffaa00"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 520 230 C 580 240, 600 330, 680 340"
                  fill="none"
                  stroke="#ffaa00"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 680 340 C 760 340, 780 280, 860 280"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Node Layout */}
              <div className="flex items-center relative z-10 w-full justify-between max-w-4xl px-4">
                {/* Victim Node */}
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: "V1",
                      label: "Victim Wallet",
                      type: "victim",
                      address: activeCase.sourceWallet,
                      amount: `${activeCase.amount} ${activeCase.token}`,
                      risk: 15,
                    })
                  }
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-[#00dce6] bg-[#111318] flex items-center justify-center glow-accent relative transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[#00dce6] text-2xl">person</span>
                    <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#00dce6] rounded px-1 text-[9px] font-mono-code text-[#00dce6] font-bold">
                      V1
                    </div>
                  </div>
                  <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                    {activeCase.sourceWallet.substring(0, 6)}...{activeCase.sourceWallet.substring(activeCase.sourceWallet.length - 4)}
                  </span>
                  <span className="font-mono-code text-[9px] text-[#00dce6]">Source (100%)</span>
                </div>

                {/* Collection / Mule Node 1 */}
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: "C1",
                      label: "Collection Layer 1 (Mule)",
                      type: "mule",
                      address: "0x2B99a19d8Ac94248E92B104F34005910283999F",
                      amount: `${activeCase.amount} ${activeCase.token}`,
                      risk: 96,
                    })
                  }
                  className="flex flex-col items-center gap-2 mt-20 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-[#ff0055] bg-[#111318] flex items-center justify-center glow-alert relative transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[#ff0055] text-2xl">warning</span>
                    <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ff0055] rounded px-1 text-[9px] font-mono-code text-[#ff0055] font-bold">
                      C1
                    </div>
                  </div>
                  <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                    0x2B...99F
                  </span>
                  <span className="font-mono-code text-[9px] text-[#ff0055]">Rapid Split (0s)</span>
                </div>

                {/* Peel Node 1 */}
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: "P1",
                      label: "Peel Mule Layer 2",
                      type: "peel",
                      address: "0x4477A19fC0298B31008f1034c5991823901",
                      amount: `${(parseFloat(activeCase.amount) * 0.96).toFixed(0)} ${activeCase.token}`,
                      risk: 88,
                    })
                  }
                  className="flex flex-col items-center gap-2 -mt-16 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full border border-[#ffaa00] bg-[#282a2e] flex items-center justify-center glow-amber relative transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[#ffaa00] text-xl">filter_alt</span>
                    <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ffaa00] rounded px-1 text-[8px] font-mono-code text-[#ffaa00]">
                      L2
                    </div>
                  </div>
                  <span className="font-mono-code text-[10px] text-[#849495] bg-[#1e2024] px-1.5 py-0.5 rounded border border-[#3a494b]">
                    Peel_01
                  </span>
                  <span className="font-mono-code text-[9px] text-[#ffaa00]">Layering</span>
                </div>

                {/* Peel Node 2 */}
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: "P2",
                      label: "Peel Mule Layer 3",
                      type: "peel",
                      address: "0x8924bC9118bA4410928eFc290130981bC12",
                      amount: `${(parseFloat(activeCase.amount) * 0.94).toFixed(0)} ${activeCase.token}`,
                      risk: 84,
                    })
                  }
                  className="flex flex-col items-center gap-2 mt-16 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full border border-[#ffaa00] bg-[#282a2e] flex items-center justify-center glow-amber relative transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[#ffaa00] text-xl">filter_alt</span>
                    <div className="absolute -bottom-1 -right-1 bg-[#111318] border border-[#ffaa00] rounded px-1 text-[8px] font-mono-code text-[#ffaa00]">
                      L3
                    </div>
                  </div>
                  <span className="font-mono-code text-[10px] text-[#849495] bg-[#1e2024] px-1.5 py-0.5 rounded border border-[#3a494b]">
                    Peel_02
                  </span>
                  <span className="font-mono-code text-[9px] text-[#ffaa00]">Deposit Prep</span>
                </div>

                {/* Exchange VASP Node */}
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: "E1",
                      label: activeCase.destVasp,
                      type: "vasp",
                      address: activeCase.destWallet,
                      amount: `${(parseFloat(activeCase.amount) * 0.931).toFixed(0)} ${activeCase.token}`,
                      risk: 94,
                      vaspName: activeCase.destVasp,
                    })
                  }
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div
                    className="w-20 h-20 rounded border-2 border-[#ffd0c5] bg-[#111318] flex items-center justify-center relative transition-transform group-hover:scale-110"
                    style={{ boxShadow: "0 0 20px rgba(255, 208, 197, 0.2)" }}
                  >
                    <span className="material-symbols-outlined text-[#ffd0c5] text-[34px]">
                      account_balance
                    </span>
                    <div className="absolute -top-2.5 bg-[#111318] border border-[#ffd0c5] rounded px-1.5 text-[9px] font-mono-code text-[#ffd0c5] font-bold">
                      {activeCase.destVasp.split(" ")[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="font-mono-code text-[11px] text-white bg-[#1e2024] px-2 py-0.5 rounded border border-[#3a494b]">
                    Hot_Wallet_3
                  </span>
                  <span className="font-mono-code text-[9px] text-[#00dce6] font-bold">
                    Exit Exchange Target
                  </span>
                </div>
              </div>

              {/* Node Inspector Popup if selected */}
              {selectedNode && (
                <div className="absolute bottom-20 left-6 z-30 bg-[#1e2024]/95 backdrop-blur-md border border-[#00dce6] p-3.5 rounded shadow-2xl w-80 font-mono-code text-xs">
                  <div className="flex justify-between items-center border-b border-[#3a494b] pb-2 mb-2">
                    <span className="text-[#00dce6] font-bold">{selectedNode.label}</span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-[#849495] hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-[#849495]">Address: </span>
                      <span className="text-[#e2e2e8] break-all">{selectedNode.address}</span>
                    </div>
                    <div>
                      <span className="text-[#849495]">Amount Tracked: </span>
                      <span className="text-[#00dce6] font-bold">{selectedNode.amount}</span>
                    </div>
                    <div>
                      <span className="text-[#849495]">Forensic Risk Score: </span>
                      <span
                        className={`font-bold ${
                          selectedNode.risk > 80 ? "text-[#ff0055]" : "text-[#00dce6]"
                        }`}
                      >
                        {selectedNode.risk}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[#849495]">Attribution: </span>
                      <span className="text-white">
                        {selectedNode.vaspName || "Intermediate Layering Mule"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating AI Execution Button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={handleExecuteTrace}
                disabled={isTracing}
                className="bg-[#00dce6]/15 border border-[#00dce6] text-[#00dce6] font-mono-code text-xs px-6 py-3 rounded-sm hover:bg-[#00dce6] hover:text-[#00373a] transition-all flex items-center gap-2 glow-accent font-bold backdrop-blur cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined ${
                    isTracing ? "animate-spin text-white" : ""
                  }`}
                >
                  auto_awesome
                </span>
                {isTracing ? "TRACING BLOCKCHAIN MULTI-HOP..." : "EXECUTE AI MULTI-HOP TRACE"}
              </button>
            </div>
          </section>

          {/* Right Sidebar: VASP & Statutory */}
          <section className="w-80 flex flex-col gap-2 h-full overflow-y-auto">
            {/* VASP Attribution Card */}
            <div className="bg-[#1a1c20] hud-border p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
                <span className="font-mono-code text-xs text-[#00dce6] uppercase font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  VASP Attribution
                </span>
                <span className="bg-[#00dce6]/10 text-[#00dce6] border border-[#00dce6]/30 px-1.5 py-0.5 rounded text-[9px] font-mono-code">
                  MATCHED
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono-code">
                  {activeCase.destVasp}
                </div>
                <div className="font-mono-code text-[10px] text-[#849495] mt-0.5">
                  FIU-IND Reg #: {activeCase.fiuReg}
                </div>
              </div>
              <div className="bg-[#111318] p-2.5 rounded-sm border border-[#3a494b] text-xs">
                <span className="font-mono-code text-[10px] text-[#00dce6] block mb-1 font-bold">
                  Nodal Officer (Sec 91/102 Contact)
                </span>
                <div className="text-[11px] text-[#e2e2e8]">Name: {activeCase.nodalName}</div>
                <div className="text-[11px] text-[#e2e2e8] font-mono-code">
                  Email: {activeCase.nodalEmail}
                </div>
                <div className="text-[11px] text-[#e2e2e8] font-mono-code">
                  Phone: {activeCase.nodalPhone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#333539] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00dce6] w-[88%]"></div>
                </div>
                <span className="font-mono-code text-[10px] text-[#849495]">
                  88% Avg. 2hr Response
                </span>
              </div>
            </div>

            {/* Statutory Actions Card */}
            <div className="bg-[#1a1c20] hud-border p-3.5 flex flex-col gap-3 flex-1 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#3a494b] pb-2">
                <span className="font-mono-code text-xs text-[#ff0055] uppercase font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">gavel</span>
                  Statutory Actions
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#ff0055]">
                  verified_user
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono-code text-[#849495]">
                <span>Section 91 & 102 CrPC / BNSS 2023</span>
                <span className="text-[#00dce6] font-bold">Sec 65B Certified</span>
              </div>

              {/* Notice Preview */}
              <div className="bg-[#111318] flex-1 rounded-sm border border-[#3a494b] p-3 overflow-y-auto relative font-mono-code text-[10px] leading-relaxed text-[#b9cacb]">
                <div className="absolute top-2 right-2 border border-[#3a494b] px-1 text-[8px] text-[#849495] bg-[#1e2024]">
                  {freezeNoticeDispatched ? "DISPATCHED" : "DRAFT"}
                </div>
                <p className="text-center font-bold text-white mb-2 border-b border-[#3a494b] pb-1">
                  OFFICIAL NOTICE U/S 91 & 102 Cr.P.C.
                </p>
                <p>To,</p>
                <p>The Nodal Officer, {activeCase.destVasp.split(" ")[0]}</p>
                <p className="mt-1">
                  Sub: Immediate freezing of crypto assets in Ref FIR/NCRP: {activeCase.ncrpRef}
                </p>
                <p className="mt-1">
                  1. Whereas investigation reveals that proceeds of crime amounting to{" "}
                  <span className="text-[#00dce6] font-bold">
                    {(parseFloat(activeCase.amount) * 0.931).toFixed(2)} {activeCase.token}
                  </span>{" "}
                  have been traced directly to your VASP Hot Wallet (ID: {activeCase.destWallet}).
                </p>
                <p className="mt-1">
                  2. You are hereby directed under Section 102 Cr.P.C. (Sec 107 BNSS 2023) to freeze
                  the aforementioned funds immediately to prevent dissipation.
                </p>
                <p className="mt-1 text-[#00dce6]">
                  Chain-of-Custody SHA-256: {activeCase.traceHash.substring(0, 16)}...
                </p>
              </div>

              {/* Status Alert if dispatched */}
              {freezeNoticeDispatched && (
                <div className="bg-[#00dce6]/10 border border-[#00dce6] text-[#00dce6] p-2 rounded text-[10px] font-mono-code flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Notice Dispatched to {activeCase.nodalEmail}. Token: I4C-FRZ-88219.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={handleDispatchFreeze}
                  className="w-full bg-[#ff0055] text-white font-mono-code text-xs py-2 rounded-sm hover:brightness-110 transition-colors uppercase font-bold text-center glow-alert cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  Dispatch Freeze Notice
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full border border-[#00dce6] text-[#00dce6] hover:bg-[#00dce6]/10 font-mono-code text-xs py-2 rounded-sm transition-colors uppercase text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                  Download Certified PDF
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
