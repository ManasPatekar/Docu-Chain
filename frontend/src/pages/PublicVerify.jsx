import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function PublicVerify() {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (identifier) handleVerify();
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/verify/${identifier}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Asset not found in the immutable ledger.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 p-6 flex flex-col items-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
      <div className="w-full max-w-3xl reveal">
        
        <div className="text-center mb-16">
            <span className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block">
                 Public Trust Service
            </span>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Validate Asset</h1>
            <p className="text-gray-500 font-medium">Verify the cryptographic integrity of any DocuChain document</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleVerify} className="neo-card p-4 mb-12 flex gap-4 bg-white/5 border-white/10 shadow-2xl">
            <input 
                type="text" 
                placeholder="Enter Document Hash or Transaction ID..." 
                className="bg-transparent border-none focus:ring-0 text-white font-mono text-sm flex-1 px-4"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />
            <button disabled={loading} className="btn-futuristic !px-10 !py-4 shadow-blue-500/20">
                {loading ? "querying..." : "Verify Proof"}
            </button>
        </form>

        {error && (
            <div className="neo-card p-10 border-red-500/20 bg-red-500/5 text-center reveal">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Verification Failed</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">{error}</p>
            </div>
        )}

        {result && (
            <div className="reveal">
                {/* Visual Certificate */}
                <div className="neo-card p-12 relative overflow-hidden bg-slate-950 border-blue-500/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rotate-45 translate-x-32 -translate-y-32" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-500/5 blur-[60px]" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                        <div className="space-y-8 flex-1">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter italic">Authentic Asset</h3>
                                    <p className="text-xs font-black text-green-400 uppercase tracking-widest">Verified on Hyperledger Fabric</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Filename</span>
                                    <p className="text-white font-bold">{result.filename}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Origin Node</span>
                                    <p className="text-blue-400 font-bold">{result.uploader}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Timestamp</span>
                                    <p className="text-white/80 font-bold">{new Date(result.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Version</span>
                                    <p className="text-white/80 font-bold">v{result.version} (Latest)</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Blockchain Transaction Proof</span>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-[10px] text-blue-400 break-all select-all">
                                    {result.tx_hash}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-56 space-y-6 text-center">
                            <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-blue-500/10">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href + "?id=" + result.tx_hash)}`} alt="QR" className="w-full" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Integrity Trust Rating</div>
                                <div className="text-4xl font-black text-white">{result.integrity_score}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => window.print()} className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors">
                        Download Trust Certificate (PDF)
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default PublicVerify;
