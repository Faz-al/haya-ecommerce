import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";
import { useCart } from "../context/CartContext";

function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function Cart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const cartCurrency =
    cartItems[0]?.currency || "INR";

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1600px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <div className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#7d726a] sm:text-[9px]">
              Your Selection
            </p>

            <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[58px] lg:text-[68px]">
              Shopping Bag
            </h1>

            <p className="mt-4 text-[11px] text-[#71665e]">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="flex w-fit items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#756a62] transition hover:text-[#211c18]"
            >
              <Trash2 size={13} strokeWidth={1.4} />
              Clear Bag
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10">
              <ShoppingBag size={24} strokeWidth={1.2} />
            </span>

            <h2 className="mt-6 font-serif text-[30px] tracking-[-0.03em] sm:text-[38px]">
              Your bag is empty
            </h2>

            <p className="mt-3 max-w-md text-[11px] leading-6 text-[#746960] sm:text-[12px]">
              Discover refined pieces created for effortless modest dressing.
            </p>

            <Link
              to="/shop"
              className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.22em] text-white transition hover:bg-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16 xl:grid-cols-[1fr_420px]">
            <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
              {cartItems.map((item) => (
                <article
                  key={item.cartItemId}
                  className="grid grid-cols-[90px_1fr] gap-4 py-6 sm:grid-cols-[140px_1fr] sm:gap-7 sm:py-8"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="overflow-hidden bg-[#ddd4cc]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="aspect-[4/5] h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.slug}`}
                          className="text-[9px] uppercase leading-[1.55] tracking-[0.13em] transition hover:opacity-60 sm:text-[11px]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-3 text-[10px] leading-[1.8] text-[#7d726a] sm:text-[11px]">
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
                        <Trash2 size={16} strokeWidth={1.2} />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex h-10 w-fit items-center border border-black/15">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(
                              item.cartItemId,
                              item.quantity - 1
                            )
                          }
                          className="flex h-full w-10 items-center justify-center transition hover:bg-white"
                        >
                          <Minus size={13} strokeWidth={1.3} />
                        </button>

                        <span className="flex w-8 justify-center text-[10px]">
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
                          className="flex h-full w-10 items-center justify-center transition hover:bg-white"
                        >
                          <Plus size={13} strokeWidth={1.3} />
                        </button>
                      </div>

                      <div className="text-left text-[11px] sm:text-right sm:text-[12px]">
                        {item.originalPrice && (
                          <span className="mr-2 text-[#948981] line-through">
                            {formatPrice(
                              item.originalPrice * item.quantity,
                              item.currency
                            )}
                          </span>
                        )}

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

            <aside className="h-fit border border-black/[0.1] bg-[#eee7df] p-6 sm:p-8 lg:sticky lg:top-[140px]">
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#756a62]">
                Order Summary
              </p>

              <div className="mt-6 space-y-4 border-b border-black/10 pb-6">
                <div className="flex items-center justify-between text-[10px]">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, cartCurrency)}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#7b7068]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#7b7068]">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em]">
                  Total
                </span>

                <span className="text-[17px]">
                  {formatPrice(subtotal, cartCurrency)}
                </span>
              </div>

              <Link
                to="/checkout"
                className="mt-7 flex w-full items-center justify-center bg-[#211c18] px-5 py-4 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/shop"
                className="mt-5 block text-center text-[8px] uppercase tracking-[0.17em] underline underline-offset-4"
              >
                Continue Shopping
              </Link>

              <div className="mt-7 border-t border-black/10 pt-6">
                <p className="text-[9px] leading-[1.8] text-[#7a6f67]">
                  Shipping and taxes are calculated during checkout. Returns
                  are accepted within 14 days on eligible items.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}