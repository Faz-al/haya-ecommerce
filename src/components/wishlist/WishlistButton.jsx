import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useWishlist } from "../../context/WishlistContext";

export default function WishlistButton({
  product,
  className = "",
  showLabel = false,
}) {
  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const active = isInWishlist(product.id);

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist(product);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
      aria-label={
        active
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`flex items-center justify-center transition ${showLabel ? "gap-2 rounded-none px-5" : "h-10 w-10 rounded-full"} ${className}`}
    >
      <Heart
        size={showLabel ? 16 : 19}
        strokeWidth={1.7}
        className={`shrink-0 transition ${
          active
            ? "fill-current"
            : "fill-transparent"
        }`}
      />

      {showLabel && (
        <span className="text-[8px] uppercase tracking-[0.18em]">
          {active
            ? "Remove from Wishlist"
            : "Add to Wishlist"}
        </span>
      )}
    </motion.button>
  );
}