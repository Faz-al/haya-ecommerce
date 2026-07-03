import { useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Package,
  UserRound,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { navigation } from "../../data/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useOrders } from "../../context/OrderContext";

function getLinkLabel(link) {
  return typeof link === "string" ? link : link.label;
}

function getLinkHref(link) {
  return typeof link === "string" ? "/shop" : link.href;
}

export default function MobileMenu({
  open,
  onClose,
}) {
  const navigate = useNavigate();

  const [expanded, setExpanded] =
    useState(null);

  const [signingOut, setSigningOut] =
    useState(false);

  const {
    user,
    authLoading,
    signOut,
  } = useAuth();

  const { wishlistCount } = useWishlist();
  const { orderCount } = useOrders();

  const toggleSection = (index) => {
    setExpanded((current) =>
      current === index ? null : index
    );
  };

  const handleLinkClick = () => {
    setExpanded(null);
    onClose();
  };

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
    setExpanded(null);
    onClose();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/35"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed left-0 top-0 z-[100] flex h-full w-[88%] max-w-[390px] flex-col overflow-y-auto bg-[#f5f1ec] text-[#1f1a17]"
          >
            <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-black/10 px-5">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="font-serif text-[30px] italic tracking-[-0.04em]"
              >
                haya
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center"
              >
                <X
                  size={24}
                  strokeWidth={1.2}
                />
              </button>
            </div>

            <nav>
              {navigation.map((item, index) => {
                const hasChildren = Boolean(
                  item.columns
                );

                const isExpanded =
                  expanded === index;

                return (
                  <div
                    key={item.label}
                    className="border-b border-black/10"
                  >
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            toggleSection(index)
                          }
                          className="flex w-full items-center justify-between px-5 py-5 text-left text-[13px] uppercase tracking-[0.18em]"
                        >
                          {item.label}

                          <ChevronDown
                            size={16}
                            strokeWidth={1.3}
                            className={`transition-transform duration-300 ${
                              isExpanded
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence
                          initial={false}
                        >
                          {isExpanded && (
                            <motion.div
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                              }}
                              className="overflow-hidden bg-[#eee8e1]"
                            >
                              <div className="space-y-7 px-6 pb-6 pt-1">
                                <Link
                                  to={item.href}
                                  onClick={
                                    handleLinkClick
                                  }
                                  className="block border-b border-black/[0.08] pb-4 text-[10px] uppercase tracking-[0.18em] text-[#211c18]"
                                >
                                  View All{" "}
                                  {item.label}
                                </Link>

                                {item.columns.map(
                                  (column) => (
                                    <div
                                      key={
                                        column.title
                                      }
                                    >
                                      <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-black/45">
                                        {
                                          column.title
                                        }
                                      </p>

                                      <ul className="space-y-3">
                                        {column.links.map(
                                          (link) => (
                                            <li
                                              key={getLinkLabel(
                                                link
                                              )}
                                            >
                                              <Link
                                                to={getLinkHref(
                                                  link
                                                )}
                                                onClick={
                                                  handleLinkClick
                                                }
                                                className="text-[13px]"
                                              >
                                                {getLinkLabel(
                                                  link
                                                )}
                                              </Link>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className="block px-5 py-5 text-[13px] uppercase tracking-[0.18em]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="border-b border-black/10 px-5 py-6">
              <p className="mb-5 text-[8px] uppercase tracking-[0.25em] text-black/45">
                Customer
              </p>

              <div className="space-y-1">
                {!authLoading && user ? (
                  <>
                    <Link
                      to="/account"
                      onClick={handleLinkClick}
                      className="flex min-h-12 items-center justify-between border-b border-black/[0.07] py-3"
                    >
                      <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                        <UserRound
                          size={17}
                          strokeWidth={1.3}
                        />
                        My Account
                      </span>

                      {orderCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211c18] px-1.5 text-[7px] text-white">
                          {orderCount > 99
                            ? "99+"
                            : orderCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/account"
                      onClick={handleLinkClick}
                      className="flex min-h-12 items-center justify-between border-b border-black/[0.07] py-3"
                    >
                      <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                        <Package
                          size={17}
                          strokeWidth={1.3}
                        />
                        My Orders
                      </span>

                      <span className="text-[9px] text-black/50">
                        {orderCount}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex min-h-12 w-full items-center gap-3 py-3 text-left text-[11px] uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut
                        size={17}
                        strokeWidth={1.3}
                      />

                      {signingOut
                        ? "Signing Out"
                        : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={handleLinkClick}
                    className="flex min-h-12 items-center gap-3 py-3 text-[11px] uppercase tracking-[0.16em]"
                  >
                    <LogIn
                      size={17}
                      strokeWidth={1.3}
                    />
                    Sign In / Create Account
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-1 px-5 py-6">
              <Link
                to="/wishlist"
                onClick={handleLinkClick}
                className="flex min-h-12 items-center justify-between border-b border-black/[0.07] py-3"
              >
                <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                  <Heart
                    size={17}
                    strokeWidth={1.3}
                    className={
                      wishlistCount > 0
                        ? "fill-current"
                        : "fill-transparent"
                    }
                  />
                  Wishlist
                </span>

                <span className="text-[9px] text-black/50">
                  {wishlistCount}
                </span>
              </Link>

              <Link
                to="/shop"
                onClick={handleLinkClick}
                className="block min-h-12 py-4 text-[11px] uppercase tracking-[0.16em]"
              >
                Continue Shopping
              </Link>
            </div>

            {user && (
              <div className="mt-auto border-t border-black/10 px-5 py-5">
                <p className="text-[8px] uppercase tracking-[0.2em] text-black/45">
                  Signed in as
                </p>

                <p className="mt-2 break-all text-[10px]">
                  {user.email}
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}