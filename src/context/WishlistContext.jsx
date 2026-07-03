import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "haya-wishlist";

function getStoredWishlist() {
  try {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error("Failed to load wishlist:", error);
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(getStoredWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistItems)
      );
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  }, [wishlistItems]);

  function addToWishlist(product) {
    if (!product?.id) return;

    setWishlistItems((currentItems) => {
      const productExists = currentItems.some(
        (item) => item.id === product.id
      );

      if (productExists) {
        return currentItems;
      }

      return [...currentItems, product];
    });
  }

  function removeFromWishlist(productId) {
    setWishlistItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  }

  function toggleWishlist(product) {
    if (!product?.id) return;

    setWishlistItems((currentItems) => {
      const productExists = currentItems.some(
        (item) => item.id === product.id
      );

      if (productExists) {
        return currentItems.filter(
          (item) => item.id !== product.id
        );
      }

      return [...currentItems, product];
    });
  }

  function isInWishlist(productId) {
    return wishlistItems.some((item) => item.id === productId);
  }

  function clearWishlist() {
    setWishlistItems([]);
  }

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
    }),
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside a WishlistProvider"
    );
  }

  return context;
}