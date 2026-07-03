import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useSearch } from "../../context/SearchContext";
import { fetchActiveProducts } from "../../lib/storeProducts";

function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useSearch();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (!isSearchOpen) return;

    setQuery("");

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      setLoadError("");

      try {
        const loadedProducts = await fetchActiveProducts();

        if (!cancelled) {
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error("Failed to load search products:", error);

        if (!cancelled) {
          setProducts([]);
          setLoadError(
            error.message || "Search products could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch]);

  const filteredProducts = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    if (!searchValue) {
      return products.slice(0, 6);
    }

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.collection,
          product.shortDescription,
          product.description,
          product.vendor,
          ...(product.categoryNames || []),
          ...(product.categorySlugs || []),
          ...(product.colours || []),
          ...(product.sizes || []),
          ...(product.variants || []).map((variant) => variant.sku),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchValue);
      })
      .slice(0, 8);
  }, [products, query]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-[#f5f1ec]"
        >
          <div className="mx-auto flex h-full max-w-[1600px] flex-col">
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-black/[0.1] px-4 sm:px-7 lg:px-12">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#71675f]">
                Search
              </p>

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-55"
              >
                <X size={23} strokeWidth={1.2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-7 sm:py-10 lg:px-12 lg:py-14">
              <div className="mx-auto max-w-[1100px]">
                <div className="relative border-b border-black/[0.22]">
                  <Search
                    size={23}
                    strokeWidth={1.2}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-[#746a62]"
                  />

                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search hijabs, abayas, accessories or colours"
                    className="w-full bg-transparent py-5 pl-9 pr-10 font-serif text-[24px] tracking-[-0.02em] text-[#211c18] outline-none placeholder:text-[#91867d] sm:text-[31px] lg:text-[38px]"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.16em] underline underline-offset-4"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <p className="text-[8px] uppercase tracking-[0.22em] text-[#766c64] sm:text-[9px]">
                    {loadingProducts
                      ? "Loading products"
                      : query.trim()
                        ? `${filteredProducts.length} results`
                        : "Popular products"}
                  </p>

                  <Link
                    to="/shop"
                    onClick={closeSearch}
                    className="text-[8px] uppercase tracking-[0.17em] underline underline-offset-4 sm:text-[9px]"
                  >
                    View all
                  </Link>
                </div>

                {loadingProducts ? (
                  <div className="flex min-h-[330px] items-center justify-center text-center">
                    <div>
                      <LoaderCircle
                        size={30}
                        strokeWidth={1.2}
                        className="mx-auto animate-spin"
                      />

                      <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
                        Loading search
                      </p>
                    </div>
                  </div>
                ) : loadError ? (
                  <div className="py-24 text-center">
                    <h2 className="font-serif text-[31px] tracking-[-0.03em]">
                      Search unavailable
                    </h2>

                    <p className="mx-auto mt-3 max-w-[360px] text-[12px] leading-[1.8] text-[#786e66]">
                      {loadError}
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        onClick={closeSearch}
                        className="group min-w-0"
                      >
                        <div className="overflow-hidden bg-[#ddd4cc]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                          />
                        </div>

                        <div className="pt-3">
                          <p className="text-[7px] uppercase tracking-[0.19em] text-[#897e75]">
                            {product.category}
                          </p>

                          <div className="mt-1.5 flex items-start justify-between gap-3">
                            <h3 className="text-[9px] uppercase leading-[1.45] tracking-[0.11em] text-[#211c18]">
                              {product.name}
                            </h3>

                            <span className="shrink-0 text-[9px] text-[#211c18]">
                              {formatPrice(
                                product.price,
                                product.currency
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <h2 className="font-serif text-[31px] tracking-[-0.03em]">
                      No products found
                    </h2>

                    <p className="mx-auto mt-3 max-w-[360px] text-[12px] leading-[1.8] text-[#786e66]">
                      Try searching for a product name, collection, category,
                      colour, size or SKU.
                    </p>

                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="mt-6 border-b border-black pb-1 text-[8px] uppercase tracking-[0.18em]"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}