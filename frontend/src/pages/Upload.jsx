import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0); 
  const [network, setNetwork] = useState(null);
  const [vaultType, setVaultType] = useState("private");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNetwork = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/networks/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNetwork(response.data);
      } catch (err) {
        setStatus("Authentication Error. Restarting...");
      }
    };
    fetchNetwork();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStep(0);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Critical: No source file provided.");
    if (!network?.in_network) return setStatus("Action Blocked: Join a Hub to enable secure anchoring.");

    const token = localStorage.getItem("access_token");
    const authHeader = `Bearer ${token}`;

    try {
      setIsLoading(true);
      
      // Step 1: Malware Analysis (33%)
      setStep(1);
      setStatus("Initiating heuristic malware analysis...");
      const scanData = new FormData();
      scanData.append("file", file);
      const scanRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/scan`, scanData, {
        headers: { Authorization: authHeader, "Content-Type": "multipart/form-data" },
      });

      if (!scanRes.data.clean) {
          setStatus(`Security Alert: ${scanRes.data.reason}`);
          setIsLoading(false);
          return;
      }

      // Step 2: Protocol Anchoring (66%)
      setStep(2);
      setStatus("Encrypting asset & anchoring to blockchain...");
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("vault_type", vaultType);
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload_document`, uploadData, {
        headers: { Authorization: authHeader, "Content-Type": "multipart/form-data" },
      });

      // Step 3: Completion (100%)
      setStep(3);
      setStatus(`Asset Secured. Lineage: v${uploadRes.data.version} | TX: ${uploadRes.data.tx_hash.substring(0, 12)}...`);
      
    } catch (err) {
      setStatus(`System Error: ${err.response?.data?.detail || "Connection lost"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-black text-white tracking-tighter mb-4 italic">Verify Asset</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Anchor your digital assets to the immutable ledger</p>
        </div>

        {!network?.in_network ? (
            <div className="neo-card p-16 text-center reveal border-blue-500/20 bg-blue-500/5">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto">🏗️</div>
                <h3 className="text-2xl font-black text-white mb-4">Initialize Protocol Hub</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">You must create or join a Hub before you can anchor documents to the blockchain.</p>
                <button onClick={() => navigate("/setup")} className="btn-futuristic">Go to Hub Setup</button>
            </div>
        ) : (
            <div className="neo-card p-12 reveal bg-slate-900/30">
                <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 text-center relative group hover:border-blue-500/30 transition-all">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="relative z-0">
                        {file ? (
                          <div className="space-y-4">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-blue-500/40">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-white">{file.name}</h4>
                            <p className="text-xs text-gray-500 font-mono uppercase">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 text-3xl mx-auto group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tap to Securely Uplink Asset</p>
                          </div>
                        )}
                    </div>
                </div>

                {/* Vault Selection UI */}
                <div className="grid grid-cols-2 gap-6 mt-12">
                    <div 
                        onClick={() => setVaultType("private")}
                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${vaultType === "private" ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xl">🔒</span>
                            <h4 className="font-bold text-white text-sm">Private Vault</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Restricted to Hub members. Full privacy.</p>
                    </div>
                    <div 
                        onClick={() => setVaultType("global")}
                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${vaultType === "global" ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xl">🌐</span>
                            <h4 className="font-bold text-white text-sm">Global Vault</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Publicly verifiable via unique link.</p>
                    </div>
                </div>

                {status && (
                    <div className="mt-12 p-8 bg-black/40 rounded-3xl border border-white/5 reveal">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Process Log</span>
                            <span className="text-blue-500 font-black tracking-widest text-xs">
                                {step === 1 ? '33%' : step === 2 ? '66%' : step === 3 ? '100%' : '0%'}
                            </span>
                        </div>
                        <p className={`text-sm font-bold ${status.includes('Error') || status.includes('Alert') ? 'text-red-400' : 'text-blue-400'}`}>
                            {status}
                        </p>
                        <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${status.includes('Error') ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{width: `${(step/3)*100}%`}}
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={isLoading || !file}
                    className="w-full mt-12 btn-futuristic justify-center py-5 h-20 text-xs shadow-blue-500/20 disabled:opacity-20 translate-y-0 active:translate-y-1 transition-all"
                >
                    {isLoading ? (
                         <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Finalize Verification 
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
