import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({
  children,
}) {
  const location = useLocation();

  const {
    user,
    authLoading,
    adminLoading,
    adminError,
    isAdmin,
    checkAdminAccess,
  } = useAuth();

  if (authLoading || adminLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1ec] text-[#211c18]">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />

          <p className="mt-5 text-[9px] uppercase tracking-[0.22em]">
            Verifying admin access
          </p>
        </div>
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

  if (adminError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1ec] px-5 text-center text-[#211c18]">
        <div className="max-w-md">
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#9b493f]">
            Access Check Failed
          </p>

          <h1 className="mt-4 font-serif text-[38px] tracking-[-0.04em]">
            Admin unavailable
          </h1>

          <p className="mt-4 text-[11px] leading-6 text-[#71665e]">
            {adminError}
          </p>

          <button
            type="button"
            onClick={() =>
              checkAdminAccess(user)
            }
            className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.21em] text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return children;
}