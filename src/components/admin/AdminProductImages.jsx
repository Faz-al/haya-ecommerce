import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ImageOff,
  Images,
  LoaderCircle,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

const STORAGE_BUCKET = "product-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function cleanFileName(fileName) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() ||
    "jpg";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${baseName || "product-image"}.${extension}`;
}

function sortImages(images) {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return Number(b.is_primary) - Number(a.is_primary);
    }

    return (
      (Number(a.position) || 0) -
      (Number(b.position) || 0)
    );
  });
}

export default function AdminProductImages({
  productId,
  productName,
}) {
  const fileInputRef = useRef(null);

  const [colours, setColours] = useState([]);
  const [images, setImages] = useState([]);

  const [selectedColourId, setSelectedColourId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [busyImageId, setBusyImageId] =
    useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("error");

  const showMessage = (
    text,
    type = "error"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadMedia = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setMessage("");

    try {
      const [
        colourResponse,
        imageResponse,
      ] = await Promise.all([
        supabase
          .from("product_colors")
          .select(`
            id,
            name,
            hex_code,
            position,
            is_active
          `)
          .eq("product_id", productId)
          .order("position", {
            ascending: true,
          }),

        supabase
          .from("product_images")
          .select(`
            id,
            product_id,
            color_id,
            variant_id,
            storage_path,
            public_url,
            alt_text,
            position,
            is_primary,
            created_at
          `)
          .eq("product_id", productId)
          .order("position", {
            ascending: true,
          }),
      ]);

      if (colourResponse.error) {
        throw colourResponse.error;
      }

      if (imageResponse.error) {
        throw imageResponse.error;
      }

      setColours(
        (colourResponse.data || []).filter(
          (colour) => colour.is_active
        )
      );

      setImages(
        sortImages(imageResponse.data || [])
      );
    } catch (error) {
      console.error(
        "Failed to load product images:",
        error
      );

      showMessage(
        error.message ||
          "Product images could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const filteredImages = useMemo(() => {
    if (!selectedColourId) {
      return images;
    }

    if (selectedColourId === "general") {
      return images.filter(
        (image) => !image.color_id
      );
    }

    return images.filter(
      (image) =>
        image.color_id === selectedColourId
    );
  }, [images, selectedColourId]);

  const selectedColourName = useMemo(() => {
    if (
      !selectedColourId ||
      selectedColourId === "general"
    ) {
      return "General product";
    }

    return (
      colours.find(
        (colour) =>
          colour.id === selectedColourId
      )?.name || "Selected colour"
    );
  }, [colours, selectedColourId]);

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      showMessage(
        "Use JPG, PNG, WebP or AVIF images smaller than 10 MB."
      );
      return;
    }

    setUploading(true);
    setMessage("");

    const uploadedStoragePaths = [];

    try {
      const currentMaximumPosition =
        images.reduce(
          (maximum, image) =>
            Math.max(
              maximum,
              Number(image.position) || 0
            ),
          -1
        );

      const databaseRows = [];

      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        const safeName =
          cleanFileName(file.name);

        const storagePath = [
          productId,
          selectedColourId &&
          selectedColourId !== "general"
            ? selectedColourId
            : "general",
          `${crypto.randomUUID()}-${safeName}`,
        ].join("/");

        const { error: uploadError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedStoragePaths.push(
          storagePath
        );

        const {
          data: publicUrlData,
        } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        databaseRows.push({
          product_id: productId,

          color_id:
            selectedColourId &&
            selectedColourId !== "general"
              ? selectedColourId
              : null,

          variant_id: null,

          storage_path: storagePath,

          public_url:
            publicUrlData.publicUrl,

          alt_text: `${productName} – ${selectedColourName}`,

          position:
            currentMaximumPosition +
            index +
            1,

          is_primary:
            images.length === 0 &&
            index === 0,
        });
      }

      const { data, error } = await supabase
        .from("product_images")
        .insert(databaseRows)
        .select(`
          id,
          product_id,
          color_id,
          variant_id,
          storage_path,
          public_url,
          alt_text,
          position,
          is_primary,
          created_at
        `);

      if (error) {
        throw error;
      }

      setImages((current) =>
        sortImages([
          ...current,
          ...(data || []),
        ])
      );

      showMessage(
        `${files.length} image${
          files.length === 1 ? "" : "s"
        } uploaded successfully.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Product image upload failed:",
        error
      );

      if (
        uploadedStoragePaths.length > 0
      ) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(uploadedStoragePaths);
      }

      showMessage(
        error.message ||
          "The images could not be uploaded."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleMakePrimary = async (
    image
  ) => {
    if (image.is_primary) return;

    setBusyImageId(image.id);
    setMessage("");

    try {
      const { error: clearError } =
        await supabase
          .from("product_images")
          .update({
            is_primary: false,
          })
          .eq("product_id", productId);

      if (clearError) {
        throw clearError;
      }

      const { error: primaryError } =
        await supabase
          .from("product_images")
          .update({
            is_primary: true,
          })
          .eq("id", image.id)
          .eq("product_id", productId);

      if (primaryError) {
        throw primaryError;
      }

      setImages((current) =>
        sortImages(
          current.map((item) => ({
            ...item,
            is_primary:
              item.id === image.id,
          }))
        )
      );

      showMessage(
        "Primary product image updated.",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to set primary image:",
        error
      );

      showMessage(
        error.message ||
          "The primary image could not be updated."
      );
    } finally {
      setBusyImageId("");
    }
  };

  const saveImageOrder = async (
    orderedImages
  ) => {
    const updates = orderedImages.map(
      (image, position) => ({
        ...image,
        position,
      })
    );

    setImages(sortImages(updates));

    const results = await Promise.all(
      updates.map((image) =>
        supabase
          .from("product_images")
          .update({
            position: image.position,
          })
          .eq("id", image.id)
          .eq("product_id", productId)
      )
    );

    const failedResult = results.find(
      (result) => result.error
    );

    if (failedResult?.error) {
      throw failedResult.error;
    }
  };

  const handleMoveImage = async (
    image,
    direction
  ) => {
    const groupImages = filteredImages;
    const currentIndex =
      groupImages.findIndex(
        (item) => item.id === image.id
      );

    const targetIndex =
      currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= groupImages.length
    ) {
      return;
    }

    setBusyImageId(image.id);
    setMessage("");

    try {
      const reorderedGroup = [
        ...groupImages,
      ];

      [
        reorderedGroup[currentIndex],
        reorderedGroup[targetIndex],
      ] = [
        reorderedGroup[targetIndex],
        reorderedGroup[currentIndex],
      ];

      const reorderedIds =
        reorderedGroup.map(
          (item) => item.id
        );

      const unaffectedImages =
        images.filter(
          (item) =>
            !reorderedIds.includes(item.id)
        );

      await saveImageOrder([
        ...unaffectedImages,
        ...reorderedGroup,
      ]);

      showMessage(
        "Image order updated.",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to reorder image:",
        error
      );

      await loadMedia();

      showMessage(
        error.message ||
          "The image order could not be updated."
      );
    } finally {
      setBusyImageId("");
    }
  };

  const handleDeleteImage = async (
    image
  ) => {
    const confirmed = window.confirm(
      "Delete this image permanently?"
    );

    if (!confirmed) return;

    setBusyImageId(image.id);
    setMessage("");

    try {
      const { error: databaseError } =
        await supabase
          .from("product_images")
          .delete()
          .eq("id", image.id)
          .eq("product_id", productId);

      if (databaseError) {
        throw databaseError;
      }

      const { error: storageError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([
            image.storage_path,
          ]);

      if (storageError) {
        console.warn(
          "Image row deleted but storage deletion failed:",
          storageError
        );
      }

      const remainingImages =
        images.filter(
          (item) =>
            item.id !== image.id
        );

      setImages(
        sortImages(remainingImages)
      );

      if (
        image.is_primary &&
        remainingImages.length > 0
      ) {
        const nextPrimary =
          remainingImages[0];

        await supabase
          .from("product_images")
          .update({
            is_primary: true,
          })
          .eq("id", nextPrimary.id);

        setImages((current) =>
          sortImages(
            current.map((item) => ({
              ...item,
              is_primary:
                item.id ===
                nextPrimary.id,
            }))
          )
        );
      }

      showMessage(
        "Image deleted.",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to delete image:",
        error
      );

      showMessage(
        error.message ||
          "The image could not be deleted."
      );
    } finally {
      setBusyImageId("");
    }
  };

  if (loading) {
    return (
      <section className="border border-black/10 bg-[#e9e2da] p-7">
        <div className="flex min-h-[260px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={28}
              strokeWidth={1.3}
              className="mx-auto animate-spin"
            />

            <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
              Loading product images
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
      <div className="flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
            Product Media
          </p>

          <h2 className="mt-3 font-serif text-[32px] tracking-[-0.03em]">
            Images and galleries
          </h2>

          <p className="mt-3 max-w-2xl text-[10px] leading-6 text-[#71665e]">
            Upload general product images or
            assign images to a specific colour.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#786d65]">
            Total Images
          </p>

          <p className="mt-2 font-serif text-[25px]">
            {images.length}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="block text-[7px] uppercase tracking-[0.17em]">
            Upload Images For
          </label>

          <select
            value={selectedColourId}
            onChange={(event) =>
              setSelectedColourId(
                event.target.value
              )
            }
            className="mt-3 h-12 w-full border border-black/15 bg-[#f2eee9] px-4 text-[10px] outline-none"
          >
            <option value="">
              View All Images
            </option>

            <option value="general">
              General Product Images
            </option>

            {colours.map((colour) => (
              <option
                key={colour.id}
                value={colour.id}
              >
                {colour.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleChooseFiles}
            disabled={uploading}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.18em] text-white disabled:opacity-50 sm:w-auto"
          >
            {uploading ? (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            ) : (
              <Upload size={14} />
            )}

            {uploading
              ? "Uploading..."
              : "Upload Images"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={
            messageType === "success"
              ? "mt-5 flex items-start gap-3 border border-[#55705a]/20 bg-[#55705a]/5 p-4 text-[#45604b]"
              : "mt-5 flex items-start gap-3 border border-[#9b493f]/20 bg-[#9b493f]/5 p-4 text-[#9b493f]"
          }
        >
          {messageType === "success" ? (
            <Check
              size={15}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="text-[9px] leading-5">
            {message}
          </p>
        </div>
      )}

      {filteredImages.length === 0 ? (
        <div className="mt-6 border border-dashed border-black/20 px-6 py-14 text-center">
          <ImageOff
            size={28}
            strokeWidth={1.2}
            className="mx-auto text-[#786d65]"
          />

          <h3 className="mt-5 font-serif text-[28px]">
            No images uploaded
          </h3>

          <p className="mx-auto mt-3 max-w-md text-[10px] leading-6 text-[#71665e]">
            Choose a general gallery or one
            of the product colours, then
            upload one or more images.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {filteredImages.map(
            (image, index) => (
              <article
                key={image.id}
                className="overflow-hidden border border-black/10 bg-[#f2eee9]"
              >
                <div className="relative">
                  <img
                    src={image.public_url}
                    alt={
                      image.alt_text ||
                      productName
                    }
                    className="aspect-[4/5] w-full object-cover"
                  />

                  {image.is_primary && (
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-[#211c18] px-2.5 py-2 text-[7px] uppercase tracking-[0.15em] text-white">
                      <Star
                        size={10}
                        fill="currentColor"
                      />
                      Primary
                    </span>
                  )}

                  {busyImageId ===
                    image.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <LoaderCircle
                        size={25}
                        className="animate-spin text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="truncate text-[8px] uppercase tracking-[0.12em]">
                    {image.color_id
                      ? colours.find(
                          (colour) =>
                            colour.id ===
                            image.color_id
                        )?.name ||
                        "Colour image"
                      : "General image"}
                  </p>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      title="Make primary"
                      disabled={
                        image.is_primary ||
                        busyImageId ===
                          image.id
                      }
                      onClick={() =>
                        handleMakePrimary(
                          image
                        )
                      }
                      className="flex h-9 items-center justify-center border border-black/15 disabled:opacity-30"
                    >
                      <Star size={12} />
                    </button>

                    <button
                      type="button"
                      title="Move earlier"
                      disabled={
                        index === 0 ||
                        busyImageId ===
                          image.id
                      }
                      onClick={() =>
                        handleMoveImage(
                          image,
                          -1
                        )
                      }
                      className="flex h-9 items-center justify-center border border-black/15 disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>

                    <button
                      type="button"
                      title="Move later"
                      disabled={
                        index ===
                          filteredImages.length -
                            1 ||
                        busyImageId ===
                          image.id
                      }
                      onClick={() =>
                        handleMoveImage(
                          image,
                          1
                        )
                      }
                      className="flex h-9 items-center justify-center border border-black/15 disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>

                    <button
                      type="button"
                      title="Delete image"
                      disabled={
                        busyImageId ===
                        image.id
                      }
                      onClick={() =>
                        handleDeleteImage(
                          image
                        )
                      }
                      className="flex h-9 items-center justify-center border border-[#9b493f]/25 text-[#9b493f] disabled:opacity-30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 border border-black/10 p-4">
        <Images
          size={15}
          strokeWidth={1.3}
          className="mt-0.5 shrink-0"
        />

        <p className="text-[9px] leading-5 text-[#71665e]">
          The primary image is used on the
          Shop page. When a customer selects
          a colour, that colour’s assigned
          images become the product gallery.
        </p>
      </div>
    </section>
  );
}