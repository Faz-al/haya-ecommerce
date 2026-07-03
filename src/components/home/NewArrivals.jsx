import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  fetchNewArrivalProducts,
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

export default function NewArrivals() {
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
          await fetchNewArrivalProducts(6);

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "Failed to load new arrivals:",
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
    <section className="border-b border-black/[0.08] bg-[#f5f1ec] py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-end justify-between px-4 sm:mb-7 sm:px-7 lg:mb-8 lg:px-12">
          <div>
            <p className="mb-2 text-[8px] uppercase tracking-[0.28em] text-[#756c65] sm:text-[9px]">
              Discover
            </p>

            <h2 className="font-serif text-[27px] leading-none tracking-[-0.025em] text-[#1d1916] sm:text-[32px] lg:text-[40px]">
              New Arrivals
            </h2>
          </div>

          <Link
            to="/shop?sort=new-arrivals"
            className="group flex items-center gap-2 pb-1 text-[8px] uppercase tracking-[0.2em] text-[#28221e] sm:text-[9px] lg:text-[10px]"
          >
            <span>View All</span>

            <span className="relative block h-px w-7 overflow-hidden bg-black/25">
              <span className="absolute inset-0 -translate-x-full bg-black transition-transform duration-500 group-hover:translate-x-0" />
            </span>
          </Link>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-7 lg:grid-cols-6 lg:gap-5 lg:px-12">
          {loading
            ? Array.from({ length: 6 }).map(
                (_, index) => (
                  <article
                    key={index}
                    className="min-w-[47%] snap-start sm:min-w-0"
                  >
                    <div className="h-[145px] animate-pulse bg-[#ded5cc] sm:h-[185px] lg:h-[220px]" />

                    <div className="pt-3">
                      <div className="h-3 w-3/4 animate-pulse bg-black/10" />
                      <div className="mt-2 h-3 w-1/3 animate-pulse bg-black/10" />
                    </div>
                  </article>
                )
              )
            : products.map(
                (product, index) => (
                  <article
                    key={product.id}
                    className="group min-w-[47%] snap-start sm:min-w-0"
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      className="block"
                    >
                      <div className="relative overflow-hidden bg-[#ded5cc]">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading={
                            index < 2
                              ? "eager"
                              : "lazy"
                          }
                          className="h-[145px] w-full object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] sm:h-[185px] lg:h-[220px]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="absolute inset-x-3 bottom-3 hidden translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
                          <span className="block w-full bg-[#f6f2ed]/95 px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] text-[#211c18] backdrop-blur-md transition-colors group-hover:bg-white">
                            View Product
                          </span>
                        </div>
                      </div>

                      <div className="pt-3">
                        <h3 className="text-[8px] uppercase leading-[1.45] tracking-[0.12em] text-[#211c18] sm:text-[9px] lg:text-[10px]">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-[9px] text-[#211c18] lg:text-[10px]">
                          {formatPrice(
                            product.price,
                            product.currency
                          )}
                        </p>

                        <div className="mt-3 h-px w-full overflow-hidden bg-black/[0.08]">
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