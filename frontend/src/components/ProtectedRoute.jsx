import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}