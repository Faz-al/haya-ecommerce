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
  SlidersHorizontal,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";
import ProductCard from "../components/shop/ProductCard";
import FilterDrawer from "../components/shop/FilterDrawer";

import { fetchActiveProducts } from "../lib/storeProducts";

const sortOptions = [
  {
    label: "Featured",
    value: "featured",
  },
  {
    label: "New Arrivals",
    value: "new-arrivals",
  },
  {
    label: "Bestsellers",
    value: "bestsellers",
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

const emptyFilters = {
  category: [],
  collection: [],
  size: [],
  availability: [],
};

export default function Shop() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [sort, setSort] =
  useState(
    searchParams.get("sort") || "featured"
  );

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [filters, setFilters] =
    useState(emptyFilters);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const loadedProducts =
        await fetchActiveProducts();

      setProducts(loadedProducts);
    } catch (error) {
      console.error(
        "Failed to load shop products:",
        error
      );

      setErrorMessage(
        error.message ||
          "The catalogue could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
  const urlSort = searchParams.get("sort");

  if (urlSort) {
    setSort(urlSort);
  }
}, [searchParams]);

  const toggleFilter = (
    key,
    option
  ) => {
    setFilters((current) => {
      const values =
        current[key] || [];

      const alreadySelected =
        values.includes(option);

      return {
        ...current,
        [key]: alreadySelected
          ? values.filter(
              (value) =>
                value !== option
            )
          : [...values, option],
      };
    });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
  };

  const visibleProducts =
    useMemo(() => {
      const filteredProducts =
        products.filter((product) => {
          const productCategoryNames =
  product.categoryNames?.length > 0
    ? product.categoryNames
    : [product.category];

const categoryMatches =
  filters.category.length === 0 ||
  filters.category.some((selectedCategory) =>
    productCategoryNames.includes(selectedCategory)
  );

          const collectionMatches =
  filters.collection.length === 0 ||
  (filters.collection.includes("New Arrivals") &&
    product.isNewArrival) ||
  (filters.collection.includes("Bestsellers") &&
    product.isBestseller) ||
  (filters.collection.includes("Featured") &&
    product.isFeatured);

          const sizeMatches =
            filters.size.length === 0 ||
            filters.size.some((size) =>
              product.sizes.includes(size)
            );

          const availabilityMatches =
            filters.availability
              .length === 0 ||
            (filters.availability.includes(
              "In Stock"
            ) &&
              product.inStock);

          return (
            categoryMatches &&
            collectionMatches &&
            sizeMatches &&
            availabilityMatches
          );
        });

      return [...filteredProducts].sort(
        (a, b) => {
          switch (sort) {

            case "new-arrivals":
  return (
    Number(b.isNewArrival) -
      Number(a.isNewArrival) ||
    Number(b.isNew) -
      Number(a.isNew) ||
    String(
      b.createdAt || ""
    ).localeCompare(
      String(a.createdAt || "")
    )
  );

case "bestsellers":
  return (
    Number(b.isBestseller) -
      Number(a.isBestseller) ||
    Number(b.featured) -
      Number(a.featured)
  );


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
      Number(a.featured) ||
    Number(b.isFeatured) -
      Number(a.isFeatured)
  );
          }
        }
      );
    }, [filters, products, sort]);

  const activeFilterCount =
    Object.values(filters).reduce(
      (total, values) =>
        total + values.length,
      0
    );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1ec] text-[#171412]">
      <AnnouncementBar />
      <Navbar />

      <section className="border-b border-black/[0.08] bg-[#e9e1d8] px-4 pb-12 pt-[145px] text-center sm:px-7 sm:pb-16 sm:pt-[155px] lg:px-12 lg:pb-20 lg:pt-[175px]">
        <p className="text-[8px] uppercase tracking-[0.3em] text-[#756b63] sm:text-[9px]">
          Discover the Collection
        </p>

        <h1 className="mt-4 font-serif text-[42px] leading-none tracking-[-0.04em] text-[#1f1a17] sm:text-[58px] lg:text-[78px]">
          Shop All
        </h1>

        <p className="mx-auto mt-5 max-w-[580px] text-[12px] leading-[1.8] text-[#5c534c] sm:text-[14px]">
          Explore refined abayas,
          versatile hijabs, and
          thoughtfully designed sets made
          for modern modest dressing.
        </p>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-7 sm:py-10 lg:px-12 lg:py-14">
        <div className="flex items-center justify-between border-y border-black/[0.1] py-4">
          <button
            type="button"
            onClick={() =>
              setFilterOpen(true)
            }
            className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em]"
          >
            <SlidersHorizontal
              size={15}
              strokeWidth={1.25}
            />

            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211c18] px-1 text-[8px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="hidden text-[9px] uppercase tracking-[0.16em] text-[#81766e] sm:block">
            {visibleProducts.length}{" "}
            Products
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

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.08] py-4">
            {Object.entries(
              filters
            ).flatMap(([key, values]) =>
              values.map((value) => (
                <button
                  key={`${key}-${value}`}
                  type="button"
                  onClick={() =>
                    toggleFilter(
                      key,
                      value
                    )
                  }
                  className="border border-black/15 px-3 py-2 text-[8px] uppercase tracking-[0.14em]"
                >
                  {value} ×
                </button>
              ))
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-[8px] uppercase tracking-[0.16em] underline underline-offset-4"
            >
              Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={30}
                strokeWidth={1.2}
                className="mx-auto animate-spin"
              />

              <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
                Loading collection
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
                Catalogue unavailable
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-[#756b63]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadProducts}
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
              No active products match
              your selected filters.
            </p>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 border-b border-black pb-1 text-[9px] uppercase tracking-[0.18em]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      <FilterDrawer
        open={filterOpen}
        onClose={() =>
          setFilterOpen(false)
        }
        filters={filters}
        onToggleFilter={toggleFilter}
        onClear={clearFilters}
      />

      <Footer />
    </main>
  );
}