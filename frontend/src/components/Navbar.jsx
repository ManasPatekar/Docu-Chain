import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Verify Asset", path: "/upload", icon: "🛡️" },
    { name: "DocuVault", path: "/history", icon: "🔐" },
    { name: "Global Audit", path: "/network", icon: "🌐" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 flex items-center justify-between shadow-2xl shadow-blue-900/20">
        
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 pl-4 group">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-black tracking-tighter text-lg leading-none">DocuChain</h1>
            <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Nexus Protocol v2.0</span>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === link.path 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </div>

        {/* User / Logout */}
        <div className="flex items-center gap-2 pr-2">
            <Link to="/admin" className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors" title="Hub Settings">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </Link>
            <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;