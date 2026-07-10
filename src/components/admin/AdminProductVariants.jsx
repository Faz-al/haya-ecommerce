import AdminProductVariants from "../../components/admin/AdminProductVariants";
import AdminProductImages from "../../components/admin/AdminProductImages";

import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Save,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import RichTextEditor from "../../components/admin/RichTextEditor";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueProductSlug(baseSlug, currentProductId) {
  const fallbackSlug = "product";
  const cleanBaseSlug = createSlug(baseSlug) || fallbackSlug;

  let finalSlug = cleanBaseSlug;
  let counter = 2;

  while (true) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("slug", finalSlug)
      .limit(1);

    if (currentProductId) {
      query = query.neq("id", currentProductId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return finalSlug;
    }

    finalSlug = `${cleanBaseSlug}-${counter}`;
    counter += 1;
  }
}

function groupCategories(categories) {
  const parents = categories
    .filter((category) => !category.parent_id)
    .sort(
      (a, b) =>
        Number(a.position || 0) -
        Number(b.position || 0)
    );

  return parents.map((parent) => ({
    ...parent,
    children: categories
      .filter(
        (category) =>
          category.parent_id === parent.id
      )
      .sort(
        (a, b) =>
          Number(a.position || 0) -
          Number(b.position || 0)
      ),
  }));
}

const initialFormData = {
  name: "",
  slug: "",

  shortDescription: "",
  description: "",

  productType: "Hijab",
  vendor: "Haya",

  basePrice: "",
  compareAtPrice: "",
  currency: "INR",

  status: "draft",

  featured: false,
  isNewArrival: false,
  isBestseller: false,

  seoTitle: "",
  seoDescription: "",
};

const EDIT_PRODUCT_DRAFT_PREFIX = "haya-admin-product-edit-draft";

export default function AdminProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const editDraftKey = `${EDIT_PRODUCT_DRAFT_PREFIX}-${productId}`;

  const [formData, setFormData] =
    useState(initialFormData);

    const [draftRestored, setDraftRestored] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [originalProduct, setOriginalProduct] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error");

  const groupedCategories = useMemo(
    () => groupCategories(categories),
    [categories]
  );

  const canSubmit = useMemo(() => {
    return Boolean(
      formData.name.trim() &&
        formData.slug.trim() &&
        formData.basePrice !== ""
    );
  }, [
    formData.name,
    formData.slug,
    formData.basePrice,
  ]);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoadError("A product ID was not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const [
        productResponse,
        categoriesResponse,
        productCategoriesResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
              id,
              name,
              slug,
              short_description,
              description,
              product_type,
              vendor,
              base_price,
              compare_at_price,
              currency,
              status,
              featured,
              is_featured,
              is_new_arrival,
              is_bestseller,
              featured_position,
              new_arrival_position,
              bestseller_position,
              seo_title,
              seo_description,
              published_at,
              created_at
            `
          )
          .eq("id", productId)
          .single(),

        supabase
          .from("categories")
          .select(
            `
              id,
              parent_id,
              name,
              slug,
              position,
              is_active
            `
          )
          .eq("is_active", true)
          .order("position", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("product_categories")
          .select("category_id")
          .eq("product_id", productId),
      ]);

      if (productResponse.error) {
        if (
          productResponse.error.code ===
          "PGRST116"
        ) {
          throw new Error(
            "This product could not be found."
          );
        }

        throw productResponse.error;
      }

      if (categoriesResponse.error) {
        throw categoriesResponse.error;
      }

      if (productCategoriesResponse.error) {
        throw productCategoriesResponse.error;
      }

      const data = productResponse.data;

      setOriginalProduct(data);
      setSlugManuallyEdited(false);

      setCategories(
        categoriesResponse.data || []
      );

      setSelectedCategoryIds(
        (
          productCategoriesResponse.data ||
          []
        ).map((row) => row.category_id)
      );

      const loadedCategoryIds =
  (
    productCategoriesResponse.data ||
    []
  ).map((row) => row.category_id);

const loadedFormData = {
  name: data.name || "",
  slug: data.slug || "",

  shortDescription:
    data.short_description || "",

  description:
    data.description || "",

  productType:
    data.product_type || "Hijab",

  vendor:
    data.vendor || "Haya",

  basePrice:
    data.base_price === null ||
    data.base_price === undefined
      ? ""
      : String(data.base_price),

  compareAtPrice:
    data.compare_at_price === null ||
    data.compare_at_price === undefined
      ? ""
      : String(data.compare_at_price),

  currency:
    data.currency || "INR",

  status:
    data.status || "draft",

  featured: Boolean(
    data.is_featured ??
      data.featured
  ),

  isNewArrival: Boolean(
    data.is_new_arrival
  ),

  isBestseller: Boolean(
    data.is_bestseller
  ),

  seoTitle:
    data.seo_title || "",

  seoDescription:
    data.seo_description || "",
};

let nextFormData = loadedFormData;
let nextCategoryIds = loadedCategoryIds;
let restoredDraft = false;

try {
  const savedDraft = window.localStorage.getItem(editDraftKey);

  if (savedDraft) {
    const parsedDraft = JSON.parse(savedDraft);

    if (parsedDraft?.formData) {
      nextFormData = {
        ...loadedFormData,
        ...parsedDraft.formData,
      };

      restoredDraft = true;
    }

    if (Array.isArray(parsedDraft?.selectedCategoryIds)) {
      nextCategoryIds = parsedDraft.selectedCategoryIds;
      restoredDraft = true;
    }

    if (typeof parsedDraft?.slugManuallyEdited === "boolean") {
      setSlugManuallyEdited(parsedDraft.slugManuallyEdited);
    }
  }
} catch (error) {
  console.error("Failed to restore product edit draft:", error);
}

setSelectedCategoryIds(nextCategoryIds);
setFormData(nextFormData);
setDraftRestored(restoredDraft);
setHasUnsavedChanges(restoredDraft);

if (restoredDraft) {
  setMessageType("success");
  setMessage(
    "Your unsaved product edits were restored. Review and save when ready."
  );
}
    } catch (error) {
      console.error(
        "Failed to load product:",
        error
      );

      setLoadError(
        error.message ||
          "The product could not be loaded."
      );
    } finally {
      setLoading(false);
    }
}, [editDraftKey, productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
  if (loading || loadError || !originalProduct || !hasUnsavedChanges) {
  return;
}

  const hasUsefulDraft =
    formData.name.trim() ||
    formData.slug.trim() ||
    formData.shortDescription.trim() ||
    formData.description.trim() ||
    formData.basePrice !== "" ||
    selectedCategoryIds.length > 0;

  if (!hasUsefulDraft) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    try {
      window.localStorage.setItem(
        editDraftKey,
        JSON.stringify({
          formData,
          selectedCategoryIds,
          slugManuallyEdited,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Failed to autosave product edit draft:", error);
    }
  }, 500);

  return () => window.clearTimeout(timeoutId);
}, [
  editDraftKey,
  formData,
  selectedCategoryIds,
  slugManuallyEdited,
  loading,
  loadError,
  originalProduct,
  hasUnsavedChanges,
]);

  const handleChange = (event) => {
  const {
    name,
    value,
    type,
    checked,
  } = event.target;

  setMessage("");

  setHasUnsavedChanges(true);

  setFormData((current) => {
    const nextValue =
      type === "checkbox" ? checked : value;

    const nextData = {
      ...current,
      [name]: nextValue,
    };

    if (name === "name" && !slugManuallyEdited) {
      nextData.slug = createSlug(value);
    }

    return nextData;
  });
};

  const handleSlugChange = (event) => {
  setSlugManuallyEdited(true);
  setHasUnsavedChanges(true);

  setFormData((current) => ({
    ...current,
    slug: createSlug(event.target.value),
  }));

  setMessage("");
};

  const handleCategoryToggle = (
    categoryId
  ) => {
    setMessage("");

    setHasUnsavedChanges(true);

    setSelectedCategoryIds(
      (current) => {
        if (
          current.includes(categoryId)
        ) {
          return current.filter(
            (id) => id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  };

  const saveProductCategories = async () => {
    const { error: deleteError } =
      await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", productId);

    if (deleteError) {
      throw deleteError;
    }

    if (
      selectedCategoryIds.length === 0
    ) {
      return;
    }

    const categoryRows =
      selectedCategoryIds.map(
        (categoryId) => ({
          product_id: productId,
          category_id: categoryId,
        })
      );

    const { error: insertError } =
      await supabase
        .from("product_categories")
        .insert(categoryRows);

    if (insertError) {
      throw insertError;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setMessage("");
    setMessageType("error");

    if (!canSubmit) {
      setMessage(
        "Product name, slug and selling price are required."
      );
      return;
    }

    const basePrice = Number(
      formData.basePrice
    );

    const compareAtPrice =
      formData.compareAtPrice === ""
        ? null
        : Number(
            formData.compareAtPrice
          );

    if (
      Number.isNaN(basePrice) ||
      basePrice < 0
    ) {
      setMessage(
        "Please enter a valid selling price."
      );
      return;
    }

    if (
      compareAtPrice !== null &&
      (
        Number.isNaN(compareAtPrice) ||
        compareAtPrice < 0
      )
    ) {
      setMessage(
        "Please enter a valid compare-at price."
      );
      return;
    }

    if (
      compareAtPrice !== null &&
      compareAtPrice <= basePrice
    ) {
      setMessage(
        "Compare-at price should be higher than the selling price."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let publishedAt =
        originalProduct?.published_at ||
        null;

      if (
        formData.status === "active" &&
        !publishedAt
      ) {
        publishedAt =
          new Date().toISOString();
      }

      if (
        formData.status !== "active"
      ) {
        publishedAt = null;
      }

     const safeSlug = await createUniqueProductSlug(
  formData.slug || formData.name,
  productId
);

const productUpdate = {
  name: formData.name.trim(),
  slug: safeSlug,

        short_description:
          formData.shortDescription.trim() ||
          null,

        description:
          formData.description.trim() ||
          null,

        product_type:
          formData.productType.trim() ||
          null,

        vendor:
          formData.vendor.trim() ||
          "Haya",

        base_price: basePrice,
        compare_at_price:
          compareAtPrice,
        currency: formData.currency,

        status: formData.status,

        /*
         * Keep old featured field and new
         * production merchandising fields.
         */
        featured: formData.featured,
        is_featured:
          formData.featured,
        is_new_arrival:
          formData.isNewArrival,
        is_bestseller:
          formData.isBestseller,

        seo_title:
          formData.seoTitle.trim() ||
          null,

        seo_description:
          formData.seoDescription.trim() ||
          null,

        published_at: publishedAt,
      };

      const {
        data: updatedProduct,
        error,
      } = await supabase
        .from("products")
        .update(productUpdate)
        .eq("id", productId)
        .select(
          `
            id,
            name,
            slug,
            published_at
          `
        )
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "Another product already uses this URL slug."
          );
        }

        throw error;
      }

      await saveProductCategories();

      try {
  window.localStorage.removeItem(editDraftKey);
} catch (error) {
  console.error("Failed to clear product edit draft:", error);
}

setDraftRestored(false);
setHasUnsavedChanges(false);

      setOriginalProduct((current) => ({
        ...current,
        ...updatedProduct,
      }));

      setFormData((current) => ({
        ...current,
        slug: updatedProduct.slug,
      }));
setMessageType("success");

if (updatedProduct.slug !== createSlug(formData.slug)) {
  setMessage(
    `${updatedProduct.name} details were saved successfully. The URL slug was changed to "${updatedProduct.slug}" because the previous slug was already used. Colours and variants are saved separately using their own Save buttons.`
  );
} else {
  setMessage(
    `${updatedProduct.name} details were saved successfully. Colours and variants are saved separately using their own Save buttons.`
  );
}

    } catch (error) {
      console.error(
        "Product update failed:",
        error
      );

      setMessageType("error");
      setMessage(
        error.message ||
          "The product could not be updated."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={34}
            strokeWidth={1.2}
            className="mx-auto animate-spin"
          />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
            Loading product
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-center">
        <div className="max-w-md">
          <AlertCircle
            size={34}
            strokeWidth={1.2}
            className="mx-auto"
          />

          <h1 className="mt-5 font-serif text-[38px] tracking-[-0.03em]">
            Product unavailable
          </h1>

          <p className="mt-4 text-[11px] leading-6 text-[#71665e]">
            {loadError}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchProduct}
              className="min-h-12 border border-black/15 px-7 text-[8px] uppercase tracking-[0.18em]"
            >
              Try Again
            </button>

            <Link
              to="/admin/products"
              className="flex min-h-12 items-center justify-center bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.18em] text-white"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#71665e] transition hover:text-[#211c18]"
      >
        <ArrowLeft
          size={13}
          strokeWidth={1.4}
        />

        Back to Products
      </Link>

      <div className="mt-7 flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.27em] text-[#786d65]">
            Catalogue
          </p>

          <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[55px]">
            Edit Product
          </h1>

          <p className="mt-4 text-[11px] text-[#71665e]">
            Update product information, pricing,
            categories, publication and storefront details.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/product/${formData.slug}`
            )
          }
          disabled={!formData.slug}
          className="min-h-12 border border-black/15 px-6 text-[8px] uppercase tracking-[0.18em] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          View Product
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            event.target.tagName !==
              "TEXTAREA"
          ) {
            event.preventDefault();
          }
        }}
        className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]"
      >
        <div className="space-y-8">
          <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Product Information
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Product Name
                </label>

                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Lightweight Chiffon Hijab"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  URL Slug
                </label>

                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="lightweight-chiffon-hijab"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />

                <p className="mt-2 text-[8px] text-[#81766e]">
                  Product URL: /product/
                  {formData.slug ||
                    "product-slug"}
                </p>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Short Description
                </label>

                <textarea
                  name="shortDescription"
                  value={
                    formData.shortDescription
                  }
                  onChange={handleChange}
                  rows={3}
                  placeholder="A short description shown near the product title."
                  className="mt-3 w-full resize-y border border-black/15 bg-[#f2eee9] px-4 py-4 text-[11px] leading-6 outline-none transition focus:border-black/50"
                />
              </div>

              <div>
  <label className="block text-[8px] uppercase tracking-[0.17em]">
    Full Description
  </label>

  <RichTextEditor
    value={formData.description}
    placeholder="Describe the fabric, feel, styling, care instructions and product details."
    onChange={(html) => {
      setMessage("");
        setHasUnsavedChanges(true);
      setFormData((current) => ({
        ...current,
        description: html,
      }));
    }}
  />

  <p className="mt-2 text-[8px] leading-5 text-[#81766e]">
    Use the toolbar to add headings, bold text, italic text,
    lists, links and images.
  </p>
</div>
            </div>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Pricing
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Selling Price
                </label>

                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  name="basePrice"
                  value={
                    formData.basePrice
                  }
                  onChange={handleChange}
                  placeholder="158.00"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Compare-at Price
                </label>

                <input
                  min="0"
                  step="0.01"
                  type="number"
                  name="compareAtPrice"
                  value={
                    formData.compareAtPrice
                  }
                  onChange={handleChange}
                  placeholder="199.00"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Currency
                </label>

                <select
                  name="currency"
                  value={
                    formData.currency
                  }
                  onChange={handleChange}
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                >
                  <option value="INR">
                    INR
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="AED">
                    AED
                  </option>

                  <option value="GBP">
                    GBP
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Organisation
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Product Type
                </label>

                <input
                  type="text"
                  name="productType"
                  value={
                    formData.productType
                  }
                  onChange={handleChange}
                  placeholder="Hijab"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Vendor
                </label>

                <input
                  type="text"
                  name="vendor"
                  value={
                    formData.vendor
                  }
                  onChange={handleChange}
                  placeholder="Haya"
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>
            </div>

            <div className="mt-7 border-t border-black/10 pt-6">
              <p className="text-[8px] uppercase tracking-[0.18em]">
                Categories
              </p>

              <p className="mt-2 text-[9px] leading-5 text-[#786d65]">
                Select where this product should appear in the shop and navbar category pages.
              </p>

              {groupedCategories.length ===
              0 ? (
                <p className="mt-5 text-[9px] text-[#786d65]">
                  No active categories found.
                </p>
              ) : (
                <div className="mt-5 space-y-5">
                  {groupedCategories.map(
                    (parent) => (
                      <div
                        key={parent.id}
                        className="border border-black/10 bg-[#f2eee9] p-4"
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(
                              parent.id
                            )}
                            onChange={() =>
                              handleCategoryToggle(
                                parent.id
                              )
                            }
                            className="mt-0.5"
                          />

                          <span>
                            <span className="block text-[8px] uppercase tracking-[0.16em]">
                              {parent.name}
                            </span>

                            <span className="mt-1 block text-[8px] text-[#786d65]">
                              Main category
                            </span>
                          </span>
                        </label>

                        {parent.children.length >
                          0 && (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {parent.children.map(
                              (child) => (
                                <label
                                  key={
                                    child.id
                                  }
                                  className="flex cursor-pointer items-start gap-3"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCategoryIds.includes(
                                      child.id
                                    )}
                                    onChange={() =>
                                      handleCategoryToggle(
                                        child.id
                                      )
                                    }
                                    className="mt-0.5"
                                  />

                                  <span className="text-[9px] leading-5 text-[#4f4741]">
                                    {
                                      child.name
                                    }
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Search Engine Listing
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  SEO Title
                </label>

                <input
                  type="text"
                  name="seoTitle"
                  value={
                    formData.seoTitle
                  }
                  onChange={handleChange}
                  className="mt-3 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none transition focus:border-black/50"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  SEO Description
                </label>

                <textarea
                  name="seoDescription"
                  value={
                    formData.seoDescription
                  }
                  onChange={handleChange}
                  rows={4}
                  className="mt-3 w-full resize-y border border-black/15 bg-[#f2eee9] px-4 py-4 text-[11px] leading-6 outline-none transition focus:border-black/50"
                />
              </div>
            </div>
          </section>

          <AdminProductVariants
            productId={productId}
            productName={formData.name}
            basePrice={formData.basePrice}
            compareAtPrice={
              formData.compareAtPrice
            }
          />

          <AdminProductImages
            productId={productId}
            productName={formData.name}
          />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-8 xl:h-fit">
          <section className="border border-black/10 bg-[#e9e2da] p-6">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Product Status
            </p>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={handleChange}
              className="mt-5 h-13 w-full border border-black/15 bg-[#f2eee9] px-4 text-[11px] outline-none"
            >
              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="archived">
                Archived
              </option>
            </select>

            <p className="mt-3 text-[9px] leading-5 text-[#786d65]">
              Active products can appear on the storefront. Draft products remain visible only to administrators.
            </p>
          </section>

          <section className="space-y-5 border border-black/10 bg-[#e9e2da] p-6">
            <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
              Homepage Placement
            </p>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="featured"
                checked={
                  formData.featured
                }
                onChange={handleChange}
                className="mt-0.5"
              />

              <span>
                <span className="block text-[8px] uppercase tracking-[0.18em]">
                  Featured Product
                </span>

                <span className="mt-2 block text-[9px] leading-5 text-[#786d65]">
                  Use this product in featured homepage sections.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={
                  formData.isNewArrival
                }
                onChange={handleChange}
                className="mt-0.5"
              />

              <span>
                <span className="block text-[8px] uppercase tracking-[0.18em]">
                  New Arrival
                </span>

                <span className="mt-2 block text-[9px] leading-5 text-[#786d65]">
                  Show this product in the New Arrivals section.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="isBestseller"
                checked={
                  formData.isBestseller
                }
                onChange={handleChange}
                className="mt-0.5"
              />

              <span>
                <span className="block text-[8px] uppercase tracking-[0.18em]">
                  Bestseller
                </span>

                <span className="mt-2 block text-[9px] leading-5 text-[#786d65]">
                  Show this product in the Bestseller section.
                </span>
              </span>
            </label>
          </section>

          <button
  type="button"
  onClick={() => {
    const confirmed = window.confirm(
      "Clear the saved unsaved edits for this product?"
    );

    if (!confirmed) return;

    try {
      window.localStorage.removeItem(editDraftKey);
    } catch (error) {
      console.error("Failed to clear product edit draft:", error);
    }

    setDraftRestored(false);
    
    setHasUnsavedChanges(false);
    setMessage("");
    fetchProduct();
  }}
  className="flex min-h-11 w-full items-center justify-center border border-black/15 px-6 text-[8px] uppercase tracking-[0.18em] transition hover:bg-white"
>
  Clear Saved Edits
</button>

          <button
            type="submit"
            disabled={
              isSubmitting || !canSubmit
            }
            className="flex min-h-13 w-full items-center justify-center gap-2 bg-[#211c18] px-6 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoaderCircle
                size={14}
                strokeWidth={1.4}
                className="animate-spin"
              />
            ) : (
              <Save
                size={14}
                strokeWidth={1.4}
              />
            )}

            {isSubmitting
              ? "Saving Details..."
              : "Save Product Details"}
          </button>

          <p className="border border-[#9a7b45]/20 bg-[#9a7b45]/5 p-4 text-[9px] leading-5 text-[#765d34]">
            This button saves product information only. Save every colour and size variant using the Save button inside its row.
          </p>

          {message && (
            <p
              className={
                messageType === "success"
                  ? "border border-[#55705a]/20 bg-[#55705a]/5 p-4 text-[9px] leading-5 text-[#45604b]"
                  : "border border-[#9b493f]/20 bg-[#9b493f]/5 p-4 text-[9px] leading-5 text-[#9b493f]"
              }
            >
              {message}
            </p>
          )}

          <section className="border border-black/10 p-5">
            <p className="text-[8px] uppercase tracking-[0.18em] text-[#786d65]">
              Product ID
            </p>

            <p className="mt-3 break-all text-[9px] leading-5 text-[#71665e]">
              {productId}
            </p>
          </section>

          {draftRestored && (
  <p className="border border-[#55705a]/20 bg-[#55705a]/5 p-4 text-[9px] leading-5 text-[#45604b]">
    Unsaved edits were restored from this browser. Save the product to make them permanent.
  </p>
)}
        </aside>
      </form>
    </>
  );
}