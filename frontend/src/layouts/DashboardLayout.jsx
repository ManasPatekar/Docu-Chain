// src/layouts/DashboardLayout.jsx
import { Outlet, NavLink } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <aside className="w-64 bg-slate-950 shadow-lg border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 text-3xl font-extrabold text-cyan-400 tracking-wide">DocuChain</div>
          <nav className="flex flex-col gap-4 p-4 text-lg">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-cyan-300 font-semibold" : "hover:text-cyan-400 transition-all"}>Dashboard</NavLink>
            <NavLink to="/upload" className={({ isActive }) => isActive ? "text-cyan-300 font-semibold" : "hover:text-cyan-400 transition-all"}>Upload</NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? "text-cyan-300 font-semibold" : "hover:text-cyan-400 transition-all"}>History</NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "text-cyan-300 font-semibold" : "hover:text-cyan-400 transition-all"}>Settings</NavLink>
          </nav>
        </div>

        {/* Add these at the bottom of the sidebar */}
        <div className="p-4 flex flex-col gap-2">
          <NavLink to="/login" className="text-center bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md">Login</NavLink>
          <NavLink to="/register" className="text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md">Register</NavLink>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-slate-900 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
