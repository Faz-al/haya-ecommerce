import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ChevronDown,
  Grid2X2,
  Grid3X3,
  LoaderCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

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

const categoryTabs = [
  {
    label: "All",
    to: "/shop",
  },
  
  {
    label: "Abayas",
    to: "/category/abayas",
  },
  {
    label: "Hijabs",
    to: "/category/hijabs",
  },
  {
    label: "Clothing",
    to: "/category/clothing",
  },
  {
    label: "Essentials",
    to: "/category/essentials-accessories",
  },
  {
    label: "New Arrivals",
    to: "/shop?sort=new-arrivals",
  },
  {
    label: "Bestsellers",
    to: "/shop?sort=bestsellers",
  },
];

const emptyFilters = {
  category: [],
  collection: [],
  size: [],
  availability: [],
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [sort, setSort] = useState(
    searchParams.get("sort") || "featured"
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const loadedProducts = await fetchActiveProducts();
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Failed to load shop products:", error);

      setErrorMessage(
        error.message || "The catalogue could not be loaded."
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

    loadProducts();
  }, []);

  useEffect(() => {
    const urlSort = searchParams.get("sort");
    const urlCategory = searchParams.get("category");

    if (urlSort) {
      setSort(urlSort);
    }

    if (urlCategory) {
      setFilters((current) => ({
        ...current,
        category: [urlCategory],
      }));
    } else {
      setFilters((current) => ({
        ...current,
        category: [],
      }));
    }
  }, [searchParams]);

  const toggleFilter = (key, option) => {
    setFilters((current) => {
      const values = current[key] || [];
      const alreadySelected = values.includes(option);

      return {
        ...current,
        [key]: alreadySelected
          ? values.filter((value) => value !== option)
          : [...values, option],
      };
    });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setSearchParams({});
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);

    const nextParams = new URLSearchParams(searchParams);

    if (nextSort === "featured") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", nextSort);
    }

    setSearchParams(nextParams);
  };

  const visibleProducts = useMemo(() => {
    const filteredProducts = products.filter((product) => {
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
        filters.size.some((size) => product.sizes.includes(size));

      const availabilityMatches =
        filters.availability.length === 0 ||
        (filters.availability.includes("In Stock") && product.inStock);

      return (
        categoryMatches &&
        collectionMatches &&
        sizeMatches &&
        availabilityMatches
      );
    });

    return [...filteredProducts].sort((a, b) => {
      switch (sort) {
        case "new-arrivals":
          return (
            Number(b.isNewArrival) -
              Number(a.isNewArrival) ||
            Number(b.isNew) -
              Number(a.isNew) ||
            String(b.createdAt || "").localeCompare(
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
          return String(b.createdAt || "").localeCompare(
            String(a.createdAt || "")
          );

        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "name":
          return a.name.localeCompare(b.name);

        default:
          return (
            Number(b.featured) -
              Number(a.featured) ||
            Number(b.isFeatured) -
              Number(a.isFeatured)
          );
      }
    });
  }, [filters, products, sort]);

  const activeFilterCount = Object.values(filters).reduce(
    (total, values) => total + values.length,
    0
  );

  const selectedSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ||
    "Featured";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f1eb] text-[#1f1a17]">
      <AnnouncementBar />
      <Navbar />

      <section className="bg-[#f4f1eb] px-5 pb-8 pt-[118px] text-center sm:px-8 sm:pb-10 sm:pt-[135px] lg:px-12 lg:pb-12 lg:pt-[145px]">
        <h1 className="text-[24px] font-medium uppercase leading-none tracking-[0.16em] text-[#1f1a17] sm:text-[28px] lg:text-[31px]">
          Shop All
        </h1>

        <p className="mx-auto mt-5 max-w-[760px] text-[13px] leading-[1.75] tracking-[0.02em] text-[#48413b] sm:text-[14px]">
          Explore refined abayas, versatile hijabs, and thoughtfully designed
          pieces made for modern modest dressing. Discover fluid silhouettes,
          elevated everyday staples, and timeless modest essentials.
        </p>

        <button
          type="button"
          className="mt-4 border-b border-[#1f1a17] pb-1 text-[11px] uppercase tracking-[0.18em] text-[#1f1a17]"
        >
          Read More
        </button>

       <div className="mx-auto mt-8 flex max-w-[1120px] items-center gap-5 overflow-x-auto whitespace-nowrap pb-2 text-left [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryTabs.map((tab, index) => (
            <Link
              key={`${tab.label}-${index}`}
              to={tab.to}
              className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[#2f2a26] transition hover:text-black ${
  index === 0
    ? "border-b border-[#1f1a17] pb-1"
    : ""
}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-14 sm:px-8 lg:px-12 lg:pb-20">
        <div className="flex items-center justify-between gap-5 border-t border-black/[0.08] pt-7 sm:pt-8">
          <label className="relative flex items-center gap-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#1f1a17]">
              Sort By
            </span>

            <select
              value={sort}
              onChange={(event) => handleSortChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Sort products"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              strokeWidth={1.4}
            />

            <span className="hidden text-[10px] uppercase tracking-[0.14em] text-[#776d65] sm:inline">
              {selectedSortLabel}
            </span>
          </label>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#1f1a17]"
            >
              <span>Filters</span>

              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211c18] px-1 text-[8px] text-white">
                  {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={16}
                strokeWidth={1.4}
              />
            </button>

            <div className="hidden items-center gap-4 text-[#c7c2bd] sm:flex">
              <Grid3X3
                size={27}
                strokeWidth={1.1}
              />

              <Grid2X2
                size={27}
                strokeWidth={1.1}
              />
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-black/[0.08] py-4">
            {Object.entries(filters).flatMap(([key, values]) =>
              values.map((value) => (
                <button
                  key={`${key}-${value}`}
                  type="button"
                  onClick={() => toggleFilter(key, value)}
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
        ) : visibleProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-16 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h2 className="font-serif text-[30px]">
              No products found
            </h2>

            <p className="mt-3 text-[12px] text-[#756b63]">
              No active products match your selected filters.
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
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onToggleFilter={toggleFilter}
        onClear={clearFilters}
      />

      <Footer />
    </main>
  );
}