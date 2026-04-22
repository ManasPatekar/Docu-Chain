import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/token`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. System access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 pt-32">
      <div className="neo-card w-full max-w-md p-12 reveal relative overflow-hidden">
        {/* Futuristic accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50" />
        
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-2xl bg-blue-600/10 mb-6 border border-blue-500/20">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09m15.825-2.1c1.465-2.839 2.222-6.014 2.222-9.383 0-2.527-.604-4.881-1.644-6.953m-1.956 12.556L14.004 21m-6-6H6m12-3h-1m2-3h-2.112" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold heading-futuristic mb-4">Auth Console</h2>
          <p className="text-gray-500 font-medium">Verify identity to establish secure uplink</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/5 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2" htmlFor="username">
              User ID
            </label>
            <input
              id="username"
              type="text"
              placeholder="operator_name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neo-input w-full"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2" htmlFor="password">
              Access Token
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neo-input w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-futuristic w-full justify-center py-5"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            ) : (
              <>
                Initialize Uplink
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Request Registration <span className="text-blue-500 ml-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
