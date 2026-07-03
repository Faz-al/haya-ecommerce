import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1ec] text-[#211c18]">
        <p className="text-[9px] uppercase tracking-[0.22em]">
          Loading account
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children;
}