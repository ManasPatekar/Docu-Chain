import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminConsole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.nodes || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Access Denied: Node Operator privileges required.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-32 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-black heading-futuristic mb-2 italic">Node Directory</h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Registered entities within the DocuChain Ecosystem</p>
        </div>

        {error ? (
          <div className="neo-card p-12 text-center border-red-500/20 bg-red-500/5">
             <div className="text-red-400 font-bold uppercase tracking-widest text-sm mb-4">Security Protocol Block</div>
             <p className="text-gray-400 text-sm">{error}</p>
             <p className="text-[10px] text-gray-500 mt-4 italic">To access this console, your node must be promoted to 'admin' role in the ledger.</p>
          </div>
        ) : (
           <div className="grid gap-4">
            {users.map((user, idx) => (
              <div key={idx} className="neo-card p-6 flex items-center justify-between transition-all hover:bg-white/[0.02]">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 font-bold">
                         {user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-tight">{user.username}</h3>
                        <p className="text-[10px] font-mono text-gray-500 italic">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                    }`}>
                        {user.role}
                    </span>
                    <button className="text-gray-600 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminConsole;
