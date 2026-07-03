import { ShoppingBag } from "lucide-react";

import { useCart } from "../../context/CartContext";

export default function CartButton({ className = "" }) {
  const { cartCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open shopping bag with ${cartCount} items`}
      className={`relative flex items-center justify-center ${className}`}
    >
      <ShoppingBag size={19} strokeWidth={1.25} />

      {cartCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#211c18] px-1 text-[7px] text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );
}