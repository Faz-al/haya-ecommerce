import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";
import ProductCard from "../components/shop/ProductCard";

import {
  fetchProductsByCategorySlug,
} from "../lib/storeProducts";

const sortOptions = [
  {
    label: "Featured",
    value: "featured",
  },
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price: Low to High",
    value: "price-low",
  },
  {
    label: "Price: High to Low",
    value: "price-high",
  },
  {
    label: "Name: A–Z",
    value: "name",
  },
];

export default function CategoryPage() {
  const { slug } = useParams();

  const [category, setCategory] =
    useState(null);

  const [children, setChildren] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [sort, setSort] =
    useState("featured");

  const loadCategory = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result =
        await fetchProductsByCategorySlug(
          slug
        );

      if (!result.category) {
        setCategory(null);
        setChildren([]);
        setProducts([]);
        setErrorMessage(
          "This category could not be found."
        );
        return;
      }

      setCategory(result.category);
      setChildren(result.children || []);
      setProducts(result.products || []);
    } catch (error) {
      console.error(
        "Failed to load category:",
        error
      );

      setErrorMessage(
        error.message ||
          "This category could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    loadCategory();
  }, [slug]);

  const visibleProducts =
    useMemo(() => {
      return [...products].sort(
        (a, b) => {
          switch (sort) {
            case "newest":
              return String(
                b.createdAt || ""
              ).localeCompare(
                String(
                  a.createdAt || ""
                )
              );

            case "price-low":
              return a.price - b.price;

            case "price-high":
              return b.price - a.price;

            case "name":
              return a.name.localeCompare(
                b.name
              );

            default:
              return (
                Number(b.featured) -
                Number(a.featured)
              );
          }
        }
      );
    }, [products, sort]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1ec] text-[#171412]">
      <AnnouncementBar />
      <Navbar />

      <section className="border-b border-black/[0.08] bg-[#e9e1d8] px-4 pb-12 pt-[145px] text-center sm:px-7 sm:pb-16 sm:pt-[155px] lg:px-12 lg:pb-20 lg:pt-[175px]">
        <div className="mx-auto mb-5 flex max-w-fit flex-wrap items-center justify-center gap-2 text-[8px] uppercase tracking-[0.16em] text-[#83786f]">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span className="text-[#211c18]">
            {category?.name ||
              "Category"}
          </span>
        </div>

        <p className="text-[8px] uppercase tracking-[0.3em] text-[#756b63] sm:text-[9px]">
          Haya Category
        </p>

        <h1 className="mt-4 font-serif text-[42px] leading-none tracking-[-0.04em] text-[#1f1a17] sm:text-[58px] lg:text-[78px]">
          {category?.name ||
            "Collection"}
        </h1>

        <p className="mx-auto mt-5 max-w-[620px] text-[12px] leading-[1.8] text-[#5c534c] sm:text-[14px]">
          {category?.description ||
            "Explore refined pieces selected for modern modest dressing."}
        </p>

        {children.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/category/${child.slug}`}
                className="border border-black/15 bg-[#f5f1ec]/50 px-4 py-3 text-[8px] uppercase tracking-[0.16em] transition hover:bg-[#211c18] hover:text-white"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-7 sm:py-10 lg:px-12 lg:py-14">
        <div className="flex items-center justify-between border-y border-black/[0.1] py-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-[#81766e]">
            {loading
              ? "Loading Products"
              : `${visibleProducts.length} Products`}
          </p>

          <label className="relative flex items-center gap-2">
            <span className="hidden text-[9px] uppercase tracking-[0.18em] sm:block">
              Sort By
            </span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="appearance-none bg-transparent py-1 pr-6 text-[9px] uppercase tracking-[0.15em] outline-none"
            >
              {sortOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              strokeWidth={1.25}
              className="pointer-events-none absolute right-0"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={30}
                strokeWidth={1.2}
                className="mx-auto animate-spin"
              />

              <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
                Loading category
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[420px] items-center justify-center text-center">
            <div className="max-w-md">
              <AlertCircle
                size={30}
                strokeWidth={1.2}
                className="mx-auto"
              />

              <h2 className="mt-5 font-serif text-[34px]">
                Category unavailable
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-[#756b63]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadCategory}
                className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.18em] text-white"
              >
                <RefreshCw size={13} />
                Try Again
              </button>
            </div>
          </div>
        ) : visibleProducts.length >
          0 ? (
          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-9 sm:mt-9 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-16">
            {visibleProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h2 className="font-serif text-[30px]">
              No products found
            </h2>

            <p className="mt-3 text-[12px] text-[#756b63]">
              No active products have been added to this category yet.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.18em] text-white"
            >
              Shop All
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}