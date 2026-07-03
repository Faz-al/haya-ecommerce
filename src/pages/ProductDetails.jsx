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

function formatPrice(
  amount,
  currency = "INR"
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

export default function ProductDetails() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { slug } = useParams();

  const [product, setProduct] =
    useState(null);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    selectedColourId,
    setSelectedColourId,
  ] = useState("");

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [message, setMessage] =
    useState("");

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
        const [
          loadedProduct,
          allProducts,
        ] = await Promise.all([
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
                item.id !==
                  loadedProduct.id &&
                item.category ===
                  loadedProduct.category
            )
            .slice(0, 4)
        );

        const firstAvailableColour =
          loadedProduct.colourOptions?.find(
            (colour) =>
              colour.inStock
          ) ||
          loadedProduct
            .colourOptions?.[0];

        setSelectedColourId(
          firstAvailableColour?.id || ""
        );

        const firstAvailableVariant =
          firstAvailableColour?.variants?.find(
            (variant) =>
              variant.inStock
          ) ||
          firstAvailableColour
            ?.variants?.[0];

        setSelectedVariantId(
          firstAvailableVariant?.id || ""
        );

        setQuantity(1);
        setMessage("");
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            error.message ||
              "The product could not be loaded."
          );
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

  const selectedColour =
    useMemo(() => {
      return product?.colourOptions?.find(
        (colour) =>
          colour.id ===
          selectedColourId
      );
    }, [
      product,
      selectedColourId,
    ]);

  const availableVariants =
    selectedColour?.variants || [];

  const selectedVariant =
    useMemo(() => {
      return availableVariants.find(
        (variant) =>
          variant.id ===
          selectedVariantId
      );
    }, [
      availableVariants,
      selectedVariantId,
    ]);

  const displayedPrice =
    selectedVariant?.price ??
    product?.price ??
    0;

  const displayedOriginalPrice =
    selectedVariant?.originalPrice ??
    product?.originalPrice ??
    null;

    const safeProductDescription = DOMPurify.sanitize(
  product?.description ||
    "<p>No product description available.</p>"
);

  const selectedGallery =
    selectedColour?.images?.length > 0
      ? selectedColour.images
      : product?.gallery;

  const maximumQuantity =
    selectedVariant?.trackInventory &&
    !selectedVariant?.allowBackorder
      ? selectedVariant.stock
      : Infinity;

  const handleColourChange = (
    colour
  ) => {
    setSelectedColourId(colour.id);

    const nextVariant =
      colour.variants.find(
        (variant) => variant.inStock
      ) || colour.variants[0];

    setSelectedVariantId(
      nextVariant?.id || ""
    );

    setQuantity(1);
    setMessage("");
  };


  const handleAddToBag = () => {
  if (!selectedColour) {
    setMessage("Please select a colour.");
    return;
  }

  if (!selectedVariant) {
    setMessage("Please select a size.");
    return;
  }

  if (!selectedVariant.inStock) {
    setMessage(
      "This size is currently out of stock."
    );
    return;
  }

  if (
    Number.isFinite(maximumQuantity) &&
    quantity > maximumQuantity
  ) {
    setMessage(
      `Only ${maximumQuantity} item${
        maximumQuantity === 1 ? "" : "s"
      } available.`
    );
    return;
  }

  addToCart({
    product,
    variant: selectedVariant,
    colour: selectedColour.name,
    size: selectedVariant.size,
    quantity,
  });

  setMessage(
    `${quantity} × ${product.name} added to your bag.`
  );
};


  const handleBuyNow = () => {
  if (!selectedColour) {
    setMessage("Please select a colour.");
    return;
  }

  if (!selectedVariant) {
    setMessage("Please select a size.");
    return;
  }

  if (!selectedVariant.inStock) {
    setMessage(
      "This size is currently out of stock."
    );
    return;
  }

  if (
    Number.isFinite(maximumQuantity) &&
    quantity > maximumQuantity
  ) {
    setMessage(
      `Only ${maximumQuantity} item${
        maximumQuantity === 1 ? "" : "s"
      } available.`
    );
    return;
  }

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
      <main className="min-h-screen bg-[#f5f1ec] text-[#171412]">
        <AnnouncementBar />
        <Navbar forceSolid />

        <div className="flex min-h-screen items-center justify-center pt-28">
          <div className="text-center">
            <LoaderCircle
              size={32}
              strokeWidth={1.2}
              className="mx-auto animate-spin"
            />

            <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
              Loading product
            </p>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  if (
    errorMessage ||
    !product
  ) {
    return (
      <main className="min-h-screen bg-[#f5f1ec] text-[#171412]">
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1ec] text-[#171412]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1600px] px-4 pb-14 pt-[135px] sm:px-7 sm:pb-18 sm:pt-[150px] lg:px-12 lg:pb-24 lg:pt-[175px]">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-[#83786f] sm:mb-8">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#211c18]">
            {product.name}
          </span>
        </div>

<div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:items-start lg:gap-14 xl:gap-20">
  <ProductGallery
              product={product}
            images={selectedGallery}
          />

          <div className="lg:sticky lg:top-[125px] lg:self-start">
            <p className="text-[8px] uppercase tracking-[0.26em] text-[#81766d] sm:text-[9px]">
              {product.category} ·{" "}
              {product.collection}
            </p>

            <div className="mt-3 flex items-start justify-between gap-5">
              <h1 className="font-serif text-[36px] leading-[0.98] tracking-[-0.035em] text-[#1f1a17] sm:text-[48px] lg:text-[56px]">
                {product.name}
              </h1>

              <WishlistButton
                product={product}
                className="mt-1 h-10 w-10 shrink-0 border border-black/15 bg-transparent shadow-none hover:bg-white"
              />
            </div>

            <div className="mt-5 flex items-center gap-3 text-[13px]">
              {displayedOriginalPrice && (
                <span className="text-[#988d84] line-through">
                  {formatPrice(
                    displayedOriginalPrice,
                    product.currency
                  )}
                </span>
              )}

              <span>
                {formatPrice(
                  displayedPrice,
                  product.currency
                )}
              </span>

              {displayedOriginalPrice && (
                <span className="bg-[#211c18] px-2.5 py-1.5 text-[7px] uppercase tracking-[0.17em] text-white">
                  Sale
                </span>
              )}
            </div>

          <div
  className="haya-rich-content mt-7 text-[12px] leading-[1.85] text-[#625850] sm:text-[14px]"
  dangerouslySetInnerHTML={{
    __html: safeProductDescription,
  }}
/>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.19em]">
                  Colour
                </p>

                <p className="text-[10px] text-[#786d65]">
                  {selectedColour?.name ||
                    ""}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
  {product.colourOptions.map(
    (colour) => (
      <button
        key={colour.id}
        type="button"
        title={`${colour.name}${
          colour.inStock
            ? ""
            : " — Out of stock"
        }`}
        onClick={() =>
          handleColourChange(colour)
        }
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
          selectedColourId === colour.id
            ? "border-[#211c18]"
            : "border-black/15 hover:border-black/45"
        } ${
          !colour.inStock
            ? "opacity-35"
            : ""
        }`}
      >
        <span
          className="h-6 w-6 rounded-full border border-black/10 bg-cover bg-center"
          style={{
            backgroundColor:
              colour.hexCode,
            backgroundImage:
              colour.swatchImage
                ? `url("${colour.swatchImage}")`
                : undefined,
          }}
        />

        {selectedColourId ===
          colour.id && (
          <span className="absolute -bottom-2 h-px w-5 bg-[#211c18]" />
        )}
      </button>
    )
  )}
</div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.19em]">
                  Size
                </p>

                {selectedVariant?.sku && (
                  <p className="text-[8px] uppercase tracking-[0.12em] text-[#786d65]">
                    SKU:{" "}
                    {selectedVariant.sku}
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {availableVariants.map(
                  (variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={
                        !variant.inStock
                      }
                      onClick={() => {
                        setSelectedVariantId(
                          variant.id
                        );
                        setQuantity(1);
                        setMessage("");
                      }}
                      className={`relative min-h-11 border px-2 text-[8px] uppercase tracking-[0.14em] transition ${
                        selectedVariantId ===
                        variant.id
                          ? "border-[#211c18] bg-[#211c18] text-white"
                          : "border-black/15 hover:border-black/45"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {variant.size}
                    </button>
                  )
                )}
              </div>

              {selectedVariant &&
                selectedVariant.inStock &&
                selectedVariant.trackInventory &&
                selectedVariant.stock <=
                  selectedVariant.lowStockThreshold && (
                  <p className="mt-3 text-[9px] text-[#9b493f]">
                    Only{" "}
                    {selectedVariant.stock}{" "}
                    remaining
                  </p>
                )}
            </div>

           <div className="mt-8">
  <div className="flex h-12 items-center justify-center border border-black/15">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={() =>
        setQuantity((current) =>
          Math.max(1, current - 1)
        )
      }
      className="flex h-full w-12 items-center justify-center"
    >
      <Minus
        size={14}
        strokeWidth={1.3}
      />
    </button>

    <span className="flex min-w-12 flex-1 items-center justify-center border-x border-black/10 text-[10px]">
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
            ? Math.min(
                current + 1,
                maximumQuantity
              )
            : current + 1
        )
      }
      className="flex h-full w-12 items-center justify-center disabled:opacity-30"
    >
      <Plus
        size={14}
        strokeWidth={1.3}
      />
    </button>
  </div>

  <button
    type="button"
    disabled={!selectedVariant?.inStock}
    onClick={handleAddToBag}
    className="mt-3 min-h-13 w-full bg-[#211c18] px-5 text-[9px] uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/35"
  >
    {selectedVariant?.inStock
      ? "Add to Cart"
      : "Out of Stock"}
  </button>

  <button
    type="button"
    disabled={!selectedVariant?.inStock}
    onClick={handleBuyNow}
    className="mt-3 min-h-13 w-full border border-[#211c18] bg-transparent px-5 text-[9px] uppercase tracking-[0.22em] text-[#211c18] transition hover:bg-[#211c18] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
  >
    Buy Now
  </button>
</div>

{message && (
              <p
                className={`mt-4 text-[10px] ${
                  message.includes(
                    "Please"
                  ) ||
                  message.includes(
                    "stock"
                  ) ||
                  message.includes(
                    "Only"
                  )
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
      description:
        "Returns accepted within 14 days.",
    },
    {
      title:
        "Contact our customer care team",
      description:
        "Support with sizing and orders.",
    },
    {
      title:
        "Discover more about Haya",
      description:
        "Designed for modern modest dressing.",
    },
  ].map((item) => (
    <div
      key={item.title}
      className="flex items-start justify-between gap-5 border-b border-black/[0.08] py-4 last:border-b-0"
    >
      <div>
        <p className="text-[8px] uppercase tracking-[0.17em]">
          {item.title}
        </p>

        <p className="mt-1.5 text-[9px] leading-5 text-[#786d65]">
          {item.description}
        </p>
      </div>

      <span className="mt-1 text-[12px]">
        →
      </span>
    </div>
  ))}
</div>

            <div className="mt-9 border-b border-black/[0.1]">
              <ProductAccordion
  title="Details"
  defaultOpen
>
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
                  Standard delivery is
                  available worldwide.
                  Returns are accepted
                  within 14 days when
                  items are unworn,
                  unwashed and returned
                  with their original
                  tags.
                </p>
              </ProductAccordion>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-black/[0.08] bg-[#eee7df] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-7 lg:px-12">
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
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={
                      relatedProduct.id
                    }
                    product={
                      relatedProduct
                    }
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}