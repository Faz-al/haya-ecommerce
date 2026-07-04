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

const mainTabs = [
  {
    label: "All",
    to: "/shop",
    slug: "shop",
  },
  {
    label: "Abayas",
    to: "/category/abayas",
    slug: "abayas",
  },
  {
    label: "Hijabs",
    to: "/category/hijabs",
    slug: "hijabs",
  },
  {
    label: "Clothing",
    to: "/category/clothing",
    slug: "clothing",
  },
  {
    label: "Essentials",
    to: "/category/essentials-accessories",
    slug: "essentials",
  },
  {
    label: "New Arrivals",
    to: "/shop?sort=new-arrivals",
    slug: "new-arrivals",
  },
  {
    label: "Bestsellers",
    to: "/shop?sort=bestsellers",
    slug: "bestsellers",
  },
];

const hijabSubcategoryTabs = [
  {
    label: "View All Hijabs",
    to: "/category/hijabs",
    slug: "hijabs",
  },
  {
    label: "Malaysian Heavy Chiffon Hijab",
    to: "/category/malaysian-heavy-chiffon-hijab",
    slug: "malaysian-heavy-chiffon-hijab",
  },
  {
    label: "Premium Jersey Hijab",
    to: "/category/premium-jersey-hijab",
    slug: "premium-jersey-hijab",
  },
  {
    label: "Organza Hijab",
    to: "/category/organza-hijab",
    slug: "organza-hijab",
  },
  {
    label: "Organza Shimmer Hijab",
    to: "/category/organza-shimmer-hijab",
    slug: "organza-shimmer-hijab",
  },
  {
    label: "Chiffon Shimmer Hijab",
    to: "/category/chiffon-shimmer-hijab",
    slug: "chiffon-shimmer-hijab",
  },
  {
    label: "Animal Print Hijab",
    to: "/category/animal-print-hijab",
    slug: "animal-print-hijab",
  },
  {
    label: "Satin Hijab",
    to: "/category/satin-hijab",
    slug: "satin-hijab",
  },
  {
    label: "Jersey Stone Hijab",
    to: "/category/jersey-stone-hijab",
    slug: "jersey-stone-hijab",
  },
  {
    label: "Satin Stone Hijab",
    to: "/category/satin-stone-hijab",
    slug: "satin-stone-hijab",
  },
  {
    label: "Chiffon Stone Hijab",
    to: "/category/chiffon-stone-hijab",
    slug: "chiffon-stone-hijab",
  },
  {
    label: "Cotton Hijab",
    to: "/category/cotton-hijab",
    slug: "cotton-hijab",
  },
];

const hijabSlugs = hijabSubcategoryTabs.map((tab) => tab.slug);

function getShortDescription(category, slug) {
  if (category?.description) {
    return category.description;
  }

  if (slug === "hijabs" || hijabSlugs.includes(slug)) {
    return "Explore our complete hijab collection, crafted in refined fabrics, soft colours, and versatile everyday silhouettes for modern modest dressing.";
  }

  if (slug === "abayas") {
    return "Discover elegant abayas designed with fluid silhouettes, elevated details, and effortless comfort for everyday and occasion wear.";
  }

  return "Explore refined pieces selected for modern modest dressing. Discover fluid silhouettes, elevated everyday staples, and timeless modest essentials.";
}

function isHijabPage(slug, category) {
  const categoryName = category?.name?.toLowerCase() || "";

  return (
    slug === "hijabs" ||
    hijabSlugs.includes(slug) ||
    categoryName.includes("hijab")
  );
}

export default function CategoryPage() {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sort, setSort] = useState("featured");

  const loadCategory = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await fetchProductsByCategorySlug(slug);

      if (!result.category) {
        setCategory(null);
        setProducts([]);
        setErrorMessage("This category could not be found.");
        return;
      }

      setCategory(result.category);
      setProducts(result.products || []);
    } catch (error) {
      console.error("Failed to load category:", error);

      setErrorMessage(
        error.message || "This category could not be loaded."
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

  const visibleProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sort) {
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
  }, [products, sort]);

  const selectedSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ||
    "Featured";

  const showHijabSubcategories = isHijabPage(slug, category);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f1eb] text-[#1f1a17]">
      <AnnouncementBar />
      <Navbar />

      <section className="bg-[#f4f1eb] px-5 pb-8 pt-[118px] text-center sm:px-8 sm:pb-10 sm:pt-[135px] lg:px-12 lg:pb-12 lg:pt-[145px]">
        <h1 className="text-[24px] font-medium uppercase leading-none tracking-[0.16em] text-[#1f1a17] sm:text-[28px] lg:text-[31px]">
          {category?.name || "Collection"}
        </h1>

        <p className="mx-auto mt-5 max-w-[760px] text-[13px] leading-[1.75] tracking-[0.02em] text-[#48413b] sm:text-[14px]">
          {getShortDescription(category, slug)}
        </p>

        <button
          type="button"
          className="mt-4 border-b border-[#1f1a17] pb-1 text-[11px] uppercase tracking-[0.18em] text-[#1f1a17]"
        >
          Read More
        </button>

        <div className="mx-auto mt-8 flex max-w-[1120px] items-center gap-5 overflow-x-auto whitespace-nowrap pb-2 text-left [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mainTabs.map((tab) => {
            const isActive =
              slug === tab.slug ||
              (showHijabSubcategories && tab.slug === "hijabs");

            return (
              <Link
                key={tab.label}
                to={tab.to}
                className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[#2f2a26] transition hover:text-black ${
                  isActive
                    ? "border-b border-[#1f1a17] pb-1"
                    : ""
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {showHijabSubcategories && (
          <div className="mx-auto mt-5 flex max-w-[1120px] items-center gap-4 overflow-x-auto whitespace-nowrap pb-2 text-left [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hijabSubcategoryTabs.map((tab) => {
              const isActive = slug === tab.slug;

              return (
                <Link
                  key={tab.label}
                  to={tab.to}
                  className={`shrink-0 border px-4 py-3 text-[8px] font-medium uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-[#211c18] bg-[#211c18] text-white"
                      : "border-black/15 text-[#2f2a26] hover:border-[#211c18]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-14 sm:px-8 lg:px-12 lg:pb-20">
        <div className="flex items-center justify-between gap-5 border-t border-black/[0.08] pt-7 sm:pt-8">
          <label className="relative flex items-center gap-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#1f1a17]">
              Sort By
            </span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
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
            <p className="hidden text-[10px] uppercase tracking-[0.16em] text-[#776d65] sm:block">
              {loading
                ? "Loading Products"
                : `${visibleProducts.length} Products`}
            </p>

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