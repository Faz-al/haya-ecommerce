import {
  useMemo,
} from "react";

export default function ProductGallery({
  product,
  images,
}) {
  const galleryImages = useMemo(() => {
    const suppliedImages =
      images?.filter(Boolean) || [];

    if (suppliedImages.length > 0) {
      return Array.from(
        new Set(suppliedImages)
      );
    }

    if (product.gallery?.length > 0) {
      return Array.from(
        new Set(
          product.gallery.filter(Boolean)
        )
      );
    }

    return Array.from(
      new Set(
        [
          product.image,
          product.secondaryImage,
        ].filter(Boolean)
      )
    );
  }, [
    images,
    product.gallery,
    product.image,
    product.secondaryImage,
  ]);

  if (galleryImages.length === 0) {
    return (
      <div className="aspect-[4/5] bg-[#ddd4cc]" />
    );
  }

  const primaryImage =
    galleryImages[0];

  const remainingImages =
    galleryImages.slice(1);

  return (
    <div className="min-w-0">
      <div className="overflow-hidden bg-[#ddd4cc]">
        <img
          src={primaryImage}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover object-center"
        />
      </div>

      {remainingImages.length > 0 && (
        <>
          {/* Mobile gallery */}
          <div className="mt-2 space-y-2 lg:hidden">
            {remainingImages.map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden bg-[#ddd4cc]"
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${
                      index + 2
                    }`}
                    loading="lazy"
                    className="w-full object-cover"
                  />
                </div>
              )
            )}
          </div>

          {/* Desktop editorial gallery */}
          <div className="mt-3 hidden grid-cols-2 gap-3 lg:grid">
            {remainingImages.map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden bg-[#ddd4cc]"
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${
                      index + 2
                    }`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}