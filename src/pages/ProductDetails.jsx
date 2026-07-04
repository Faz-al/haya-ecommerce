import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  LoaderCircle,
  Minus,
  Plus,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";
import ProductCard from "../components/shop/ProductCard";
import ProductGallery from "../components/product/ProductGallery";
import ProductAccordion from "../components/product/ProductAccordion";
import WishlistButton from "../components/wishlist/WishlistButton";

import { useCart } from "../context/CartContext";
import {
  fetchActiveProductBySlug,
  fetchActiveProducts,
} from "../lib/storeProducts";

import DOMPurify from "dompurify";

function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function ProductDetails() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedColourId, setSelectedColourId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setErrorMessage("");
      setProduct(null);

      try {
        const [loadedProduct, allProducts] = await Promise.all([
          fetchActiveProductBySlug(slug),
          fetchActiveProducts(),
        ]);

        if (cancelled) return;

        if (!loadedProduct) {
          setErrorMessage(
            "This product is unavailable or has not been published."
          );
          return;
        }

        setProduct(loadedProduct);

        setRelatedProducts(
          allProducts
            .filter(
              (item) =>
                item.id !== loadedProduct.id &&
                item.category === loadedProduct.category
            )
            .slice(0, 4)
        );

        const firstAvailableColour =
          loadedProduct.colourOptions?.find((colour) => colour.inStock) ||
          loadedProduct.colourOptions?.[0];

        setSelectedColourId(firstAvailableColour?.id || "");

        const firstAvailableVariant =
          firstAvailableColour?.variants?.find((variant) => variant.inStock) ||
          firstAvailableColour?.variants?.[0];

        setSelectedVariantId(firstAvailableVariant?.id || "");

        setQuantity(1);
        setMessage("");
      } catch (error) {
        console.error("Failed to load product:", error);

        if (!cancelled) {
          setErrorMessage(error.message || "The product could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedColour = useMemo(() => {
    return product?.colourOptions?.find(
      (colour) => colour.id === selectedColourId
    );
  }, [product, selectedColourId]);

  const availableVariants = selectedColour?.variants || [];

  const selectedVariant = useMemo(() => {
    return availableVariants.find(
      (variant) => variant.id === selectedVariantId
    );
  }, [availableVariants, selectedVariantId]);

  const displayedPrice = selectedVariant?.price ?? product?.price ?? 0;

  const displayedOriginalPrice =
    selectedVariant?.originalPrice ?? product?.originalPrice ?? null;

  const safeProductDescription = DOMPurify.sanitize(
    product?.description || "<p>No product description available.</p>"
  );

  const selectedGallery =
    selectedColour?.images?.length > 0
      ? selectedColour.images
      : product?.gallery;

  const maximumQuantity =
    selectedVariant?.trackInventory && !selectedVariant?.allowBackorder
      ? selectedVariant.stock
      : Infinity;

  const handleColourChange = (colour) => {
    setSelectedColourId(colour.id);

    const nextVariant =
      colour.variants.find((variant) => variant.inStock) ||
      colour.variants[0];

    setSelectedVariantId(nextVariant?.id || "");
    setQuantity(1);
    setMessage("");
  };

  const validateSelection = () => {
    if (!selectedColour) {
      setMessage("Please select a colour.");
      return false;
    }

    if (!selectedVariant) {
      setMessage("Please select a size.");
      return false;
    }

    if (!selectedVariant.inStock) {
      setMessage("This size is currently out of stock.");
      return false;
    }

    if (Number.isFinite(maximumQuantity) && quantity > maximumQuantity) {
      setMessage(
        `Only ${maximumQuantity} item${
          maximumQuantity === 1 ? "" : "s"
        } available.`
      );
      return false;
    }

    return true;
  };

  const handleAddToBag = () => {
    if (!validateSelection()) return;

    addToCart({
      product,
      variant: selectedVariant,
      colour: selectedColour.name,
      size: selectedVariant.size,
      quantity,
    });

    setMessage(`${quantity} × ${product.name} added to your bag.`);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    addToCart({
      product,
      variant: selectedVariant,
      colour: selectedColour.name,
      size: selectedVariant.size,
      quantity,
      openDrawer: false,
    });

    navigate("/checkout");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#e9e4db] text-[#1f1a17]">
        <AnnouncementBar />
        <Navbar forceSolid />

        <div className="flex min-h-screen items-center justify-center pt-28">
          <div className="text-center">
            <LoaderCircle
              size={32}
              strokeWidth={1.2}
              className="mx-auto animate-spin"
            />

            <p className="mt-5 text-[8px] uppercase tracking-[0.22em] text-[#71665e]">
              Loading product
            </p>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  if (errorMessage || !product) {
    return (
      <main className="min-h-screen bg-[#f4f1eb] text-[#1f1a17]">
        <AnnouncementBar />
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center px-5 pt-32 text-center">
          <div className="max-w-md">
            <AlertCircle
              size={32}
              strokeWidth={1.2}
              className="mx-auto"
            />

            <h1 className="mt-5 font-serif text-[38px]">
              Product unavailable
            </h1>

            <p className="mt-4 text-[11px] leading-6 text-[#71665e]">
              {errorMessage}
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#211c18] px-8 text-[8px] uppercase tracking-[0.18em] text-white"
            >
              Return to Shop
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f0ece3] text-[#1f1a17]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1280px] pb-14 pt-[96px] sm:px-8 sm:pt-[120px] lg:px-10 lg:pb-24 lg:pt-[128px]">
        <div className="grid gap-0 lg:grid-cols-[585px_minmax(0,520px)] lg:items-start lg:justify-between lg:gap-16 xl:gap-20">
          <div className="relative z-0 w-full overflow-hidden lg:max-w-[585px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
            <ProductGallery
              product={product}
              images={selectedGallery}
            />
          </div>

          <div className="pdp-aab-font w-full max-w-[520px] px-5 pt-7 sm:px-0 lg:pt-7">
            <p className="text-[9px] font-medium uppercase leading-none tracking-[0.18em] text-[#5f5750]">
              {product.category || "Haya"}
              {product.collection ? ` · ${product.collection}` : ""}
            </p>

            <div className="mt-5 flex items-start justify-between gap-5">
              <h1 className="max-w-[430px] text-[18px] font-medium uppercase leading-[1.42] tracking-[0.13em] text-[#292522] sm:text-[21px]">
                {product.name}
              </h1>

              <WishlistButton
                product={product}
                className="mt-[-7px] h-10 w-10 shrink-0 rounded-full border border-black/15 bg-transparent shadow-none hover:bg-white"
              />
            </div>

            <div className="mt-5 flex items-center gap-3 text-[12px] font-normal tracking-[0.01em] text-[#292522]">
              {displayedOriginalPrice && (
                <span className="text-[#8d837a] line-through">
                  {formatPrice(displayedOriginalPrice, product.currency)}
                </span>
              )}

              <span>
                {formatPrice(displayedPrice, product.currency)}
              </span>

              {displayedOriginalPrice && (
                <span className="bg-[#211c18] px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[0.14em] text-white">
                  Sale
                </span>
              )}
            </div>

            <div
              className="haya-rich-content mt-5 max-w-[500px] text-[13px] font-normal leading-[1.75] tracking-[0.01em] text-[#4b4540]
              [&_p]:mb-5 [&_p]:leading-[1.75]
              [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-[22px] [&_h1]:font-normal [&_h1]:leading-[1.35] [&_h1]:tracking-[0.08em]
              [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-normal [&_h2]:leading-[1.35] [&_h2]:tracking-[0.08em]
              [&_h3]:mb-4 [&_h3]:mt-6 [&_h3]:text-[20px] [&_h3]:font-normal [&_h3]:leading-[1.35] [&_h3]:tracking-[0.07em]
              [&_ul]:mt-5 [&_ul]:space-y-4 [&_ul]:pl-5
              [&_li]:pl-2 [&_li]:leading-[1.75]"
              dangerouslySetInnerHTML={{
                __html: safeProductDescription,
              }}
            />

            {(product.colourOptions || []).length > 0 && (
  <div className="mt-7">
    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#292522]">
      Colour:{" "}
      <span className="font-semibold">
        {selectedColour?.name || ""}
      </span>
    </p>

    <div className="mt-3 flex flex-wrap gap-2.5">
      {(product.colourOptions || []).map((colour) => (
        <button
          key={colour.id}
          type="button"
          title={`${colour.name}${
            colour.inStock ? "" : " — Out of stock"
          }`}
          onClick={() => handleColourChange(colour)}
          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition ${
            selectedColourId === colour.id
              ? "border-[#211c18]"
              : "border-black/20 hover:border-black/50"
          } ${!colour.inStock ? "opacity-35" : ""}`}
        >
          <span
            className="h-6 w-6 rounded-full border border-black/10 bg-cover bg-center"
            style={{
              backgroundColor: colour.hexCode,
              backgroundImage: colour.swatchImage
                ? `url("${colour.swatchImage}")`
                : undefined,
            }}
          />
        </button>
      ))}
    </div>
  </div>
)}

           {availableVariants.length > 0 && (
  <div className="mt-7">
    <div className="flex items-center justify-between gap-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#292522]">
        Select Size
      </p>

      {selectedVariant?.sku && (
        <p className="hidden max-w-[45%] truncate text-right text-[7px] uppercase tracking-[0.12em] text-[#786d65] sm:block">
          SKU: {selectedVariant.sku}
        </p>
      )}
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      {availableVariants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          disabled={!variant.inStock}
          onClick={() => {
            setSelectedVariantId(variant.id);
            setQuantity(1);
            setMessage("");
          }}
          className={`flex h-10 min-w-11 items-center justify-center border px-3 text-[11px] uppercase tracking-[0.08em] transition sm:h-11 sm:min-w-12 ${
            selectedVariantId === variant.id
              ? "border-[#211c18] bg-[#211c18] text-white"
              : "border-black/35 hover:border-black"
          } disabled:cursor-not-allowed disabled:opacity-35`}
        >
          {variant.size}
        </button>
      ))}
    </div>

    {selectedVariant &&
      selectedVariant.inStock &&
      selectedVariant.trackInventory &&
      selectedVariant.stock <= selectedVariant.lowStockThreshold && (
        <p className="mt-3 text-[10px] text-[#9b493f]">
          Only {selectedVariant.stock} remaining
        </p>
      )}
  </div>
)}

           <div className="mt-7 max-w-[430px]">
  <div className="flex h-10 items-center justify-center border border-black/20">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={() =>
        setQuantity((current) => Math.max(1, current - 1))
      }
      className="flex h-full w-10 items-center justify-center"
    >
      <Minus size={12} strokeWidth={1.3} />
    </button>

    <span className="flex min-w-10 flex-1 items-center justify-center border-x border-black/10 text-[11px]">
      {quantity}
    </span>

    <button
      type="button"
      aria-label="Increase quantity"
      disabled={
        Number.isFinite(maximumQuantity) &&
        quantity >= maximumQuantity
      }
      onClick={() =>
        setQuantity((current) =>
          Number.isFinite(maximumQuantity)
            ? Math.min(current + 1, maximumQuantity)
            : current + 1
        )
      }
      className="flex h-full w-10 items-center justify-center disabled:opacity-30"
    >
      <Plus size={12} strokeWidth={1.3} />
    </button>
  </div>

  <button
    type="button"
    disabled={!selectedVariant?.inStock}
    onClick={handleAddToBag}
    className="mt-3 min-h-11 w-full bg-[#211c18] px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/35"
  >
    {selectedVariant?.inStock ? "Add to Bag" : "Out of Stock"}
  </button>

  <button
    type="button"
    disabled={!selectedVariant?.inStock}
    onClick={handleBuyNow}
    className="mt-3 min-h-11 w-full border border-[#211c18] bg-transparent px-5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#211c18] transition hover:bg-[#211c18] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
  >
    Buy Now
  </button>
</div>

            {message && (
              <p
                className={`mt-4 text-[11px] ${
                  message.includes("Please") ||
                  message.includes("stock") ||
                  message.includes("Only")
                    ? "text-[#9b493f]"
                    : "text-[#53634c]"
                }`}
              >
                {message}
              </p>
            )}

            <div className="mt-8 border-y border-black/[0.1] py-1">
              {[
                {
                  title: "Quick and easy returns",
                  description: "Returns accepted within 14 days.",
                },
                {
                  title: "Contact our customer care team",
                  description: "Support with sizing and orders.",
                },
                {
                  title: "Discover more about Haya",
                  description: "Designed for modern modest dressing.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-5 border-b border-black/[0.08] py-4 last:border-b-0"
                >
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em]">
                      {item.title}
                    </p>

                    <p className="mt-1.5 text-[10px] leading-5 text-[#786d65]">
                      {item.description}
                    </p>
                  </div>

                  <span className="mt-1 text-[12px]">→</span>
                </div>
              ))}
            </div>

            <div className="mt-8 border-b border-black/[0.1]">
              <ProductAccordion title="Details" defaultOpen>
                <p>
                  <strong className="font-medium text-[#312b27]">
                    Vendor:
                  </strong>{" "}
                  {product.vendor || "Haya"}
                </p>

                {product.productType && (
                  <p className="mt-3">
                    <strong className="font-medium text-[#312b27]">
                      Product Type:
                    </strong>{" "}
                    {product.productType}
                  </p>
                )}

                {selectedVariant?.sku && (
                  <p className="mt-3">
                    <strong className="font-medium text-[#312b27]">
                      SKU:
                    </strong>{" "}
                    {selectedVariant.sku}
                  </p>
                )}
              </ProductAccordion>

              <ProductAccordion title="Care">
                <p>{product.care}</p>
              </ProductAccordion>

              <ProductAccordion title="Delivery & Returns">
                <p>
                  Standard delivery is available worldwide. Returns are accepted
                  within 14 days when items are unworn, unwashed and returned
                  with their original tags.
                </p>
              </ProductAccordion>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-black/[0.08] bg-[#eee7df] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <div className="mb-8 flex items-end justify-between sm:mb-10">
              <div>
                <p className="text-[8px] uppercase tracking-[0.28em] text-[#776d65] sm:text-[9px]">
                  Complete the Edit
                </p>

                <h2 className="mt-3 font-serif text-[30px] leading-none tracking-[-0.03em] sm:text-[38px] lg:text-[44px]">
                  You May Also Like
                </h2>
              </div>

              <Link
                to="/shop"
                className="text-[8px] uppercase tracking-[0.17em] underline underline-offset-4 sm:text-[9px]"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-4 sm:gap-x-5">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}