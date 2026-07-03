import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { navigation } from "../../data/navigation";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import CartButton from "../cart/CartButton";

import { useSearch } from "../../context/SearchContext";
import { useWishlist } from "../../context/WishlistContext";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({
  forceSolid = false,
}) {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const { openSearch } = useSearch();
  const { wishlistCount } = useWishlist();
  const { orderCount } = useOrders();

  const {
    user,
    authLoading,
    signOut,
  } = useAuth();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 70);
        ticking = false;
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await signOut();

    if (error) {
      console.error("Failed to sign out:", error);
      setSigningOut(false);
      return;
    }

    setSigningOut(false);
    navigate("/", {
      replace: true,
    });
  };

  const solidHeader =
  forceSolid ||
  scrolled ||
  hovered ||
  activeMenu !== null;

  const textColor = solidHeader
    ? "text-[#1c1917]"
    : "text-white";

  return (
    <>
      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setActiveMenu(null);
        }}
        className={`fixed inset-x-0 top-[35px] z-[80] overflow-visible transition-[box-shadow] duration-500 ease-out ${
          solidHeader
            ? "shadow-[0_1px_0_rgba(0,0,0,0.08)]"
            : "shadow-none"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            solidHeader ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[#f5f1ec]/96 backdrop-blur-md" />
        </div>

        <div className="relative z-10 mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-4 sm:h-[68px] sm:px-7 md:h-[70px] md:px-8 lg:h-[78px] lg:px-12">
          <div
            className={`flex items-center gap-4 transition-colors duration-500 ease-out ${textColor}`}
          >
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="transition-opacity hover:opacity-60 lg:hidden"
            >
              <Menu size={24} strokeWidth={1.2} />
            </button>

            <button
              type="button"
              aria-label="Search"
              onClick={openSearch}
              className="transition-opacity hover:opacity-60 lg:hidden"
            >
              <Search size={23} strokeWidth={1.2} />
            </button>

            <nav className="hidden items-center gap-7 lg:flex xl:gap-8">
              {navigation.map((item, index) => (
                <div
                  key={item.label}
                  onMouseEnter={() =>
                    setActiveMenu(
                      item.columns ? index : null
                    )
                  }
                >
                  <Link
                    to={item.href}
                    className="text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-55"
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <Link
            to="/"
            className={`absolute left-1/2 -translate-x-1/2 font-serif text-[31px] italic leading-none tracking-[-0.05em] transition-colors duration-500 ease-out sm:text-[33px] md:text-[34px] lg:text-[38px] ${textColor}`}
          >
            haya
          </Link>

          <div
            className={`flex items-center gap-2 transition-colors duration-500 ease-out sm:gap-3 lg:gap-5 ${textColor}`}
          >
            <button
              type="button"
              aria-label="Search"
              onClick={openSearch}
              className="hidden h-10 w-10 items-center justify-center transition-opacity hover:opacity-60 lg:flex"
            >
              <Search size={22} strokeWidth={1.2} />
            </button>

            {!authLoading && user ? (
              <>
                <Link
                  to="/account"
                  aria-label={`Account with ${orderCount} orders`}
                  title="My account"
                  className="relative hidden h-10 w-10 items-center justify-center transition-opacity hover:opacity-60 sm:flex"
                >
                  <UserRound
                    size={23}
                    strokeWidth={1.15}
                  />

                  {orderCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#211c18] px-1 text-[7px] font-medium leading-none text-white">
                      {orderCount > 99
                        ? "99+"
                        : orderCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-label="Sign out"
                  title="Sign out"
                  className="hidden h-10 w-10 items-center justify-center transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                >
                  <LogOut
                    size={21}
                    strokeWidth={1.2}
                  />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                aria-label="Sign in"
                title="Sign in"
                className="hidden h-10 w-10 items-center justify-center transition-opacity hover:opacity-60 sm:flex"
              >
                <LogIn
                  size={22}
                  strokeWidth={1.2}
                />
              </Link>
            )}

            <Link
              to="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
              className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <Heart
                size={22}
                strokeWidth={1.2}
                className={
                  wishlistCount > 0
                    ? "fill-current"
                    : "fill-transparent"
                }
              />

              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#211c18] px-1 text-[7px] font-medium leading-none text-white">
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            <CartButton className="h-10 w-10 transition-opacity hover:opacity-60" />
          </div>
        </div>

        <AnimatePresence>
          {activeMenu !== null &&
            navigation[activeMenu]?.columns && (
              <MegaMenu
                item={navigation[activeMenu]}
                onClose={() => setActiveMenu(null)}
              />
            )}
        </AnimatePresence>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}