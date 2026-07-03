import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  fetchBestsellerProducts,
} from "../../lib/storeProducts";

function formatPrice(
  amount,
  currency = "INR"
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function BestSellers() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      try {
        const data =
          await fetchBestsellerProducts(4);

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "Failed to load bestsellers:",
          error
        );

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section
      id="bestsellers"
      className="border-b border-black/[0.08] bg-[#f5f1ec] py-10 sm:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex items-end justify-between px-4 sm:mb-9 sm:px-7 lg:mb-11 lg:px-12">
          <div>
            <p className="mb-2 text-[8px] uppercase tracking-[0.28em] text-[#756c65] sm:text-[9px]">
              Most Loved
            </p>

            <h2 className="font-serif text-[28px] leading-none tracking-[-0.025em] text-[#1d1916] sm:text-[34px] lg:text-[44px]">
              Best Sellers
            </h2>
          </div>

          <Link
            to="/shop?sort=bestsellers"
            className="group flex items-center gap-2 pb-1 text-[8px] uppercase tracking-[0.2em] text-[#28221e] sm:text-[9px] lg:text-[10px]"
          >
            <span>View All</span>

            <span className="relative block h-px w-8 overflow-hidden bg-black/25">
              <span className="absolute inset-0 -translate-x-full bg-black transition-transform duration-500 group-hover:translate-x-0" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 px-4 sm:grid-cols-2 sm:gap-5 sm:px-7 lg:grid-cols-4 lg:px-12">
          {loading
            ? Array.from({ length: 4 }).map(
                (_, index) => (
                  <article
                    key={index}
                    className="group"
                  >
                    <div className="h-[220px] animate-pulse bg-[#d9cec4] sm:h-[390px] lg:h-[470px]" />

                    <div className="pt-4">
                      <div className="h-3 w-1/3 animate-pulse bg-black/10" />
                      <div className="mt-3 h-3 w-3/4 animate-pulse bg-black/10" />
                    </div>
                  </article>
                )
              )
            : products.map(
                (product, index) => (
                  <article
                    key={product.id}
                    className="group"
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      className="block"
                    >
                      <div className="relative overflow-hidden bg-[#d9cec4]">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading={
                            index < 2
                              ? "eager"
                              : "lazy"
                          }
                          className="h-[220px] w-full object-cover object-center transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] sm:h-[390px] lg:h-[470px]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

                        <span className="absolute left-3 top-3 bg-[#f5f1ec]/95 px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#211c18] backdrop-blur-md sm:left-4 sm:top-4 sm:text-[8px]">
                          Bestseller
                        </span>

                        <div className="absolute inset-x-3 bottom-3 hidden translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
                          <span className="block w-full bg-[#f5f1ec]/95 px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] text-[#211c18] backdrop-blur-md transition-colors group-hover:bg-white">
                            View Product
                          </span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-[7px] uppercase tracking-[0.22em] text-[#81766e] sm:text-[8px]">
                          {product.category}
                        </p>

                        <div className="mt-2 flex items-start justify-between gap-3">
                          <h3 className="text-[9px] uppercase leading-[1.45] tracking-[0.12em] text-[#211c18] sm:text-[10px]">
                            {product.name}
                          </h3>

                          <p className="shrink-0 text-[9px] text-[#211c18] sm:text-[10px]">
                            {formatPrice(
                              product.price,
                              product.currency
                            )}
                          </p>
                        </div>

                        <div className="mt-4 h-px w-full overflow-hidden bg-black/[0.08]">
                          <div className="h-full w-0 bg-black transition-all duration-700 group-hover:w-full" />
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              )}
        </div>
      </div>
    </section>
  );
}