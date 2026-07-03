import { AnimatePresence, motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";

function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    subtotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const cartCurrency =
    cartItems[0]?.currency || "INR";

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close shopping bag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[150] bg-black/40"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-[160] flex h-full w-full max-w-[460px] flex-col bg-[#f5f1ec]"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-black/10 px-5 sm:px-7">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.25} />

                <h2 className="text-[10px] uppercase tracking-[0.22em]">
                  Your Bag
                </h2>

                <span className="text-[9px] text-[#80756d]">
                  ({cartCount})
                </span>
              </div>

              <button
                type="button"
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="flex h-10 w-10 items-center justify-center"
              >
                <X size={22} strokeWidth={1.2} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag
                  size={32}
                  strokeWidth={1}
                  className="text-[#81766e]"
                />

                <h3 className="mt-5 font-serif text-[30px] tracking-[-0.03em]">
                  Your bag is empty
                </h3>

                <p className="mt-3 max-w-[280px] text-[12px] leading-[1.8] text-[#756b63]">
                  Discover refined pieces created for effortless modest
                  dressing.
                </p>

                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="mt-7 bg-[#211c18] px-8 py-4 text-[9px] uppercase tracking-[0.2em] text-white"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-black/[0.08] px-5 sm:px-7">
                    {cartItems.map((item) => (
                      <article
                        key={item.cartItemId}
                        className="grid grid-cols-[95px_1fr] gap-4 py-6"
                      >
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="overflow-hidden bg-[#ddd4cc]"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="aspect-[4/5] h-full w-full object-cover"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                to={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="text-[9px] uppercase leading-[1.55] tracking-[0.13em] text-[#211c18]"
                              >
                                {item.name}
                              </Link>

                              <p className="mt-2 text-[10px] leading-[1.7] text-[#7d726a]">
                                Colour: {item.colour || "Not selected"}
                                <br />
                                Size: {item.size || "One Size"}

                                {item.sku && (
                                  <>
                                    <br />
                                    SKU: {item.sku}
                                  </>
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(item.cartItemId)
                              }
                              aria-label={`Remove ${item.name}`}
                              className="shrink-0 text-[#81766e] transition hover:text-[#211c18]"
                            >
                              <Trash2 size={15} strokeWidth={1.2} />
                            </button>
                          </div>

                          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                            <div className="flex h-9 items-center border border-black/15">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  updateQuantity(
                                    item.cartItemId,
                                    item.quantity - 1
                                  )
                                }
                                className="flex h-full w-9 items-center justify-center"
                              >
                                <Minus size={12} strokeWidth={1.3} />
                              </button>

                              <span className="flex w-7 justify-center text-[10px]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(
                                    item.cartItemId,
                                    item.quantity + 1
                                  )
                                }
                                className="flex h-full w-9 items-center justify-center"
                              >
                                <Plus size={12} strokeWidth={1.3} />
                              </button>
                            </div>

                            <div className="text-right text-[10px]">
                              <span>
                                {formatPrice(
                                  item.price * item.quantity,
                                  item.currency
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 border-t border-black/10 bg-[#f5f1ec] px-5 py-5 sm:px-7">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.19em]">
                      Subtotal
                    </span>

                    <span className="text-[13px]">
                      {formatPrice(subtotal, cartCurrency)}
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-[1.6] text-[#81766e]">
                    Shipping and taxes are calculated at checkout.
                  </p>

                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="mt-5 flex w-full items-center justify-center bg-[#211c18] px-5 py-4 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
                  >
                    View Bag & Checkout
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      to="/shop"
                      onClick={closeCart}
                      className="text-[8px] uppercase tracking-[0.17em] underline underline-offset-4"
                    >
                      Continue Shopping
                    </Link>

                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[8px] uppercase tracking-[0.17em] text-[#81766e] underline underline-offset-4"
                    >
                      Clear Bag
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}