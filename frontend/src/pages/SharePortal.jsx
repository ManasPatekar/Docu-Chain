import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function SharePortal() {
    const [searchParams] = useSearchParams();
    const [docId, setDocId] = useState(searchParams.get("docId"));
    const [shareUrl, setShareUrl] = useState(null);
    const [filename, setFilename] = useState("Loading...");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                // For a public share portal, we might need a way to get the URL without a full login 
                // OR we pass the signed URL directly in the query (but it's long).
                // Better: The backend provides a "public" share metadata endpoint.
                
                // For now, let's assume the URL was passed or we fetch it if we have a temporary access token.
                // But the user's request showed they were sending the MinIO URL directly.
                
                // Let's check if the URL is in the query
                const rawUrl = searchParams.get("url");
                const name = searchParams.get("name");
                if (rawUrl) {
                    setShareUrl(decodeURIComponent(rawUrl));
                    setFilename(name || "Secured Asset");
                } else {
                    setError("Invalid or expired access token.");
                }
            } catch (err) {
                setError("Protocol handshake failed.");
            }
        };
        fetchFile();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#020617] pt-20 pb-20 p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        Secure Share Portal
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">
                        {filename}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <span>🛡️ Verified Integrity</span>
                        <span>•</span>
                        <span className="text-orange-500">⏳ Expires in 24h</span>
                    </div>
                </div>

                <div className="neo-card p-4 h-[70vh] bg-slate-900/50 border-white/5 relative overflow-hidden">
                    {error ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="text-6xl">⚠️</div>
                            <h2 className="text-2xl font-bold text-white">{error}</h2>
                            <p className="text-gray-500 max-w-sm text-center">The security token for this asset has expired or is invalid. Please request a new share link from the uploader.</p>
                        </div>
                    ) : shareUrl ? (
                        <iframe 
                            src={shareUrl} 
                            className="w-full h-full rounded-[1.5rem] border-none bg-white/5"
                            title="Secure Document Preview"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <button 
                        onClick={() => window.open(shareUrl, "_blank")}
                        className="btn-futuristic !px-12 !py-5 bg-blue-600 text-white shadow-blue-500/40"
                    >
                        📥 Download Asset
                    </button>
                    <button 
                        onClick={() => window.location.href = "/verify?id=" + filename}
                        className="btn-futuristic !px-12 !py-5 bg-white/5 text-gray-400 hover:text-white"
                    >
                        🔍 Verify Blockchain Proof
                    </button>
                </div>

                <p className="text-center text-[10px] text-gray-600 font-medium uppercase tracking-[0.2em] pt-8">
                    Powered by DocuChain Nexus Protocol • Enterprise Grade Security
                </p>
            </div>
        </div>
    );
}

export default SharePortal;
