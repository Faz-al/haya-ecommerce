import {
  Boxes,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function getNavClass({ isActive }) {
  return [
    "flex shrink-0 items-center justify-center gap-2 px-4 py-3",
    "text-[8px] uppercase tracking-[0.14em]",
    "transition",
    "lg:justify-start lg:gap-3 lg:tracking-[0.16em]",
    isActive
      ? "bg-[#211c18] text-white"
      : "text-[#70655d] hover:bg-black/[0.05]",
  ].join(" ");
}

export default function AdminLayout() {
  const navigate = useNavigate();

  const {
    user,
    adminRole,
    signOut,
  } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      console.error("Admin sign out failed:", error);
      return;
    }

    navigate("/auth", {
      replace: true,
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f2eee9] text-[#211c18]">
      <header className="border-b border-white/10 bg-[#211c18] text-white">
        <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          <Link to="/admin" className="min-w-0 shrink-0">
            <p className="font-serif text-[25px] tracking-[-0.03em]">
              Haya
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-[0.24em] text-white/60">
              Administration
            </p>
          </Link>

          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-[220px] truncate text-[9px] text-white/85">
                {user?.email}
              </p>

              <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-white/50">
                {adminRole}
              </p>
            </div>

            <Link
              to="/"
              className="flex shrink-0 items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-white/70 transition hover:text-white sm:tracking-[0.18em]"
            >
              <Store size={14} strokeWidth={1.4} />
              <span className="hidden sm:inline">
                View Store
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-[#e9e2da] px-4 py-4 sm:px-7 lg:min-h-[calc(100vh-80px)] lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex items-center justify-between gap-4 lg:block">
            <p className="shrink-0 text-[7px] uppercase tracking-[0.23em] text-[#766b63]">
              Admin Menu
            </p>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex shrink-0 items-center gap-2 text-[7px] uppercase tracking-[0.14em] text-[#70655d] transition hover:text-[#211c18] lg:hidden"
            >
              <LogOut size={14} strokeWidth={1.4} />
              Sign Out
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-5 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
            <NavLink
              to="/admin"
              end
              className={getNavClass}
            >
              <LayoutDashboard
                size={15}
                strokeWidth={1.4}
              />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/products"
              className={getNavClass}
            >
              <Boxes
                size={15}
                strokeWidth={1.4}
              />
              Products
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={getNavClass}
            >
              <ShoppingBag
                size={15}
                strokeWidth={1.4}
              />
              Orders
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-7 hidden w-full items-center gap-3 border-t border-black/10 px-4 pt-6 text-[8px] uppercase tracking-[0.16em] text-[#70655d] transition hover:text-[#211c18] lg:flex"
          >
            <LogOut
              size={15}
              strokeWidth={1.4}
            />
            Sign Out
          </button>
        </aside>

        <section className="min-w-0 overflow-x-hidden px-4 py-8 sm:px-7 lg:px-10 lg:py-12">
          <Outlet />
        </section>
      </div>
    </main>
  );
}