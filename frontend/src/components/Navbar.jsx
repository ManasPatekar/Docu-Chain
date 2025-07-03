import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between">
      <div className="text-xl font-bold">DocuChain</div>
      <div className="space-x-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/results">Results</Link>
        <Link to="/register">Register</Link>
        <Link to="/">Login</Link>
      </div>
    </nav>
  );
}