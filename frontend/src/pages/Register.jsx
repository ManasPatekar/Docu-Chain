import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("email", email);
    params.append("password", password);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, params);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Data integrity mismatch.");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold heading-futuristic mb-4">Initialize Identity</h2>
          <p className="text-gray-500 font-medium">Create your decentralized credential vault</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/5 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Username</label>
            <input
              type="text"
              placeholder="set_operator_id"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neo-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
            <input
              type="email"
              placeholder="network@node.xyz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neo-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Security Hash (Password)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neo-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-futuristic w-full justify-center py-5 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            ) : (
              <>
                Register Node
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Already Synced? <span className="text-blue-500 ml-1">Log In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
