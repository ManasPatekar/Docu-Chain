import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/networks/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.in_network) {
          navigate("/setup");
        } else {
          setNetwork(response.data);
        }
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    checkNetwork();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Active Nodes", value: "08", icon: "🔗", detail: "Network Integrity: 100%" },
    { label: "Encrypted Storage", value: "1.2 GB", icon: "📦", detail: "MinIO S3 Secured" },
    { label: "Ledger Blocks", value: "249", icon: "⛓️", detail: "Hyperledger Fabric Live" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="reveal space-y-12">
        
        {/* Hub Hero */}
        <div className="relative p-12 overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600/80 to-indigo-900 shadow-2xl shadow-blue-500/20">
            {/* Visual background elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                           Active Hub: {network?.name}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white leading-none tracking-tighter">
                        Docu<span className="text-blue-300">Chain</span> <br/> 
                        <span className="opacity-90 italic">Dashboard</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-md font-medium leading-relaxed">
                        Securely anchoring enterprise assets to the immutable ledger. You are operating as an <strong>{network?.role}</strong> within this protocol.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button onClick={() => navigate("/upload")} className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                            Secure New Asset
                        </button>
                        <button onClick={() => navigate("/history")} className="px-8 py-4 bg-blue-700 text-white font-black rounded-2xl shadow-xl hover:bg-blue-800 transition-all text-xs uppercase tracking-widest">
                            Open Vault
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-4">
                    <div className="bg-black/20 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm">
                        <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-4 block text-center">Protocol invite code</span>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center relative group">
                            <span className="text-4xl font-black text-white tracking-[0.2em] font-mono">{network?.invite_code}</span>
                            <div className="absolute inset-0 bg-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => {navigator.clipboard.writeText(network.invite_code); alert('Hub Invite Copied');}}>
                                <span className="text-xs font-black text-white uppercase tracking-widest">Copy Invitation Code</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-white/40 uppercase font-bold text-center mt-6 leading-loose">
                            Share this cryptographic token with authorized personnel to onboard them to the Hub.
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                            <button 
                                onClick={async () => {
                                    if(window.confirm('Sever connection with this Hub? All access will be revoked.')) {
                                        const token = localStorage.getItem("access_token");
                                        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/networks/leave`, {}, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        localStorage.setItem("access_token", res.data.access_token);
                                        navigate("/setup");
                                    }
                                }}
                                className="w-full py-4 bg-[#1e293b] hover:bg-blue-600 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl"
                            >
                                Leave Network Hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="neo-card p-10 relative overflow-hidden group border-white/5 bg-slate-900/40">
              <div className="absolute -top-10 -right-10 opacity-[0.03] text-9xl group-hover:scale-110 transition-transform duration-700">{stat.icon}</div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-3xl">{stat.icon}</div>
                <div>
                   <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                   <div className="text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mt-1">{stat.label}</div>
                </div>
                <div className="pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            <div className="neo-card p-12 bg-gradient-to-br from-slate-900 to-black overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rotate-45 translate-x-16 -translate-y-16" />
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">AI Network Analytics</h3>
                <div className="space-y-6">
                    {[
                        { label: "Document Authenticity", progress: "100%" },
                        { label: "Tamper Protection", progress: "99.9%" },
                        { label: "Threat Detection", progress: "Active" }
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                <span>{item.label}</span>
                                <span className="text-blue-400">{item.progress}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{width: '100%'}} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="neo-card p-12 flex flex-col justify-center border-blue-500/20 bg-blue-600/5 group hover:bg-blue-600 transition-all duration-500 cursor-pointer" onClick={() => navigate("/network")}>
                <span className="text-blue-400 group-hover:text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Enterprise Transparency</span>
                <h3 className="text-4xl font-black text-white mb-6 leading-tight tracking-tighter group-hover:scale-105 transition-transform origin-left">Explore the <br/> Global Audit Trail</h3>
                <p className="text-gray-500 group-hover:text-white/80 font-medium mb-8">View real-time cryptographic logs of all assets anchored to the hub network by authorized nodes.</p>
                <div className="flex items-center gap-4 text-blue-400 group-hover:text-white font-black text-xs uppercase tracking-[0.2em]">
                    Open Audit History
                    <div className="w-12 h-px bg-current group-hover:w-20 transition-all" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
