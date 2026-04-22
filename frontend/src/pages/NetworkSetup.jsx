import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NetworkSetup() {
  const [hubName, setHubName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (action) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    
    let endpoint = "";
    if (action === 'create') {
      endpoint = "/networks/create";
      formData.append("name", hubName);
    } else {
      endpoint = "/networks/join";
      formData.append("invite_code", inviteCode);
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // CRITICAL: Replace old token with the fresh one containing network permissions
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Protocol alignment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 reveal">
        
        {/* Create Hub */}
        <div className="neo-card p-12 space-y-8 bg-blue-600/5 border-blue-500/20">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">🏗️</div>
            <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-2 italic">Found a New Hub</h2>
                 <p className="text-gray-500 text-sm font-medium">Initialize an isolated organizational network</p>
            </div>
            <div className="space-y-4 pt-4">
                <input 
                    type="text" 
                    placeholder="Hub Name (e.g. DocuChain HQ)" 
                    className="neo-input w-full"
                    value={hubName}
                    onChange={(e) => setHubName(e.target.value)}
                />
                <button 
                  onClick={() => handleAction('create')} 
                  disabled={loading || !hubName}
                  className="btn-futuristic w-full justify-center py-5 shadow-blue-500/10"
                >
                    Initialize Protocol
                </button>
            </div>
        </div>

        {/* Join Hub */}
        <div className="neo-card p-12 space-y-8 bg-slate-900/40">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">🔗</div>
            <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-2 italic">Join Authorized Hub</h2>
                 <p className="text-gray-500 text-sm font-medium">Align your node with an existing network</p>
            </div>
            <div className="space-y-4 pt-4">
                <input 
                    type="text" 
                    placeholder="8-Character Invite Code" 
                    className="neo-input w-full uppercase tracking-[0.2em] font-mono text-center"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                />
                <button 
                  onClick={() => handleAction('join')}
                  disabled={loading || !inviteCode}
                  className="px-8 py-5 rounded-2xl bg-white/5 text-gray-400 font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all w-full"
                >
                    Connect Node
                </button>
            </div>
        </div>

        {error && (
            <div className="md:col-span-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl">
                 {error}
            </div>
        )}
      </div>
    </div>
  );
}
