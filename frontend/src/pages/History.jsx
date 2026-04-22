import React, { useState, useEffect } from "react";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [shareLink, setShareLink] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length < 2) {
      if (e.target.value === "") fetchHistory();
      return;
    }
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search?query=${e.target.value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateShareLink = async (docId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/share/${docId}?hours=24`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShareLink({ id: docId, url: response.data.share_url });
    } catch (err) {
      alert("Failed to generate secure link");
    }
  };

  const shareToWhatsApp = (url, filename) => {
    const message = `🛡️ *DocuChain Verified Asset* 🛡️\n\nI am sharing a cryptographically secured document with you: *${filename}*.\n\n🔗 *Secure View Link* (Active 24h):\n${url}\n\n_Verified via DocuChain Nexus Protocol_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("CRITICAL WARNING:\n\nAre you sure you want to permanently destroy this asset?\nThis action will remove the file from the enterprise vault and wipe its local history.")) return;

    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/document/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from UI immediately for snappy feeling
      setHistory(prev => prev.filter(item => item.id !== docId));
      if (shareLink?.id === docId) setShareLink(null);
    } catch (err) {
      alert("Failed to destroy asset: " + (err.response?.data?.detail || err.message));
    }
  };

  const pushToGlobalVault = async (docId) => {
    if (!window.confirm("Do you want to publish this private asset to the Global Vault?\n\nThis will make it accessible to all users in the network ledger.")) return;

    const token = localStorage.getItem("access_token");
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/document/${docId}/make-public`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update UI state to reflect it's now public
      setHistory(prev => prev.map(item => item.id === docId ? { ...item, is_public: 1 } : item));
      alert("Asset successfully published to Global Vault.");
    } catch (err) {
      alert("Failed to publish asset: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-32 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div>
                 <h2 className="text-4xl font-black heading-futuristic mb-2 italic">DocuVault AI</h2>
                 <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Version Lineage & Secure Distribution</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
                <input 
                    type="text" 
                    placeholder="Search content (e.g. 'salary', 'intern')..."
                    className="neo-input w-full pl-12 pr-4 py-4 text-sm"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        {history.length === 0 ? (
          <div className="neo-card p-16 text-center reveal">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching assets found</p>
          </div>
        ) : (
           <div className="grid gap-4">
            {history.map((item, idx) => (
              <div key={idx} className="neo-card p-6 flex flex-col reveal border-white/5 hover:bg-white/[0.02] transition-colors group gap-6">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                  <div className="flex items-center gap-6 flex-1 min-w-0 w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-blue-500/5 border-blue-500/20 text-blue-400 shrink-0">
                           {item.type === 'CERTIFICATE' ? '🎓' : item.type === 'FINANCIAL' ? '💵' : '📄'}
                      </div>
                      <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 min-w-0 w-full">
                              <h3 className="text-white font-bold tracking-tight truncate">{item.filename}</h3>
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-[8px] font-black text-blue-400 uppercase shrink-0">v{item.version}</span>
                          </div>
                          <div className="flex items-center gap-3 truncate text-ellipsis overflow-hidden">
                               <span className="text-[10px] font-mono text-blue-500 opacity-60 shrink-0">TX: {item.txId?.substring(0, 18)}...</span>
                               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest shrink-0">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-white/5 shrink-0">
                      <div className="text-right hidden sm:block shrink-0">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Integrity</div>
                          <div className={`text-xl font-black ${item.score >= 90 ? "text-green-500" : "text-yellow-500"}`}>{item.score}%</div>
                      </div>
                      <div className="flex items-center gap-2 flex-1 md:flex-none">
                          {item.is_public === 0 && (
                              <button 
                                  onClick={() => pushToGlobalVault(item.id)}
                                  title="Push to Global Vault"
                                  className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all group shrink-0"
                              >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                          )}
                          <button 
                              onClick={() => generateShareLink(item.id)}
                              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
                          >
                              Secure Share
                          </button>
                          
                          <button 
                              onClick={() => deleteDocument(item.id)}
                              title="Destroy Asset"
                              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group shrink-0"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                  </div>
                </div>

                {shareLink?.id === item.id && (
                  <div className="w-full mt-4 p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col md:flex-row gap-8 reveal relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
                      
                      <div className="flex flex-col items-center gap-4 shrink-0">
                         <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-2xl">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + "/verify?id=" + item.txId)}`} alt="Scan QR" className="w-full h-full" />
                         </div>
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Offline Verification QR</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-6 min-w-0">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Temporary Access Token</span>
                            <div className="mt-3 flex gap-2 min-w-0">
                                <input readOnly value={shareLink.url} className="bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-gray-400 flex-1 min-w-0 truncate" />
                                <button onClick={() => {navigator.clipboard.writeText(shareLink.url); alert('Protocol Hash Copied');}} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                                     <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" /></svg>
                                </button>
                            </div>
                          </div>

                          <div className="flex gap-4">
                              <button 
                                onClick={() => shareToWhatsApp(shareLink.url, item.filename)}
                                className="flex-1 px-8 py-4 bg-[#25D366] rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-[#25D366]/20"
                              >
                                 <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.411 0 .01 5.403.007 12.04c0 2.12.552 4.19 1.598 6.04L0 24l6.088-1.598a11.83 11.83 0 005.957 1.601h.005c6.637 0 12.038-5.404 12.041-12.04a11.85 11.85 0 00-3.527-8.527z"/></svg>
                                 Push to WhatsApp
                              </button>
                              <button onClick={() => setShareLink(null)} className="px-8 py-4 bg-white/5 rounded-xl text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                                 Dismiss
                              </button>
                          </div>
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
