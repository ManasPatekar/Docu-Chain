import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token"); // ✅ Correct key

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
