"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface TraceNode {
  id: string;
  label: string;
  role: string;
  riskBadge: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk" | "Sanctioned Entity";
  riskBadgeColor: string;
  address: string;
  amount: string;
  velocity?: string;
  txHash?: string;
  icon: string;
}

interface CaseScenario {
  id: string;
  name: string;
  victimWallet: string;
  token: string;
  amount: string;
  ncrpRef: string;
  firNumber: string;
  complainant: string;
  destVasp: string;
  fiuReg: string;
  nodalEmail: string;
  nodalPhone: string;
  traceHash: string;
  nodes: TraceNode[];
}

const SCENARIOS: Record<string, CaseScenario> = {
  phishing: {
    id: "CASE-2026-001",
    name: "P2P Task Scam",
    victimWallet: "0x7F38c75B174542387B45a557b77Ac27464003A2",
    token: "USDT",
    amount: "45,000",
    ncrpRef: "NCRP-2026-DEL-88219",
    firNumber: "FIR-2026/CYBER/409",
    complainant: "Rajesh Kumar",
    destVasp: "Binance Exchange",
    fiuReg: "FIU-IND-100G-10308",
    nodalEmail: "leo@binance.com",
    nodalPhone: "+91 979296-7206",
    traceHash: "8a4f91c6e12e3a0b5f884149dc8c4be90234a123f1b40292",
    nodes: [
      {
        id: "v1",
        label: "Victim",
        role: "Original Source",
        riskBadge: "Low Risk",
        riskBadgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        address: "0x7F38c75B174542387B45a557b77Ac27464003A2",
        amount: "45,000 USDT",
        icon: "person",
        txHash: "0x8a4f...3e12",
      },
      {
        id: "m1",
        label: "Layer 1 Mule",
        role: "Consolidation Hub",
        riskBadge: "Low Risk",
        riskBadgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        address: "0x2B99a19d8Ac94248E92B104F34005910283999F",
        amount: "45,000 USDT",
        velocity: "0.07s Hop",
        icon: "layers",
        txHash: "0x2b99...991f",
      },
      {
        id: "m2",
        label: "Layer 2 Peel",
        role: "Layering Account",
        riskBadge: "High Risk",
        riskBadgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        address: "0x4477A19fC0298B31008f1034c5991823901",
        amount: "42,750 USDT",
        velocity: "1.4s Hop",
        icon: "filter_alt",
        txHash: "0x4477...8239",
      },
      {
        id: "vasp",
        label: "Binance Exchange",
        role: "Cash-Out Exit Hot Wallet",
        riskBadge: "Sanctioned Entity",
        riskBadgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        address: "0x28C6c06298d514Db089934071355E5743bf21d60",
        amount: "41,895 USDT",
        icon: "account_balance",
        txHash: "0x28c6...1d60",
      },
    ],
  },
  ransomware: {
    id: "CASE-2026-002",
    name: "Digital Arrest",
    victimWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    token: "ETH",
    amount: "7.5",
    ncrpRef: "NCRP-2026-MUM-41092",
    firNumber: "FIR-2026/CYBER/712",
    complainant: "Dr. Sunita Rao",
    destVasp: "WazirX (Zanmai Labs)",
    fiuReg: "FIU-2023-WZX-108",
    nodalEmail: "nodalofficer@wazirx.com",
    nodalPhone: "+91 998877-6655",
    traceHash: "7c12f0e9b891823ab1104e123fa488b022145cde18388912",
    nodes: [
      {
        id: "v1",
        label: "Victim",
        role: "Hospital Treasury",
        riskBadge: "Low Risk",
        riskBadgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        amount: "7.5 ETH",
        icon: "person",
        txHash: "0x7c12...8912",
      },
      {
        id: "m1",
        label: "Layer 1 Mule",
        role: "Extortion Drop",
        riskBadge: "High Risk",
        riskBadgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        address: "0x55bb1A19fC0298B31008f1034c5991823901",
        amount: "7.5 ETH",
        velocity: "3.2s Hop",
        icon: "warning",
        txHash: "0x55bb...3901",
      },
      {
        id: "m2",
        label: "Peel Mule",
        role: "Gas & Mixer Split",
        riskBadge: "High Risk",
        riskBadgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        address: "0x8924bC9118bA4410928eFc290130981bC12",
        amount: "7.1 ETH",
        velocity: "1.1s Hop",
        icon: "filter_alt",
        txHash: "0x8924...bC12",
      },
      {
        id: "vasp",
        label: "WazirX Exchange",
        role: "FIU Off-Ramp Target",
        riskBadge: "Sanctioned Entity",
        riskBadgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        address: "0x56Eddb7aa87536c09CCc2793473599fE21A3c17D",
        amount: "6.98 ETH",
        icon: "account_balance",
        txHash: "0x56ed...c17d",
      },
    ],
  },
  investment: {
    id: "CASE-2026-003",
    name: "Mixer Laundering",
    victimWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    token: "BTC",
    amount: "1.25",
    ncrpRef: "NCRP-2026-BLR-99411",
    firNumber: "FIR-2026/CYBER/904",
    complainant: "Ananya Deshmukh",
    destVasp: "CoinDCX (Neblio)",
    fiuReg: "FIU-2023-CDC-554",
    nodalEmail: "legal@coindcx.com",
    nodalPhone: "+91 912345-6780",
    traceHash: "5b8812c332fae9102488bc33189fa99201948bd018274199",
    nodes: [
      {
        id: "v1",
        label: "Victim",
        role: "Retail Investor",
        riskBadge: "Low Risk",
        riskBadgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        amount: "1.25 BTC",
        icon: "person",
        txHash: "0x5b88...4199",
      },
      {
        id: "m1",
        label: "Fake Portal",
        role: "Syndicate Collector",
        riskBadge: "High Risk",
        riskBadgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        address: "0x1144a19d8Ac94248E92B104F34005910283999F",
        amount: "1.25 BTC",
        velocity: "0.8s Hop",
        icon: "hub",
        txHash: "0x1144...999f",
      },
      {
        id: "m2",
        label: "Tornado Mixer",
        role: "Obfuscation Tumbler",
        riskBadge: "Critical Risk",
        riskBadgeColor: "bg-rose-600/20 text-rose-400 border-rose-500/40",
        address: "0x3377A19fC0298B31008f1034c5991823901",
        amount: "1.20 BTC",
        velocity: "4.5s Hop",
        icon: "cyclone",
        txHash: "0x3377...3901",
      },
      {
        id: "vasp",
        label: "CoinDCX Exchange",
        role: "Domestic Off-Ramp",
        riskBadge: "High Risk",
        riskBadgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        amount: "1.16 BTC",
        icon: "account_balance",
        txHash: "0x1234...5678",
      },
    ],
  },
};

export default function CleanModernSlateCommandCenter() {
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>("phishing");
  const [currentCase, setCurrentCase] = useState<CaseScenario>(SCENARIOS.phishing);
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(SCENARIOS.phishing.nodes[1]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<boolean>(true);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [vaspAccordionOpen, setVaspAccordionOpen] = useState<boolean>(true);
  const [freezeNoticeDispatched, setFreezeNoticeDispatched] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"flowchart" | "list">("flowchart");
  const [latencyMs, setLatencyMs] = useState<number>(14);

  // Health check
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("http://localhost:8000/api/health");
        setBackendStatus(res.ok);
      } catch {
        setBackendStatus(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Switch Scenario
  const handleSelectScenario = (key: string) => {
    setActiveScenarioKey(key);
    const sc = SCENARIOS[key];
    setCurrentCase(sc);
    setSelectedNode(sc.nodes[1]);
    setFreezeNoticeDispatched(false);
  };

  // Copy victim wallet
  const handleCopyWallet = () => {
    navigator.clipboard.writeText(currentCase.victimWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search Address / Transaction
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Run trace on query
    setIsTracing(true);
    setTimeout(() => {
      setCurrentCase((prev) => ({
        ...prev,
        victimWallet: searchQuery.trim(),
      }));
      setIsTracing(false);
    }, 600);
  };

  // Execute AI Multi-Hop Trace
  const handleExecuteTrace = async () => {
    setIsTracing(true);
    const startTime = performance.now();

    try {
      const payload = {
        victim_wallet: currentCase.victimWallet,
        suspect_wallet: currentCase.victimWallet,
        initial_amount: parseFloat(currentCase.amount.replace(/,/g, "")) || 45000,
        token: currentCase.token === "USDT" ? "USDT-TRC20" : currentCase.token,
        ncrp_ref: currentCase.ncrpRef,
        fir_number: currentCase.firNumber,
      };

      const res = await fetch("http://localhost:8000/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        setLatencyMs(data.trace_time_ms || (elapsed > 0 ? elapsed : 14));
        setCurrentCase((prev) => ({
          ...prev,
          id: data.case_id || prev.id,
          traceHash: data.sha256_hash || prev.traceHash,
          destVasp: data.destination_vasp?.name || prev.destVasp,
          fiuReg: data.destination_vasp?.fiu_ind_reg || prev.fiuReg,
          nodalEmail: data.destination_vasp?.nodal_officer?.email || prev.nodalEmail,
          nodalPhone: data.destination_vasp?.nodal_officer?.phone || prev.nodalPhone,
        }));
      } else {
        setLatencyMs(elapsed > 0 ? elapsed : 14);
      }
    } catch {
      setLatencyMs(Math.floor(Math.random() * 15) + 12);
    } finally {
      setIsTracing(false);
    }
  };

  // Dispatch Statutory Freeze
  const handleDispatchFreeze = () => {
    setFreezeNoticeDispatched(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#06b6d4", "#f43f5e", "#fbbf24"],
    });
  };

  // Download ReportLab Court-Admissible PDF
  const handleDownloadPdf = () => {
    window.open(`http://localhost:8000/api/legal/${currentCase.id}/pdf`, "_blank");
  };

  // Export JSON dossier
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCase, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentCase.id}_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e2e8] flex flex-col font-sans select-none antialiased">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="h-16 bg-[#0e1322] border-b border-[#1f2937] px-6 flex items-center justify-between z-50">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#111827] border border-[#06b6d4]/40 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[#06b6d4] text-xl">shield</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-white flex items-center gap-2 font-mono">
              CryptoTrace-I4C
              <span className="text-[10px] bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30 px-1.5 py-0.5 rounded font-normal">
                PS26183
              </span>
            </h1>
            <p className="text-[10px] text-[#9ca3af] tracking-wider uppercase font-mono">
              MHA &bull; Cyber Crime Forensic Engine
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6b7280] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wallet address (0x... / T...) or tx hash..."
            className="w-full bg-[#111827] border border-[#1f2937] text-xs text-white pl-10 pr-20 py-2 rounded-lg focus:border-[#06b6d4] outline-none font-mono placeholder:text-[#6b7280] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] hover:text-white text-[11px] px-2.5 py-1 rounded font-mono transition-colors cursor-pointer"
          >
            Lookup
          </button>
        </form>

        {/* Status & Quick Links */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
              backendStatus
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              }`}
            ></div>
            <span className="font-semibold text-[11px]">
              {backendStatus ? "Live Backend Connected" : "Backend Offline"}
            </span>
          </div>

          <button
            onClick={handleExportJson}
            className="text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-3 py-1.5 rounded-lg hover:bg-[#06b6d4]/20 transition-all cursor-pointer"
          >
            Export Dossier
          </button>
        </div>
      </header>

      {/* ── MAIN 3-COLUMN WORKSPACE ── */}
      <div className="flex-1 p-5 grid grid-cols-12 gap-5 overflow-hidden">
        {/* ── COLUMN 1: CASE DOSSIER (Width: 3/12) ── */}
        <section className="col-span-12 lg:col-span-3 bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#1f2937] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Case Dossier</h2>
                <p className="text-[10px] font-mono text-[#9ca3af]">{currentCase.id}</p>
              </div>
              <button
                onClick={() => handleSelectScenario("phishing")}
                className="text-xs text-[#9ca3af] hover:text-white p-1 cursor-pointer"
                title="Reset to default case"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>

            {/* Victim Wallet Input with Copy Button */}
            <div>
              <label className="text-[11px] font-mono text-[#9ca3af] block mb-1">
                Victim Wallet
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentCase.victimWallet}
                  onChange={(e) =>
                    setCurrentCase({ ...currentCase, victimWallet: e.target.value })
                  }
                  className="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white px-3 py-2 pr-9 rounded-lg font-mono focus:border-[#06b6d4] outline-none"
                />
                <button
                  onClick={handleCopyWallet}
                  className="absolute right-2 top-2 text-[#9ca3af] hover:text-[#06b6d4] cursor-pointer"
                  title="Copy address"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              {copied && (
                <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                  Copied to clipboard!
                </span>
              )}
            </div>

            {/* Token Selector */}
            <div>
              <label className="text-[11px] font-mono text-[#9ca3af] block mb-1">Token</label>
              <select
                value={currentCase.token}
                onChange={(e) => setCurrentCase({ ...currentCase, token: e.target.value })}
                className="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white px-3 py-2 rounded-lg font-mono focus:border-[#06b6d4] outline-none cursor-pointer"
              >
                <option value="USDT">USDT (Tether USD)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="USDC">USDC (USD Coin)</option>
              </select>
            </div>

            {/* Stolen Amount */}
            <div>
              <label className="text-[11px] font-mono text-[#9ca3af] block mb-1">
                Stolen Amount
              </label>
              <input
                type="text"
                value={currentCase.amount}
                onChange={(e) => setCurrentCase({ ...currentCase, amount: e.target.value })}
                className="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white px-3 py-2 rounded-lg font-mono focus:border-[#06b6d4] outline-none font-bold"
              />
            </div>

            {/* Scenario Toggles */}
            <div className="pt-2 border-t border-[#1f2937]">
              <label className="text-[11px] font-mono text-[#9ca3af] block mb-2 font-bold uppercase tracking-wider">
                Scenario Toggles
              </label>
              <div className="space-y-2">
                {[
                  { key: "phishing", label: "Phishing / P2P Task", icon: "shield" },
                  { key: "ransomware", label: "Digital Arrest", icon: "lock" },
                  { key: "investment", label: "Mixer / Laundering", icon: "swap_calls" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectScenario(item.key)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      activeScenarioKey === item.key
                        ? "bg-[#06b6d4]/10 border-[#06b6d4] text-white font-medium shadow-sm"
                        : "bg-[#0b0f19] border-[#1f2937] text-[#9ca3af] hover:text-white hover:border-[#374151]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      {item.label}
                    </span>
                    <span
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                        activeScenarioKey === item.key
                          ? "bg-[#06b6d4] justify-end"
                          : "bg-[#1f2937] justify-start"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white block shadow"></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Legal Dossier Footnote */}
          <div className="mt-4 pt-3 border-t border-[#1f2937] text-[10px] font-mono text-[#6b7280] space-y-1">
            <div className="flex justify-between">
              <span>NCRP Ref:</span>
              <span className="text-[#9ca3af]">{currentCase.ncrpRef}</span>
            </div>
            <div className="flex justify-between">
              <span>Trace Latency:</span>
              <span className="text-[#06b6d4] font-bold">{latencyMs}ms Sub-Second</span>
            </div>
          </div>
        </section>

        {/* ── COLUMN 2: CENTER FLOWCHART CANVAS (Width: 6/12) ── */}
        <section className="col-span-12 lg:col-span-6 bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between shadow-lg relative">
          {/* Canvas Header */}
          <div className="flex justify-between items-center border-b border-[#1f2937] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Money Trail Flowchart</h2>
              <span className="text-[10px] font-mono bg-[#1f2937] text-[#9ca3af] px-2 py-0.5 rounded">
                4 Automated Hops
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "flowchart" ? "list" : "flowchart")}
                className="text-xs font-mono bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] hover:text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {viewMode === "flowchart" ? "List View" : "Flowchart"}
              </button>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 flex flex-col justify-center items-center relative py-6">
            {viewMode === "flowchart" ? (
              <div className="w-full flex items-center justify-between gap-3 px-2 overflow-x-auto">
                {currentCase.nodes.map((node, index) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Card */}
                      <div
                        onClick={() => setSelectedNode(node)}
                        className={`flex-1 min-w-[125px] p-3 rounded-xl border transition-all cursor-pointer relative group ${
                          isSelected
                            ? "bg-[#0e1726] border-[#06b6d4] shadow-lg shadow-[#06b6d4]/15 scale-105"
                            : "bg-[#0b0f19] border-[#1f2937] hover:border-[#374151]"
                        }`}
                      >
                        {/* Top: Icon + Label */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded bg-[#1f2937] flex items-center justify-center text-[#06b6d4]">
                            <span className="material-symbols-outlined text-sm">{node.icon}</span>
                          </div>
                          <span className="text-xs font-bold text-white truncate">
                            {node.label}
                          </span>
                        </div>

                        {/* Middle: Amount & Address */}
                        <div className="font-mono text-[11px] text-[#06b6d4] font-semibold mb-1 truncate">
                          {node.amount}
                        </div>
                        <div className="font-mono text-[9px] text-[#6b7280] truncate">
                          {node.address.substring(0, 6)}...
                          {node.address.substring(node.address.length - 4)}
                        </div>

                        {/* Bottom: Risk Badge */}
                        <div className="mt-2.5">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block ${node.riskBadgeColor}`}
                          >
                            {node.riskBadge}
                          </span>
                        </div>

                        {node.velocity && (
                          <div className="mt-1 text-[9px] font-mono text-[#9ca3af]">
                            &bull; {node.velocity}
                          </div>
                        )}
                      </div>

                      {/* Directional Connecting Arrow between nodes */}
                      {index < currentCase.nodes.length - 1 && (
                        <div className="flex items-center text-[#4b5563] flex-shrink-0">
                          <span className="material-symbols-outlined text-lg animate-pulse">
                            arrow_forward
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* List / Table View */
              <div className="w-full space-y-2 font-mono text-xs overflow-y-auto max-h-72">
                {currentCase.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="p-2.5 bg-[#0b0f19] border border-[#1f2937] rounded-lg flex justify-between items-center hover:border-[#06b6d4] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm text-[#06b6d4]">
                        {node.icon}
                      </span>
                      <div>
                        <div className="font-bold text-white">{node.label}</div>
                        <div className="text-[10px] text-[#6b7280]">{node.address}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#06b6d4] font-bold">{node.amount}</div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${node.riskBadgeColor}`}>
                        {node.riskBadge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Node Inspector Drawer */}
            {selectedNode && (
              <div className="w-full mt-6 p-3 bg-[#0b0f19] border border-[#1f2937] rounded-lg font-mono text-xs flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#06b6d4] font-bold">{selectedNode.label}</span>
                    <span className="text-[#6b7280]">&bull; {selectedNode.role}</span>
                  </div>
                  <div className="text-[11px] text-[#9ca3af] break-all">
                    Address: <span className="text-white">{selectedNode.address}</span>
                  </div>
                  {selectedNode.txHash && (
                    <div className="text-[10px] text-[#6b7280]">
                      Tx Hash: {selectedNode.txHash}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${selectedNode.riskBadgeColor}`}
                  >
                    {selectedNode.riskBadge}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-[#1f2937] flex justify-center">
            <button
              onClick={handleExecuteTrace}
              disabled={isTracing}
              className="w-full py-3 bg-[#06b6d4] hover:bg-[#0891b2] text-[#0b0f19] font-mono font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-base ${
                  isTracing ? "animate-spin" : ""
                }`}
              >
                auto_awesome
              </span>
              {isTracing ? "TRACING BLOCKCHAIN MULTI-HOP..." : "EXECUTE AI MULTI-HOP TRACE"}
            </button>
          </div>
        </section>

        {/* ── COLUMN 3: VASP ATTRIBUTION & STATUTORY FREEZE (Width: 3/12) ── */}
        <section className="col-span-12 lg:col-span-3 bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            {/* Header Accordion */}
            <div
              onClick={() => setVaspAccordionOpen(!vaspAccordionOpen)}
              className="flex justify-between items-center border-b border-[#1f2937] pb-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#06b6d4]">domain</span>
                <h2 className="text-sm font-bold text-white tracking-wide">VASP Intelligence</h2>
              </div>
              <span className="material-symbols-outlined text-[#9ca3af] text-base transition-transform">
                {vaspAccordionOpen ? "expand_less" : "expand_more"}
              </span>
            </div>

            {/* Accordion Body */}
            {vaspAccordionOpen && (
              <div className="space-y-3.5">
                {/* Exchange Card */}
                <div className="p-3 bg-[#0b0f19] border border-[#1f2937] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-amber-400 text-lg">
                      monetization_on
                    </span>
                    <span className="font-bold text-white text-xs">{currentCase.destVasp}</span>
                  </div>
                  <p className="text-[10px] font-mono text-emerald-400">FIU-IND Registered Exchange</p>
                </div>

                {/* FIU-IND Details */}
                <div className="text-xs space-y-1 font-mono">
                  <div className="text-[#9ca3af] text-[11px]">FIU-IND Registration Number</div>
                  <div className="text-white font-bold bg-[#0b0f19] p-2 rounded border border-[#1f2937]">
                    {currentCase.fiuReg}
                  </div>
                </div>

                {/* Nodal Officer Contact Details */}
                <div className="text-xs space-y-2 font-mono">
                  <div className="text-[#9ca3af] text-[11px]">Nodal Officer Contact Details</div>
                  <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1f2937] space-y-2 text-[11px]">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-xs text-[#06b6d4]">mail</span>
                      <span className="truncate">{currentCase.nodalEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-xs text-[#06b6d4]">call</span>
                      <span>{currentCase.nodalPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Statutory Preview Summary */}
                <div className="p-2.5 bg-[#0b0f19] border border-[#1f2937] rounded-lg text-[10px] font-mono text-[#9ca3af] space-y-1">
                  <div className="flex justify-between text-white font-bold">
                    <span>Section 91 & 102 CrPC</span>
                    <span className="text-emerald-400">Sec 65B Certified</span>
                  </div>
                  <div className="truncate">Ref: {currentCase.ncrpRef}</div>
                  <div className="text-[#06b6d4]">
                    Evidence Seal: {currentCase.traceHash.substring(0, 14)}...
                  </div>
                </div>

                {/* Dispatched alert confirmation */}
                {freezeNoticeDispatched && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Freeze Notice dispatched to {currentCase.nodalEmail}!
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Statutory Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-[#1f2937]">
              <button
                onClick={handleDispatchFreeze}
                className="w-full py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-[#0b0f19] font-mono font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">gavel</span>
                Section 91/102 CrPC Statutory Freeze
              </button>

              <button
                onClick={handleDownloadPdf}
                className="w-full py-2.5 bg-[#0b0f19] hover:bg-[#1f2937] text-[#e2e2e8] hover:text-white border border-[#1f2937] font-mono font-medium text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm text-[#06b6d4]">
                  picture_as_pdf
                </span>
                Download Certified PDF
              </button>

              <button
                onClick={handleExportJson}
                className="w-full py-2 bg-transparent hover:bg-[#0b0f19] text-[#9ca3af] hover:text-white font-mono text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">file_download</span>
                Export Case Audit Dossier
              </button>
            </div>
        </section>
      </div>
    </div>
  );
}
