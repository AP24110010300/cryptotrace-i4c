"use client";

import React, { useState } from "react";

export default function UIPreviewGallery() {
  const [selected, setSelected] = useState<number>(1);

  const options = [
    {
      id: 1,
      title: "Option 1: Modern Minimalist Slate (Chainalysis / Linear Style)",
      subtitle: "Clean enterprise dark mode, 3-column layout, horizontal node-to-node flowchart, and crisp VASP attribution.",
      image: "/option1.jpg",
      tags: ["Minimalist", "Horizontal Flowchart", "High Legibility"],
    },
    {
      id: 2,
      title: "Option 2: Institutional Police Dossier (Palantir / GovTech Style)",
      subtitle: "Authoritative law enforcement portal, structured forensic transaction table, vertical hops, and Section 91/102 legal directive.",
      image: "/option2.jpg",
      tags: ["Institutional", "Forensic Table", "Statutory Enforcement"],
    },
    {
      id: 3,
      title: "Option 3: Stepped Visual Flow (Merkle Science / Clean Stepper Style)",
      subtitle: "3-card modular layout with an intuitive linear 4-step money audit trail and clean VASP summary.",
      image: "/option3.jpg",
      tags: ["Intuitive Stepper", "Clean Cards", "Zero Learning Curve"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e2e8] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1f2937] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              CryptoTrace-I4C &bull; UI Design Comparison
            </h1>
            <p className="text-sm text-[#9ca3af] mt-1">
              Select an option below to compare the visual designs for the forensic dashboard.
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-mono bg-[#1f2937] text-white px-3 py-2 rounded hover:bg-[#374151] transition-colors"
          >
            &larr; Back to Live App
          </a>
        </div>

        {/* Option Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                selected === opt.id
                  ? "bg-[#111827] border-[#06b6d4] shadow-lg shadow-[#06b6d4]/10"
                  : "bg-[#0f172a] border-[#1f2937] hover:border-[#374151]"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-bold text-[#06b6d4]">
                  OPTION 0{opt.id}
                </span>
                {selected === opt.id && (
                  <span className="bg-[#06b6d4] text-[#0b0f19] text-[10px] font-bold px-2 py-0.5 rounded">
                    VIEWING
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-white">{opt.title.split(" (")[0]}</div>
              <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">{opt.subtitle}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {opt.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono bg-[#1e293b] text-[#94a3b8] px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Big Preview Area */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-mono font-bold text-[#06b6d4] uppercase">
                Currently Previewing
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {options[selected - 1].title}
              </h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                {options[selected - 1].subtitle}
              </p>
            </div>
            <div className="text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-3 py-1 rounded">
              Ready to Implement
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#1f2937] bg-[#05070d]">
            <img
              src={options[selected - 1].image}
              alt={options[selected - 1].title}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>

        {/* All Three Side-by-Side Comparison */}
        <div className="border-t border-[#1f2937] pt-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Full Gallery (All 3 Options)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 space-y-2 cursor-pointer hover:border-[#06b6d4] transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Option {opt.id}</span>
                  <span className="text-[10px] font-mono text-[#06b6d4]">Click to zoom</span>
                </div>
                <img
                  src={opt.image}
                  alt={opt.title}
                  className="w-full h-auto rounded border border-[#1f2937]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
