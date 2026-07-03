import fallbackImage from "../assets/images/hero.jpg";

import { supabase } from "./supabase";

function sortByPosition(items = []) {
  return [...items].sort(
    (a, b) =>
      (Number(a.position) || 0) -
      (Number(b.position) || 0)
  );
}

function getProductImages(images = []) {
  return sortByPosition(images).filter(
    (image) => image.public_url
  );
}

function mapColour(colour, images, variants) {
  const colourImages = getProductImages(
    images.filter(
      (image) => image.color_id === colour.id
    )
  );

  const colourVariants = sortByPosition(
    variants.filter(
      (variant) =>
        variant.color_id === colour.id &&
        variant.is_active
    )
  ).map((variant) => ({
    id: variant.id,
    title: variant.title,
    sku: variant.sku || "",
    barcode: variant.barcode || "",
    colour: colour.name,
    colourId: colour.id,
    size: variant.size || "One Size",
    price: Number(variant.price) || 0,
    originalPrice:
      variant.compare_at_price === null ||
      variant.compare_at_price === undefined
        ? null
        : Number(variant.compare_at_price),
    stock: Number(variant.stock_quantity) || 0,
    lowStockThreshold:
      Number(variant.low_stock_threshold) || 0,
    trackInventory:
      variant.track_inventory !== false,
    allowBackorder:
      variant.allow_backorder === true,
    inStock:
      variant.track_inventory === false ||
      Number(variant.stock_quantity) > 0 ||
      variant.allow_backorder === true,
    isActive: variant.is_active,
  }));

  return {
    id: colour.id,
    name: colour.name,
    hexCode: colour.hex_code || "#b7aaa0",
    swatchImage:
      colour.swatch_image_url || null,
    position: Number(colour.position) || 0,
    isActive: colour.is_active,
    images: colourImages.map(
      (image) => image.public_url
    ),
    imageRecords: colourImages,
    variants: colourVariants,
    sizes: colourVariants.map(
      (variant) => variant.size
    ),
    inStock: colourVariants.some(
      (variant) => variant.inStock
    ),
  };
}

export function mapStoreProduct(product) {
  const allImages = getProductImages(
    product.product_images || []
  );

  const allVariants = sortByPosition(
    product.product_variants || []
  ).filter((variant) => variant.is_active);

  const colourOptions = sortByPosition(
    product.product_colors || []
  )
    .filter((colour) => colour.is_active)
    .map((colour) =>
      mapColour(
        colour,
        allImages,
        allVariants
      )
    );

  const primaryImage =
    allImages.find(
      (image) => image.is_primary
    ) || allImages[0];

  const primaryImageUrl =
    primaryImage?.public_url ||
    colourOptions.find(
      (colour) => colour.images.length > 0
    )?.images[0] ||
    fallbackImage;

  const secondaryImageUrl =
    allImages.find(
      (image) =>
        image.public_url !== primaryImageUrl
    )?.public_url ||
    colourOptions
      .flatMap((colour) => colour.images)
      .find(
        (image) => image !== primaryImageUrl
      ) ||
    primaryImageUrl;

  const gallery = Array.from(
    new Set([
      ...allImages.map(
        (image) => image.public_url
      ),
      ...colourOptions.flatMap(
        (colour) => colour.images
      ),
    ])
  );

  const firstVariant = allVariants[0];

  const lowestVariantPrice =
    allVariants.length > 0
      ? Math.min(
          ...allVariants.map(
            (variant) =>
              Number(variant.price) || 0
          )
        )
      : null;

  const price =
    lowestVariantPrice !== null
      ? lowestVariantPrice
      : Number(product.base_price) || 0;

  const originalPrice =
    product.compare_at_price === null ||
    product.compare_at_price === undefined
      ? null
      : Number(product.compare_at_price);

  const availableSizes = Array.from(
    new Set(
      allVariants
        .map((variant) => variant.size)
        .filter(Boolean)
    )
  );

  const availableColours =
    colourOptions.map(
      (colour) => colour.name
    );

  const createdAt = product.created_at
    ? new Date(product.created_at)
    : null;

  const newProductLimit =
    Date.now() -
    30 * 24 * 60 * 60 * 1000;

  const isFeatured =
    product.is_featured === true ||
    product.featured === true;

  const isNewArrival =
    product.is_new_arrival === true;

  const isBestseller =
    product.is_bestseller === true;

  const assignedCategories =
  product.product_categories?.map((row) => row.categories).filter(Boolean) ||
  [];

const categoryNames = assignedCategories.map((category) => category.name);
const categorySlugs = assignedCategories.map((category) => category.slug);

return {
  id: product.id,
  slug: product.slug,
  name: product.name,

  category:
    product.product_type || categoryNames[0] || "Collection",

  categoryNames,
  categorySlugs,

    collection: isFeatured
      ? "Featured"
      : "Haya",

    description:
      product.description ||
      product.short_description ||
      "",

    shortDescription:
      product.short_description || "",

    material: "See product details",
    care:
      "Follow the care instructions supplied with your item.",

    vendor: product.vendor || "Haya",
    currency: product.currency || "INR",

    price,
    originalPrice,

    image: primaryImageUrl,
    secondaryImage: secondaryImageUrl,

    gallery:
      gallery.length > 0
        ? gallery
        : [primaryImageUrl],

    colours: availableColours,
    colourOptions,

    sizes: availableSizes,

    variants: allVariants.map(
      (variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        colour: variant.color || "",
        colourId: variant.color_id,
        size: variant.size || "One Size",
        price:
          Number(variant.price) || price,
        originalPrice:
          variant.compare_at_price ===
            null ||
          variant.compare_at_price ===
            undefined
            ? null
            : Number(
                variant.compare_at_price
              ),
        stock:
          Number(
            variant.stock_quantity
          ) || 0,
        trackInventory:
          variant.track_inventory !==
          false,
        allowBackorder:
          variant.allow_backorder ===
          true,
        inStock:
          variant.track_inventory ===
            false ||
          Number(
            variant.stock_quantity
          ) > 0 ||
          variant.allow_backorder ===
            true,
        isActive: variant.is_active,
      })
    ),

    defaultVariant: firstVariant
      ? {
          id: firstVariant.id,
          sku: firstVariant.sku || "",
        }
      : null,

    isNew:
      isNewArrival ||
      (
        Boolean(createdAt) &&
        createdAt.getTime() >=
          newProductLimit
      ),

    isNewArrival,
    isBestseller,
    isFeatured,

    featured: isFeatured,

    featuredPosition:
      Number(product.featured_position) || 0,

    newArrivalPosition:
      Number(product.new_arrival_position) || 0,

    bestsellerPosition:
      Number(product.bestseller_position) || 0,

    inStock:
      allVariants.length === 0
        ? false
        : allVariants.some(
            (variant) =>
              variant.track_inventory ===
                false ||
              Number(
                variant.stock_quantity
              ) > 0 ||
              variant.allow_backorder ===
                true
          ),

    createdAt: product.created_at,
  };
}

const productSelect = `
  id,
  name,
  slug,
  short_description,
  description,
  status,
  product_type,
  vendor,
  base_price,
  compare_at_price,
  currency,
  featured,
  is_featured,
  is_new_arrival,
  is_bestseller,
  featured_position,
  new_arrival_position,
  bestseller_position,
  created_at,
    published_at,

  product_categories (
    category_id,
    categories (
      id,
      name,
      slug,
      parent_id,
      position,
      is_active
    )
  ),

  product_colors (
    id,
    name,
    hex_code,
    swatch_image_url,
    position,
    is_active
  ),

  product_images (
    id,
    product_id,
    color_id,
    variant_id,
    storage_path,
    public_url,
    alt_text,
    position,
    is_primary
  ),

  product_variants (
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
    stock_quantity,
    low_stock_threshold,
    track_inventory,
    allow_backorder,
    position,
    is_active
  )
`;

export async function fetchActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .order("is_featured", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapStoreProduct);
}

export async function fetchNewArrivalProducts(
  limit = 6
) {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .eq("is_new_arrival", true)
    .order("new_arrival_position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map(mapStoreProduct);
}

export async function fetchBestsellerProducts(
  limit = 4
) {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .eq("is_bestseller", true)
    .order("bestseller_position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map(mapStoreProduct);
}

export async function fetchFeaturedProducts(
  limit = 6
) {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("featured_position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map(mapStoreProduct);
}

export async function fetchProductsByCategorySlug(
  categorySlug
) {
  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select(
      `
        id,
        parent_id,
        name,
        slug,
        description,
        image_url,
        position,
        is_active
      `
    )
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }

  if (!category) {
    return {
      category: null,
      children: [],
      products: [],
    };
  }

  const {
    data: children,
    error: childrenError,
  } = await supabase
    .from("categories")
    .select(
      `
        id,
        parent_id,
        name,
        slug,
        description,
        image_url,
        position,
        is_active
      `
    )
    .eq("parent_id", category.id)
    .eq("is_active", true)
    .order("position", {
      ascending: true,
    });

  if (childrenError) {
    throw childrenError;
  }

  const categoryIds = [
    category.id,
    ...(children || []).map(
      (child) => child.id
    ),
  ];

  const {
    data: productCategoryRows,
    error: productCategoryError,
  } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", categoryIds);

  if (productCategoryError) {
    throw productCategoryError;
  }

  const productIds = Array.from(
    new Set(
      (productCategoryRows || []).map(
        (row) => row.product_id
      )
    )
  );

  if (productIds.length === 0) {
    return {
      category,
      children: children || [],
      products: [],
    };
  }

  const { data: products, error } =
    await supabase
      .from("products")
      .select(productSelect)
      .eq("status", "active")
      .in("id", productIds)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return {
    category,
    children: children || [],
    products: (products || []).map(
      mapStoreProduct
    ),
  };
}


export async function fetchActiveProductBySlug(
  slug
) {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? mapStoreProduct(data)
    : null;
}