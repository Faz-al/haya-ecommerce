import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import WishlistButton from "../wishlist/WishlistButton";
import { useCart } from "../../context/CartContext";

function formatPrice(
  amount,
  currency = "INR"
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function ProductCard({
  product,
}) {
  const { addToCart } = useCart();

  const defaultVariant =
    product.variants?.find(
      (variant) => variant.inStock
    );

  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !product.inStock ||
      !defaultVariant
    ) {
      return;
    }

    addToCart({
      product,
      variant: defaultVariant,
      colour: defaultVariant.colour,
      size: defaultVariant.size,
      quantity: 1,
    });
  };

  return (
    <article className="group min-w-0">
      <Link
        to={`/product/${product.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden bg-[#ddd4cc]">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          <img
            src={
              product.secondaryImage ||
              product.image
            }
            alt=""
            className="absolute inset-0 aspect-[4/5] h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-[1.025] group-hover:opacity-100"
          />

          <WishlistButton
            product={product}
            className="absolute right-3 top-3 z-10 h-8 w-8 bg-[#f5f1ec]/90 text-[#211c18] hover:bg-white"
          />

          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
            {product.isNew && (
              <span className="bg-[#f5f1ec]/95 px-2.5 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#211c18] backdrop-blur-sm">
                New
              </span>
            )}

            {product.originalPrice && (
              <span className="bg-[#211c18] px-2.5 py-1.5 text-[7px] uppercase tracking-[0.18em] text-white">
                Sale
              </span>
            )}
          </div>

          <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={
                !product.inStock ||
                !defaultVariant
              }
              className="flex w-full items-center justify-center gap-2 bg-[#f5f1ec]/95 px-4 py-3 text-[8px] uppercase tracking-[0.2em] text-[#211c18] backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingBag
                size={13}
                strokeWidth={1.4}
              />

              {product.inStock &&
              defaultVariant
                ? "Quick Add"
                : "Out of Stock"}
            </button>
          </div>
        </div>

        <div className="pt-3 sm:pt-4">
          <p className="text-[7px] uppercase tracking-[0.2em] text-[#857a72] sm:text-[8px]">
            {product.category}
          </p>

          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h3 className="text-[9px] uppercase leading-[1.45] tracking-[0.11em] text-[#211c18] sm:text-[10px]">
              {product.name}
            </h3>

            <div className="shrink-0 text-right text-[9px] text-[#211c18] sm:text-[10px]">
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

          <div className="mt-3 flex gap-1.5">
            {product.colourOptions
              ?.slice(0, 4)
              .map((colour) => (
                <span
                  key={colour.id}
                  title={colour.name}
                  className="h-2.5 w-2.5 rounded-full border border-black/15"
                  style={{
                    backgroundColor:
                      colour.hexCode,
                  }}
                />
              ))}
          </div>
        </div>
      </Link>
    </article>
  );
}