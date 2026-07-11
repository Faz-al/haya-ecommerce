import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  PackagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

function createTemporaryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function normaliseHexCode(value) {
  const cleaned = value
    .trim()
    .replace(/[^a-fA-F0-9]/g, "")
    .slice(0, 6);

  return cleaned ? `#${cleaned}` : "";
}

function createSkuPart(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createRandomSkuSuffix(length = 4) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from(
    { length },
    () =>
      characters[
        Math.floor(Math.random() * characters.length)
      ]
  ).join("");
}

function createSuggestedSku(
  productName,
  colourName,
  size,
  suffix = ""
) {
  const productPart =
    createSkuPart(productName)
      .split("-")
      .filter(Boolean)
      .map((part) => part.slice(0, 3))
      .join("")
      .slice(0, 10) || "HAYA";

  const colourPart =
    createSkuPart(colourName).slice(0, 14) ||
    "COLOUR";

  const sizePart =
    createSkuPart(size).slice(0, 10) ||
    "SIZE";

  const cleanSuffix =
    createSkuPart(suffix) ||
    createRandomSkuSuffix();

  return `${productPart}-${colourPart}-${sizePart}-${cleanSuffix}`;
}

async function createUniqueVariantSku({
  productName,
  colourName,
  size,
  currentVariantId = null,
  preferredSku = "",
}) {
  const cleanPreferredSku =
    createSkuPart(preferredSku);

  const checkSkuAvailability = async (sku) => {
    let query = supabase
      .from("product_variants")
      .select("id")
      .eq("sku", sku)
      .limit(1);

    if (currentVariantId) {
      query = query.neq("id", currentVariantId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return !data || data.length === 0;
  };

  if (
    cleanPreferredSku &&
    (await checkSkuAvailability(cleanPreferredSku))
  ) {
    return cleanPreferredSku;
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidateSku = createSuggestedSku(
      productName,
      colourName,
      size
    );

    if (await checkSkuAvailability(candidateSku)) {
      return candidateSku;
    }
  }

  throw new Error(
    "A unique SKU could not be generated. Please try saving again."
  );
}

function sortByPosition(items) {
  return [...items].sort((a, b) => {
    const positionDifference =
      (a.position || 0) - (b.position || 0);

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return String(a.created_at || "").localeCompare(
      String(b.created_at || "")
    );
  });
}

export default function AdminProductVariants({
  productId,
  productName,
  basePrice,
  compareAtPrice,
}) {
  const [colours, setColours] = useState([]);
  const [expandedColourIds, setExpandedColourIds] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [savingColour, setSavingColour] =
    useState(false);

  const [newColour, setNewColour] = useState({
    name: "",
    hexCode: "#D8C4B6",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("error");

  const totalVariants = useMemo(() => {
    return colours.reduce(
      (total, colour) =>
        total + (colour.variants?.length || 0),
      0
    );
  }, [colours]);

  const totalStock = useMemo(() => {
    return colours.reduce((colourTotal, colour) => {
      const colourStock = (
        colour.variants || []
      ).reduce((variantTotal, variant) => {
        if (!variant.is_active) {
          return variantTotal;
        }

        return (
          variantTotal +
          (Number(variant.stock_quantity) || 0)
        );
      }, 0);

      return colourTotal + colourStock;
    }, 0);
  }, [colours]);

  const fetchColoursAndVariants =
    useCallback(async () => {
      if (!productId) return;

      setLoading(true);
      setMessage("");

      try {
        const [
          colourResponse,
          variantResponse,
        ] = await Promise.all([
          supabase
            .from("product_colors")
            .select(`
              id,
              product_id,
              name,
              hex_code,
              swatch_image_path,
              swatch_image_url,
              position,
              is_active,
              created_at
            `)
            .eq("product_id", productId)
            .order("position", {
              ascending: true,
            }),

          supabase
            .from("product_variants")
            .select(`
              id,
              product_id,
              color_id,
              title,
              sku,
              barcode,
              color,
              size,
              price,
              compare_at_price,
              cost_price,
              stock_quantity,
              low_stock_threshold,
              track_inventory,
              allow_backorder,
              weight_grams,
              position,
              is_active,
              created_at,
              updated_at
            `)
            .eq("product_id", productId)
            .order("position", {
              ascending: true,
            }),
        ]);

        if (colourResponse.error) {
          throw colourResponse.error;
        }

        if (variantResponse.error) {
          throw variantResponse.error;
        }

        const variants =
          variantResponse.data || [];

        const mergedColours = (
          colourResponse.data || []
        ).map((colour) => ({
          ...colour,
          isSaving: false,
          variants: sortByPosition(
            variants
              .filter(
                (variant) =>
                  variant.color_id === colour.id
              )
              .map((variant) => ({
                ...variant,
                isSaving: false,
              }))
          ),
        }));

        setColours(sortByPosition(mergedColours));

        setExpandedColourIds((current) => {
          if (current.length > 0) {
            return current.filter((id) =>
              mergedColours.some(
                (colour) => colour.id === id
              )
            );
          }

          return mergedColours[0]
            ? [mergedColours[0].id]
            : [];
        });
      } catch (error) {
        console.error(
          "Failed to load product variants:",
          error
        );

        setMessageType("error");
        setMessage(
          error.message ||
            "Colours and variants could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }, [productId]);

  useEffect(() => {
    fetchColoursAndVariants();
  }, [fetchColoursAndVariants]);

  const showMessage = (
    text,
    type = "error"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const toggleColour = (colourId) => {
    setExpandedColourIds((current) => {
      if (current.includes(colourId)) {
        return current.filter(
          (id) => id !== colourId
        );
      }

      return [...current, colourId];
    });
  };

  const updateColourLocally = (
    colourId,
    field,
    value
  ) => {
    setColours((current) =>
      current.map((colour) =>
        colour.id === colourId
          ? {
              ...colour,
              [field]: value,
            }
          : colour
      )
    );

    setMessage("");
  };

  const updateVariantLocally = (
    colourId,
    variantId,
    field,
    value
  ) => {
    setColours((current) =>
      current.map((colour) => {
        if (colour.id !== colourId) {
          return colour;
        }

        return {
          ...colour,
          variants: colour.variants.map(
            (variant) =>
              variant.id === variantId
                ? {
                    ...variant,
                    [field]: value,
                  }
                : variant
          ),
        };
      })
    );

    setMessage("");
  };

  const setColourSaving = (
    colourId,
    isSaving
  ) => {
    setColours((current) =>
      current.map((colour) =>
        colour.id === colourId
          ? {
              ...colour,
              isSaving,
            }
          : colour
      )
    );
  };

  const setVariantSaving = (
    colourId,
    variantId,
    isSaving
  ) => {
    setColours((current) =>
      current.map((colour) => {
        if (colour.id !== colourId) {
          return colour;
        }

        return {
          ...colour,
          variants: colour.variants.map(
            (variant) =>
              variant.id === variantId
                ? {
                    ...variant,
                    isSaving,
                  }
                : variant
          ),
        };
      })
    );
  };

  const handleNewColourChange = (event) => {
    const { name, value } = event.target;

    setNewColour((current) => ({
      ...current,
      [name]:
        name === "hexCode"
          ? normaliseHexCode(value)
          : value,
    }));

    setMessage("");
  };

  const handleAddColour = async () => {

    const colourName =
      newColour.name.trim();

    if (!colourName) {
      showMessage(
        "Enter a name for the colour."
      );
      return;
    }

    if (
      colours.some(
        (colour) =>
          colour.name.toLowerCase() ===
          colourName.toLowerCase()
      )
    ) {
      showMessage(
        "This product already has that colour."
      );
      return;
    }

    const hexCode = normaliseHexCode(
      newColour.hexCode
    );

    if (
      hexCode &&
      !/^#[0-9A-Fa-f]{6}$/.test(hexCode)
    ) {
      showMessage(
        "Enter a valid six-character hex colour."
      );
      return;
    }

    setSavingColour(true);
    setMessage("");

    try {
      const nextPosition = colours.length;

      const { data, error } = await supabase
        .from("product_colors")
        .insert({
          product_id: productId,
          name: colourName,
          hex_code: hexCode || null,
          position: nextPosition,
          is_active: true,
        })
        .select(`
          id,
          product_id,
          name,
          hex_code,
          swatch_image_path,
          swatch_image_url,
          position,
          is_active,
          created_at
        `)
        .single();

      if (error) {
        throw error;
      }

      const addedColour = {
        ...data,
        variants: [],
        isSaving: false,
      };

      setColours((current) => [
        ...current,
        addedColour,
      ]);

      setExpandedColourIds((current) => [
        ...current,
        addedColour.id,
      ]);

      setNewColour({
        name: "",
        hexCode: "#D8C4B6",
      });

      showMessage(
        `${addedColour.name} was added.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to add colour:",
        error
      );

      showMessage(
        error.message ||
          "The colour could not be added."
      );
    } finally {
      setSavingColour(false);
    }
  };

  const handleSaveColour = async (
  colour
) => {
  const colourName = colour.name.trim();
  const hexCode = normaliseHexCode(
    colour.hex_code || ""
  );

  if (!colourName) {
    showMessage(
      "Every colour requires a name."
    );
    return;
  }

  if (
    hexCode &&
    !/^#[0-9A-Fa-f]{6}$/.test(hexCode)
  ) {
    showMessage(
      "Enter a valid six-character hex colour."
    );
    return;
  }

  setColourSaving(colour.id, true);
  setMessage("");

  try {
    const { data, error } = await supabase
      .from("product_colors")
      .update({
        name: colourName,
        hex_code: hexCode || null,
        is_active: colour.is_active,
      })
      .eq("id", colour.id)
      .eq("product_id", productId)
      .select(`
        id,
        name,
        hex_code,
        is_active
      `)
      .single();

    if (error) {
      throw error;
    }

    const updatedVariants = [];

    for (const variant of colour.variants || []) {
      if (variant.isNew) {
        updatedVariants.push({
          ...variant,
          color: colourName,
          title: `${colourName} / ${
            variant.size || "One Size"
          }`,
          sku: createSuggestedSku(
            productName,
            colourName,
            variant.size || "One Size"
          ),
        });

        continue;
      }

      const currentSku = String(
        variant.sku || ""
      ).toUpperCase();

      const colourWasChanged =
        String(variant.color || "")
          .trim()
          .toLowerCase() !==
        colourName.toLowerCase();

      const shouldCreateNewSku =
        currentSku.includes("-COPY-") ||
        colourWasChanged;

      const nextSku = shouldCreateNewSku
        ? await createUniqueVariantSku({
            productName,
            colourName,
            size:
              variant.size || "One Size",
            currentVariantId: variant.id,
          })
        : variant.sku;

      const {
        data: updatedVariant,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .update({
          color: colourName,
          title: `${colourName} / ${
            variant.size || "One Size"
          }`,
          sku: nextSku,
        })
        .eq("id", variant.id)
        .eq("product_id", productId)
        .select(`
          id,
          product_id,
          color_id,
          title,
          sku,
          barcode,
          color,
          size,
          price,
          compare_at_price,
          cost_price,
          stock_quantity,
          low_stock_threshold,
          track_inventory,
          allow_backorder,
          weight_grams,
          position,
          is_active,
          created_at,
          updated_at
        `)
        .single();

      if (variantError) {
        throw variantError;
      }

      updatedVariants.push({
        ...updatedVariant,
        isNew: false,
        isSaving: false,
      });
    }

    setColours((current) =>
      current.map((item) =>
        item.id === colour.id
          ? {
              ...item,
              ...data,
              variants: updatedVariants,
              isSaving: false,
            }
          : item
      )
    );

    showMessage(
      `${data.name} was saved. Its variant SKUs were updated using the new colour name.`,
      "success"
    );
  } catch (error) {
    console.error(
      "Failed to save colour:",
      error
    );

    setColourSaving(colour.id, false);

    showMessage(
      error.message ||
        "The colour could not be saved."
    );
  }
};

  const handleDeleteColour = async (
    colour
  ) => {
    const confirmed = window.confirm(
      `Delete ${colour.name} and all of its size variants? This cannot be undone.`
    );

    if (!confirmed) return;

    setColourSaving(colour.id, true);
    setMessage("");

    try {
      const { error: imageDetachError } =
        await supabase
          .from("product_images")
          .update({
            color_id: null,
            variant_id: null,
          })
          .eq("product_id", productId)
          .eq("color_id", colour.id);

      if (imageDetachError) {
        throw imageDetachError;
      }

      const { error: variantDeleteError } =
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", productId)
          .eq("color_id", colour.id);

      if (variantDeleteError) {
        throw variantDeleteError;
      }

      const { error: colourDeleteError } =
        await supabase
          .from("product_colors")
          .delete()
          .eq("product_id", productId)
          .eq("id", colour.id);

      if (colourDeleteError) {
        throw colourDeleteError;
      }

      setColours((current) =>
        current.filter(
          (item) => item.id !== colour.id
        )
      );

      setExpandedColourIds((current) =>
        current.filter(
          (id) => id !== colour.id
        )
      );

      showMessage(
        `${colour.name} was deleted.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to delete colour:",
        error
      );

      setColourSaving(colour.id, false);

      showMessage(
        error.message ||
          "The colour could not be deleted."
      );
    }
  };

  const handleAddVariant = (colour) => {
    const nextPosition =
      colour.variants.length;

    const temporaryVariant = {
      id: createTemporaryId("variant"),
      product_id: productId,
      color_id: colour.id,
      title: `${colour.name} / One Size`,
      sku: createSuggestedSku(
        productName,
        colour.name,
        "One Size"
      ),
      barcode: "",
      color: colour.name,
      size: "One Size",
      price:
        basePrice === "" ||
        basePrice === null ||
        basePrice === undefined
          ? "0"
          : String(basePrice),
      compare_at_price:
        compareAtPrice === "" ||
        compareAtPrice === null ||
        compareAtPrice === undefined
          ? ""
          : String(compareAtPrice),
      cost_price: "",
      stock_quantity: "0",
      low_stock_threshold: "5",
      track_inventory: true,
      allow_backorder: false,
      weight_grams: "",
      position: nextPosition,
      is_active: true,
      isNew: true,
      isSaving: false,
    };

    setColours((current) =>
      current.map((item) =>
        item.id === colour.id
          ? {
              ...item,
              variants: [
                ...item.variants,
                temporaryVariant,
              ],
            }
          : item
      )
    );

    setExpandedColourIds((current) =>
      current.includes(colour.id)
        ? current
        : [...current, colour.id]
    );

    setMessage("");
  };

  const handleSizeChange = (
    colour,
    variant,
    value
  ) => {
    const nextSku = variant.isNew
      ? createSuggestedSku(
          productName,
          colour.name,
          value
        )
      : variant.sku;

    setColours((current) =>
      current.map((item) => {
        if (item.id !== colour.id) {
          return item;
        }

        return {
          ...item,
          variants: item.variants.map(
            (currentVariant) =>
              currentVariant.id === variant.id
                ? {
                    ...currentVariant,
                    size: value,
                    title: `${colour.name} / ${
                      value.trim() ||
                      "Unnamed Size"
                    }`,
                    sku: nextSku,
                  }
                : currentVariant
          ),
        };
      })
    );

    setMessage("");
  };

  const handleSaveVariant = async (
    colour,
    variant
  ) => {
    const size = String(
      variant.size || ""
    ).trim();

    const enteredSku = String(
      variant.sku || ""
    ).trim();

    const price = Number(variant.price);

    const compareAtPriceValue =
      variant.compare_at_price === "" ||
      variant.compare_at_price === null ||
      variant.compare_at_price === undefined
        ? null
        : Number(variant.compare_at_price);

    const stockQuantity = Number(
      variant.stock_quantity
    );

    const lowStockThreshold = Number(
      variant.low_stock_threshold
    );

    const costPrice =
      variant.cost_price === "" ||
      variant.cost_price === null ||
      variant.cost_price === undefined
        ? null
        : Number(variant.cost_price);

    const weightGrams =
      variant.weight_grams === "" ||
      variant.weight_grams === null ||
      variant.weight_grams === undefined
        ? null
        : Number(variant.weight_grams);

    if (!size) {
      showMessage(
        "Enter a size before saving the variant."
      );
      return;
    }

    if (
      colour.variants.some(
        (item) =>
          item.id !== variant.id &&
          String(item.size)
            .trim()
            .toLowerCase() ===
            size.toLowerCase()
      )
    ) {
      showMessage(
        `${colour.name} already has a ${size} variant.`
      );
      return;
    }

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      showMessage(
        "Enter a valid variant price."
      );
      return;
    }

    if (
      compareAtPriceValue !== null &&
      (Number.isNaN(compareAtPriceValue) ||
        compareAtPriceValue < 0)
    ) {
      showMessage(
        "Enter a valid compare-at price."
      );
      return;
    }

    if (
      compareAtPriceValue !== null &&
      compareAtPriceValue <= price
    ) {
      showMessage(
        "Variant compare-at price must be higher than its selling price."
      );
      return;
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      showMessage(
        "Stock must be a whole number of zero or more."
      );
      return;
    }

    if (
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      showMessage(
        "Low-stock threshold must be a whole number of zero or more."
      );
      return;
    }

    if (
      costPrice !== null &&
      (Number.isNaN(costPrice) ||
        costPrice < 0)
    ) {
      showMessage(
        "Enter a valid cost price."
      );
      return;
    }

    if (
      weightGrams !== null &&
      (!Number.isInteger(weightGrams) ||
        weightGrams < 0)
    ) {
      showMessage(
        "Weight must be a whole number of grams."
      );
      return;
    }

    setVariantSaving(
      colour.id,
      variant.id,
      true
    );

    setMessage("");

    try {
      const isCopiedSku =
  enteredSku.toUpperCase().includes("-COPY-");

const uniqueSku = await createUniqueVariantSku({
  productName,
  colourName: colour.name,
  size,
  currentVariantId: variant.isNew
    ? null
    : variant.id,

  // A duplicated SKU containing "-COPY-" should
  // be replaced using the current product, colour and size.
  preferredSku: isCopiedSku
    ? ""
    : enteredSku,
});

      const variantPayload = {
      product_id: productId,
      color_id: colour.id,
      title: `${colour.name} / ${size}`,
      sku: uniqueSku,
      barcode:
        String(variant.barcode || "").trim() ||
        null,
      color: colour.name,
      size,
      price,
      compare_at_price: compareAtPriceValue,
      cost_price: costPrice,
      stock_quantity: stockQuantity,
      low_stock_threshold:
        lowStockThreshold,
      track_inventory:
        variant.track_inventory,
      allow_backorder:
        variant.allow_backorder,
      weight_grams: weightGrams,
      position: variant.position || 0,
      is_active: variant.is_active,
    };

      let response;

      if (variant.isNew) {
        response = await supabase
          .from("product_variants")
          .insert(variantPayload)
          .select(`
            id,
            product_id,
            color_id,
            title,
            sku,
            barcode,
            color,
            size,
            price,
            compare_at_price,
            cost_price,
            stock_quantity,
            low_stock_threshold,
            track_inventory,
            allow_backorder,
            weight_grams,
            position,
            is_active,
            created_at,
            updated_at
          `)
          .single();
      } else {
        response = await supabase
          .from("product_variants")
          .update(variantPayload)
          .eq("id", variant.id)
          .eq("product_id", productId)
          .select(`
            id,
            product_id,
            color_id,
            title,
            sku,
            barcode,
            color,
            size,
            price,
            compare_at_price,
            cost_price,
            stock_quantity,
            low_stock_threshold,
            track_inventory,
            allow_backorder,
            weight_grams,
            position,
            is_active,
            created_at,
            updated_at
          `)
          .single();
      }

      if (
        response.error &&
        response.error.code === "23505"
      ) {
        const retrySku =
          await createUniqueVariantSku({
            productName,
            colourName: colour.name,
            size,
            currentVariantId: variant.isNew
              ? null
              : variant.id,
          });

        const retryPayload = {
          ...variantPayload,
          sku: retrySku,
        };

        if (variant.isNew) {
          response = await supabase
            .from("product_variants")
            .insert(retryPayload)
            .select(`
              id,
              product_id,
              color_id,
              title,
              sku,
              barcode,
              color,
              size,
              price,
              compare_at_price,
              cost_price,
              stock_quantity,
              low_stock_threshold,
              track_inventory,
              allow_backorder,
              weight_grams,
              position,
              is_active,
              created_at,
              updated_at
            `)
            .single();
        } else {
          response = await supabase
            .from("product_variants")
            .update(retryPayload)
            .eq("id", variant.id)
            .eq("product_id", productId)
            .select(`
              id,
              product_id,
              color_id,
              title,
              sku,
              barcode,
              color,
              size,
              price,
              compare_at_price,
              cost_price,
              stock_quantity,
              low_stock_threshold,
              track_inventory,
              allow_backorder,
              weight_grams,
              position,
              is_active,
              created_at,
              updated_at
            `)
            .single();
        }
      }

      if (response.error) {
        throw response.error;
      }

      setColours((current) =>
        current.map((item) => {
          if (item.id !== colour.id) {
            return item;
          }

          return {
            ...item,
            variants: item.variants.map(
              (currentVariant) =>
                currentVariant.id ===
                variant.id
                  ? {
                      ...response.data,
                      isNew: false,
                      isSaving: false,
                    }
                  : currentVariant
            ),
          };
        })
      );

      showMessage(
        `${colour.name} / ${size} was saved with SKU ${response.data.sku}.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to save variant:",
        error
      );

      setVariantSaving(
        colour.id,
        variant.id,
        false
      );

      showMessage(
        error.message ||
          "The variant could not be saved."
      );
    }
  };

  const handleDeleteVariant = async (
    colour,
    variant
  ) => {
    if (variant.isNew) {
      setColours((current) =>
        current.map((item) =>
          item.id === colour.id
            ? {
                ...item,
                variants:
                  item.variants.filter(
                    (currentVariant) =>
                      currentVariant.id !==
                      variant.id
                  ),
              }
            : item
        )
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete ${colour.name} / ${variant.size}?`
    );

    if (!confirmed) return;

    setVariantSaving(
      colour.id,
      variant.id,
      true
    );

    setMessage("");

    try {
      const { error: imageDetachError } =
        await supabase
          .from("product_images")
          .update({
            variant_id: null,
          })
          .eq("variant_id", variant.id);

      if (imageDetachError) {
        throw imageDetachError;
      }

      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variant.id)
        .eq("product_id", productId);

      if (error) {
        throw error;
      }

      setColours((current) =>
        current.map((item) =>
          item.id === colour.id
            ? {
                ...item,
                variants:
                  item.variants.filter(
                    (currentVariant) =>
                      currentVariant.id !==
                      variant.id
                  ),
              }
            : item
        )
      );

      showMessage(
        `${colour.name} / ${variant.size} was deleted.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to delete variant:",
        error
      );

      setVariantSaving(
        colour.id,
        variant.id,
        false
      );

      showMessage(
        error.message ||
          "The variant could not be deleted."
      );
    }
  };

  if (loading) {
    return (
      <section className="border border-black/10 bg-[#e9e2da] p-7">
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={28}
              strokeWidth={1.3}
              className="mx-auto animate-spin"
            />

            <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
              Loading colours and inventory
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
            Variants and Inventory
          </p>

          <h2 className="mt-3 font-serif text-[32px] tracking-[-0.03em]">
            Colours and sizes
          </h2>

          <p className="mt-3 max-w-2xl text-[10px] leading-6 text-[#71665e]">
            Add each available colour, then create its
            size, SKU, price and stock combinations.
          </p>
        </div>

        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[7px] uppercase tracking-[0.18em] text-[#786d65]">
              Variants
            </p>

            <p className="mt-2 font-serif text-[25px]">
              {totalVariants}
            </p>
          </div>

          <div>
            <p className="text-[7px] uppercase tracking-[0.18em] text-[#786d65]">
              Active Stock
            </p>

            <p className="mt-2 font-serif text-[25px]">
              {totalStock}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border border-black/10 bg-[#f2eee9] p-4 sm:grid-cols-[1fr_190px_auto] sm:items-end">
        <div>
          <label className="block text-[7px] uppercase tracking-[0.17em]">
            New Colour Name
          </label>

          <input
            type="text"
            name="name"
            value={newColour.name}
            onChange={handleNewColourChange}
            placeholder="Chocolate Brown"
            className="mt-3 h-12 w-full border border-black/15 bg-white/40 px-4 text-[10px] outline-none focus:border-black/50"
          />
        </div>

        <div>
          <label className="block text-[7px] uppercase tracking-[0.17em]">
            Hex Swatch
          </label>

          <div className="mt-3 flex h-12 overflow-hidden border border-black/15 bg-white/40">
            <input
              type="color"
              value={
                /^#[0-9A-Fa-f]{6}$/.test(
                  newColour.hexCode
                )
                  ? newColour.hexCode
                  : "#D8C4B6"
              }
              onChange={(event) =>
                setNewColour((current) => ({
                  ...current,
                  hexCode: event.target.value,
                }))
              }
              className="h-full w-14 cursor-pointer border-0 bg-transparent p-1"
            />

            <input
              type="text"
              name="hexCode"
              value={newColour.hexCode}
              onChange={handleNewColourChange}
              placeholder="#D8C4B6"
              className="min-w-0 flex-1 bg-transparent px-3 text-[10px] uppercase outline-none"
            />
          </div>
        </div>

        <button
  type="button"
  onClick={handleAddColour}
  disabled={savingColour}
  className="flex h-12 items-center justify-center gap-2 bg-[#211c18] px-6 text-[8px] uppercase tracking-[0.18em] text-white disabled:opacity-50"
>
          {savingColour ? (
            <LoaderCircle
              size={13}
              className="animate-spin"
            />
          ) : (
            <Plus size={13} />
          )}

          Add Colour
        </button>
      </div>

      {message && (
        <div
          className={
            messageType === "success"
              ? "sticky top-3 z-30 mt-5 flex items-start gap-3 border border-[#55705a]/20 bg-[#eef4ef] p-4 text-[#45604b] shadow-lg sm:static sm:shadow-none"
              : "sticky top-3 z-30 mt-5 flex items-start gap-3 border border-[#9b493f]/20 bg-[#f8ecea] p-4 text-[#9b493f] shadow-lg sm:static sm:shadow-none"
          }
        >
          {messageType === "success" ? (
            <Check
              size={15}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertCircle
              size={15}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="text-[9px] leading-5">
            {message}
          </p>
        </div>
      )}

      {colours.length === 0 ? (
        <div className="mt-6 border border-dashed border-black/20 px-6 py-14 text-center">
          <PackagePlus
            size={28}
            strokeWidth={1.2}
            className="mx-auto text-[#786d65]"
          />

          <h3 className="mt-5 font-serif text-[28px] tracking-[-0.03em]">
            No colours added
          </h3>

          <p className="mx-auto mt-3 max-w-md text-[10px] leading-6 text-[#71665e]">
            Add the first product colour above.
            You can then create its available sizes,
            SKUs and inventory.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {colours.map((colour) => {
            const isExpanded =
              expandedColourIds.includes(
                colour.id
              );

            const colourStock = (
              colour.variants || []
            ).reduce(
              (total, variant) =>
                total +
                (variant.is_active
                  ? Number(
                      variant.stock_quantity
                    ) || 0
                  : 0),
              0
            );

            return (
              <article
                key={colour.id}
                className="border border-black/10 bg-[#f2eee9]"
              >
                <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                  <button
                    type="button"
                    onClick={() =>
                      toggleColour(colour.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span
                      className="h-11 w-11 shrink-0 rounded-full border border-black/15 shadow-inner"
                      style={{
                        background:
                          colour.hex_code ||
                          "#d7d0c8",
                      }}
                    />

                    <span className="min-w-0">
                      <span className="block truncate text-[10px] uppercase tracking-[0.13em]">
                        {colour.name}
                      </span>

                      <span className="mt-2 block text-[8px] text-[#786d65]">
                        {colour.variants.length}{" "}
                        variant
                        {colour.variants.length === 1
                          ? ""
                          : "s"}{" "}
                        · {colourStock} in stock
                      </span>
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[7px] uppercase tracking-[0.15em]">
                      <input
                        type="checkbox"
                        checked={colour.is_active}
                        onChange={(event) =>
                          updateColourLocally(
                            colour.id,
                            "is_active",
                            event.target.checked
                          )
                        }
                      />

                      Active
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddVariant(colour)
                      }
                      className="flex h-10 items-center gap-2 border border-black/15 px-4 text-[7px] uppercase tracking-[0.16em]"
                    >
                      <Plus size={12} />
                      Add Size
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleColour(colour.id)
                      }
                      className="flex h-10 w-10 items-center justify-center border border-black/15"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-black/10 p-5">
                    <div className="grid gap-4 md:grid-cols-[1fr_190px_auto_auto] md:items-end">
                      <div>
                        <label className="block text-[7px] uppercase tracking-[0.16em]">
                          Colour Name
                        </label>

                        <input
                          type="text"
                          value={colour.name}
                          onChange={(event) =>
                            updateColourLocally(
                              colour.id,
                              "name",
                              event.target.value
                            )
                          }
                          className="mt-3 h-11 w-full border border-black/15 bg-white/40 px-4 text-[10px] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[7px] uppercase tracking-[0.16em]">
                          Hex Swatch
                        </label>

                        <div className="mt-3 flex h-11 overflow-hidden border border-black/15 bg-white/40">
                          <input
                            type="color"
                            value={
                              /^#[0-9A-Fa-f]{6}$/.test(
                                colour.hex_code ||
                                  ""
                              )
                                ? colour.hex_code
                                : "#D8C4B6"
                            }
                            onChange={(event) =>
                              updateColourLocally(
                                colour.id,
                                "hex_code",
                                event.target.value
                              )
                            }
                            className="h-full w-12 cursor-pointer border-0 bg-transparent p-1"
                          />

                          <input
                            type="text"
                            value={
                              colour.hex_code || ""
                            }
                            onChange={(event) =>
                              updateColourLocally(
                                colour.id,
                                "hex_code",
                                normaliseHexCode(
                                  event.target.value
                                )
                              )
                            }
                            className="min-w-0 flex-1 bg-transparent px-3 text-[9px] uppercase outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveColour(colour)
                        }
                        disabled={colour.isSaving}
                        className="flex h-11 items-center justify-center gap-2 bg-[#211c18] px-5 text-[7px] uppercase tracking-[0.16em] text-white disabled:opacity-50"
                      >
                        {colour.isSaving ? (
                          <LoaderCircle
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={12} />
                        )}

                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteColour(
                            colour
                          )
                        }
                        disabled={colour.isSaving}
                        className="flex h-11 items-center justify-center gap-2 border border-[#9b493f]/30 px-5 text-[7px] uppercase tracking-[0.16em] text-[#9b493f] disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>

                    <div className="mt-6">
                      <div className="hidden grid-cols-[110px_1fr_110px_110px_90px_85px] gap-3 border-b border-black/10 pb-3 text-[7px] uppercase tracking-[0.15em] text-[#786d65] xl:grid">
                        <span>Size</span>
                        <span>SKU</span>
                        <span>Price</span>
                        <span>Stock</span>
                        <span>Active</span>
                        <span>Actions</span>
                      </div>

                      {colour.variants.length ===
                      0 ? (
                        <div className="border-b border-black/10 py-10 text-center">
                          <p className="text-[9px] text-[#71665e]">
                            No sizes have been added
                            for {colour.name}.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddVariant(
                                colour
                              )
                            }
                            className="mt-4 inline-flex items-center gap-2 text-[7px] uppercase tracking-[0.17em]"
                          >
                            <Plus size={12} />
                            Add First Size
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-black/[0.08]">
                          {colour.variants.map(
                            (variant) => (
                              <div
                                key={variant.id}
                                className="grid gap-4 py-5 xl:grid-cols-[110px_1fr_110px_110px_90px_85px] xl:items-end xl:gap-3"
                              >
                                <div>
                                  <label className="block text-[7px] uppercase tracking-[0.14em] text-[#786d65] xl:hidden">
                                    Size
                                  </label>

                                  <input
                                    type="text"
                                    value={
                                      variant.size ||
                                      ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleSizeChange(
                                        colour,
                                        variant,
                                        event.target
                                          .value
                                      )
                                    }
                                    placeholder="One Size"
                                    className="mt-2 h-10 w-full border border-black/15 bg-white/40 px-3 text-[9px] outline-none xl:mt-0"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[7px] uppercase tracking-[0.14em] text-[#786d65] xl:hidden">
                                    SKU
                                  </label>

                                  <input
                                    type="text"
                                    value={
                                      variant.sku ||
                                      ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateVariantLocally(
                                        colour.id,
                                        variant.id,
                                        "sku",
                                        event.target
                                          .value
                                          .toUpperCase()
                                      )
                                    }
                                    placeholder="HAYA-BRN-OS"
                                    className="mt-2 h-10 w-full border border-black/15 bg-white/40 px-3 text-[9px] uppercase outline-none xl:mt-0"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[7px] uppercase tracking-[0.14em] text-[#786d65] xl:hidden">
                                    Price
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      variant.price
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateVariantLocally(
                                        colour.id,
                                        variant.id,
                                        "price",
                                        event.target
                                          .value
                                      )
                                    }
                                    className="mt-2 h-10 w-full border border-black/15 bg-white/40 px-3 text-[9px] outline-none xl:mt-0"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[7px] uppercase tracking-[0.14em] text-[#786d65] xl:hidden">
                                    Stock
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                      variant.stock_quantity
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateVariantLocally(
                                        colour.id,
                                        variant.id,
                                        "stock_quantity",
                                        event.target
                                          .value
                                      )
                                    }
                                    className="mt-2 h-10 w-full border border-black/15 bg-white/40 px-3 text-[9px] outline-none xl:mt-0"
                                  />
                                </div>

                                <label className="flex h-10 items-center gap-2 text-[7px] uppercase tracking-[0.14em]">
                                  <input
                                    type="checkbox"
                                    checked={
                                      variant.is_active
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateVariantLocally(
                                        colour.id,
                                        variant.id,
                                        "is_active",
                                        event.target
                                          .checked
                                      )
                                    }
                                  />

                                  Active
                                </label>

                                <div className="flex h-10 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveVariant(
                                        colour,
                                        variant
                                      )
                                    }
                                    disabled={
                                      variant.isSaving
                                    }
                                    className="flex flex-1 items-center justify-center border border-black/15 bg-[#211c18] text-white disabled:opacity-50"
                                    aria-label="Save variant"
                                  >
                                    {variant.isSaving ? (
                                      <LoaderCircle
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Save
                                        size={13}
                                      />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteVariant(
                                        colour,
                                        variant
                                      )
                                    }
                                    disabled={
                                      variant.isSaving
                                    }
                                    className="flex flex-1 items-center justify-center border border-[#9b493f]/25 text-[#9b493f] disabled:opacity-50"
                                    aria-label="Delete variant"
                                  >
                                    <Trash2
                                      size={13}
                                    />
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}