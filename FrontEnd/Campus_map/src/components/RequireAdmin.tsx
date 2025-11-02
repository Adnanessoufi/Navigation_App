import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useMe();
  if (loading) return <div className="p-4">Loading…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
