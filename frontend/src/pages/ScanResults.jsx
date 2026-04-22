import { useEffect, useState } from "react";

export default function ScanResults() {
  const [scanResult, setScanResult] = useState("");

  useEffect(() => {
    const result = localStorage.getItem("latestScanResult");
    setScanResult(result || ">> no_audit_data_found [null]");
  }, []);

  return (
    <div className="min-h-screen pt-32 p-6 max-w-4xl mx-auto">
      <div className="reveal space-y-12">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[80px] rounded-full" />
          <h2 className="text-5xl font-bold heading-futuristic mb-4">Registry Logs</h2>
          <p className="text-gray-500 font-medium tracking-wide">Immutable audit trails of verified assets</p>
        </div>

        <div className="neo-card overflow-hidden">
          <div className="bg-white/5 border-b border-white/5 px-10 py-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Latest Log Entry</h3>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
            </div>
          </div>
          <div className="p-10 font-mono">
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative group">
              <div className="absolute top-4 right-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Type: Audit_Log_V1
              </div>
              <pre className="text-blue-400/90 text-sm leading-relaxed whitespace-pre-wrap">
                <span className="text-gray-600 mr-2">SYS_MSG:</span>
                {scanResult}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 p-8 bg-blue-500/5 rounded-[2rem] border border-blue-500/10">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold text-sm uppercase tracking-wider">On-Chain Integrity Guaranteed</p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Every log entry here has been timestamped and anchored to the decentralized ledger. 
              Any mismatch in the source files will be detected instantly by the network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
