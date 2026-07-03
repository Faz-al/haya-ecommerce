import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function formatPrice(
  amount,
  currency = "INR"
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

function getDefaultVariant(product) {
  return product.variants?.find(
    (variant) => variant.inStock
  );
}

export default function Wishlist() {
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const handleAddToBag = (product) => {
    const defaultVariant =
      getDefaultVariant(product);

    if (!defaultVariant) {
      return;
    }

    addToCart({
      product,
      variant: defaultVariant,
      colour:
        defaultVariant.colour ||
        product.colours?.[0] ||
        "",
      size:
        defaultVariant.size ||
        product.sizes?.[0] ||
        "One Size",
      quantity: 1,
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1600px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <div className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#7d726a] sm:text-[9px]">
              Saved Pieces
            </p>

            <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[58px] lg:text-[68px]">
              Wishlist
            </h1>

            <p className="mt-4 text-[11px] text-[#71665e]">
              {wishlistCount}{" "}
              {wishlistCount === 1
                ? "item"
                : "items"}{" "}
              saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="flex w-fit items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#756a62] transition hover:text-[#211c18]"
            >
              <Trash2
                size={13}
                strokeWidth={1.4}
              />
              Clear Wishlist
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10">
              <Heart
                size={24}
                strokeWidth={1.2}
              />
            </span>

            <h2 className="mt-6 font-serif text-[30px] tracking-[-0.03em] sm:text-[38px]">
              Your wishlist is empty
            </h2>

            <p className="mt-3 max-w-md text-[11px] leading-6 text-[#746960] sm:text-[12px]">
              Save the pieces you love by clicking the heart icon while browsing the collection.
            </p>

            <Link
              to="/shop"
              className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.22em] text-white transition hover:bg-black"
            >
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {wishlistItems.map((product) => {
              const defaultVariant =
                getDefaultVariant(product);

              const canQuickAdd =
                product.inStock &&
                Boolean(defaultVariant);

              return (
                <article
                  key={product.id}
                  className="group min-w-0"
                >
                  <div className="relative overflow-hidden bg-[#ddd4cc]">
                    <Link
                      to={`/product/${product.slug}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                      />
                    </Link>

                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from wishlist`}
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f1ec]/95 backdrop-blur-sm transition hover:bg-white"
                    >
                      <Heart
                        size={16}
                        strokeWidth={1.4}
                        className="fill-[#211c18] text-[#211c18]"
                      />
                    </button>

                    {canQuickAdd ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToBag(product)
                        }
                        className="absolute inset-x-3 bottom-3 flex min-h-11 items-center justify-center gap-2 bg-[#f5f1ec]/95 px-3 text-[8px] uppercase tracking-[0.18em] text-[#211c18] backdrop-blur-md transition hover:bg-white"
                      >
                        <ShoppingBag
                          size={13}
                          strokeWidth={1.4}
                        />
                        Add to Bag
                      </button>
                    ) : (
                      <Link
                        to={`/product/${product.slug}`}
                        className="absolute inset-x-3 bottom-3 flex min-h-11 items-center justify-center gap-2 bg-[#f5f1ec]/95 px-3 text-[8px] uppercase tracking-[0.18em] text-[#211c18] backdrop-blur-md transition hover:bg-white"
                      >
                        View Product
                      </Link>
                    )}
                  </div>

                  <div className="pt-4">
                    <p className="text-[7px] uppercase tracking-[0.2em] text-[#857a72] sm:text-[8px]">
                      {product.category}
                    </p>

                    <div className="mt-1.5 flex items-start justify-between gap-3">
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-[9px] uppercase leading-[1.45] tracking-[0.11em] transition hover:opacity-60 sm:text-[10px]"
                      >
                        {product.name}
                      </Link>

                      <div className="shrink-0 text-right text-[9px] sm:text-[10px]">
                        {product.originalPrice && (
                          <span className="mr-2 text-[#948981] line-through">
                            {formatPrice(
                              product.originalPrice,
                              product.currency
                            )}
                          </span>
                        )}

                        <span>
                          {formatPrice(
                            product.price,
                            product.currency
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      className="mt-4 text-[7px] uppercase tracking-[0.17em] text-[#7a6f67] underline underline-offset-4 transition hover:text-[#211c18]"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}