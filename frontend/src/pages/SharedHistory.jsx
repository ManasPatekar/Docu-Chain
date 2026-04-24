import React, { useState, useEffect } from "react";
import axios from "axios";

function SharedHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(payload.sub);
        } catch(e) {}
    }
    fetchSharedHistory();
  }, []);

  const fetchSharedHistory = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shared-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.network_history || []);
    } catch (error) {
      console.error("Failed to fetch global audit trail", error);
    } finally {
      setLoading(false);
    }
  };

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDownload = async (docId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/share/${docId}?hours=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(response.data.share_url, "_blank");
    } catch (error) {
      alert("Failed to generate download link. Access may be restricted.");
    }
  };

  const handlePreview = (docId) => {
    const token = localStorage.getItem("access_token");
    const url = `${import.meta.env.VITE_API_BASE_URL}/preview/${docId}?token=${token}`;
    setPreviewUrl(url);
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("CRITICAL WARNING:\n\nAre you sure you want to permanently destroy this global asset?")) return;

    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/document/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(item => item.id !== docId));
    } catch (err) {
      alert("Failed to destroy asset: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 inline-block">
             Enterprise Verification Protocol
          </span>
          <h2 className="text-6xl font-black heading-futuristic mb-4 tracking-tighter italic">Global Audit Trail</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Real-time immutable transparency of Hub assets</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
            <div className="neo-card p-20 text-center border-dashed border-white/5 opacity-50">
                 <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">No assets anchored in this Hub ledger yet.</p>
            </div>
        ) : (
          <div className="grid gap-4">
            {history.map((doc, idx) => (
              <div key={idx} className="neo-card p-8 flex flex-col lg:flex-row items-center justify-between gap-8 reveal group border-white/5 bg-slate-900/30 hover:border-blue-500/30 hover:bg-slate-900/50 transition-all duration-500">
                <div className="flex items-center gap-8 w-full flex-1">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${
                    doc.score >= 90 ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  }`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-black text-xl truncate">{doc.filename}</h3>
                        <span className="px-3 py-1 bg-white/5 text-[9px] font-black text-blue-400 rounded-lg border border-white/5">VERIFIED</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-[8px]">{doc.uploader[0].toUpperCase()}</div>
                         <span>{doc.uploader}</span>
                      </div>
                      <span>•</span>
                      <span>ANCHORED: {new Date(doc.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    <div className="text-right shrink-0">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Identity score</div>
                        <div className={`text-3xl font-black ${
                            doc.score >= 90 ? "text-green-500" : "text-blue-500"
                        }`}>{doc.score}%</div>
                    </div>

                    <div className="flex-1 md:w-64">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Lineage</span>
                            <span className="font-mono text-[9px] text-blue-500/50">NODE_AUTH_77X</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${
                                    doc.score >= 90 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                }`}
                                style={{ width: `${doc.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePreview(doc.id)}
                            className="p-4 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-2xl border border-purple-500/20 transition-all duration-300 group shrink-0"
                            title="Preview Verified Asset"
                        >
                            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => handleDownload(doc.id)}
                            className="p-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-2xl border border-blue-500/20 transition-all duration-300 group shrink-0"
                            title="Download Verified Asset"
                        >
                            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                        {currentUser === doc.uploader && (
                            <button 
                                onClick={() => deleteDocument(doc.id)}
                                title="Destroy Global Asset"
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group shrink-0"
                            >
                                <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setPreviewUrl(null)} />
            <div className="relative w-full h-full max-w-6xl bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl reveal">
                <div className="flex items-center justify-between p-8 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Enterprise Preview Protocol active</span>
                    </div>
                    <button 
                        onClick={() => setPreviewUrl(null)}
                        className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Close Portal
                    </button>
                </div>
                <div className="flex-1 bg-white/5 relative">
                    <iframe 
                        src={previewUrl} 
                        className="w-full h-full border-none"
                        title="Document Preview"
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default SharedHistory;
