import {
  ArrowLeft,
  Save,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import RichTextEditor from "../../components/admin/RichTextEditor";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export default function AdminProductCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] =
    useState({
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
    });

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const { data, error } =
          await supabase
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
            });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setMessage(
          error.message ||
            "Categories could not be loaded."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  const groupedCategories = useMemo(
    () => groupCategories(categories),
    [categories]
  );

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.slug.trim() &&
      formData.basePrice !== ""
    );
  }, [
    formData.name,
    formData.slug,
    formData.basePrice,
  ]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setMessage("");

    setFormData((current) => {
      const updatedData = {
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        name === "name" &&
        !slugEdited
      ) {
        updatedData.slug =
          createSlug(value);
      }

      return updatedData;
    });
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);

    setFormData((current) => ({
      ...current,
      slug: createSlug(
        event.target.value
      ),
    }));

    setMessage("");
  };

  const handleCategoryToggle = (
    categoryId
  ) => {
    setMessage("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!canSubmit) {
      setMessage(
        "Product name, slug and price are required."
      );
      return;
    }

    const basePrice = Number(
      formData.basePrice
    );

    const compareAtPrice =
      formData.compareAtPrice === ""
        ? null
        : Number(formData.compareAtPrice);

    if (
      Number.isNaN(basePrice) ||
      basePrice < 0
    ) {
      setMessage(
        "Please enter a valid product price."
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
    setMessage("");

    try {
      const productInsert = {
        name: formData.name.trim(),
        slug: createSlug(
          formData.slug
        ),

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
        is_featured: formData.featured,
        is_new_arrival:
          formData.isNewArrival,
        is_bestseller:
          formData.isBestseller,

        featured_position: 0,
        new_arrival_position: 0,
        bestseller_position: 0,

        seo_title:
          formData.seoTitle.trim() ||
          null,

        seo_description:
          formData.seoDescription.trim() ||
          null,

        created_by: user?.id || null,

        published_at:
          formData.status === "active"
            ? new Date().toISOString()
            : null,
      };

      const {
        data: createdProduct,
        error,
      } = await supabase
        .from("products")
        .insert(productInsert)
        .select("id, name, slug")
        .single();

      if (error) {
        if (
          error.code === "23505"
        ) {
          throw new Error(
            "A product with this slug already exists."
          );
        }

        throw error;
      }

      if (
        selectedCategoryIds.length > 0
      ) {
        const categoryRows =
          selectedCategoryIds.map(
            (categoryId) => ({
              product_id:
                createdProduct.id,
              category_id:
                categoryId,
            })
          );

        const {
          error: categoryError,
        } = await supabase
          .from("product_categories")
          .insert(categoryRows);

        if (categoryError) {
          throw categoryError;
        }
      }

      navigate(
        `/admin/products/${createdProduct.id}`,
        {
          replace: true,
          state: {
            message: `${createdProduct.name} was created successfully. You can now add colours, sizes, images and inventory.`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Product creation failed:",
        error
      );

      setMessage(
        error.message ||
          "The product could not be created."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="mt-7 border-b border-black/10 pb-8">
        <p className="text-[8px] uppercase tracking-[0.27em] text-[#786d65]">
          Catalogue
        </p>

        <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[55px]">
          Add Product
        </h1>

        <p className="mt-4 text-[11px] text-[#71665e]">
          Create the basic product information first.
          Colours, images and inventory will be added next.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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

              {categoriesLoading ? (
                <p className="mt-5 text-[9px] text-[#786d65]">
                  Loading categories...
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
              Active products can later appear on the storefront. Draft products remain visible only to administrators.
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
            type="submit"
            disabled={
              isSubmitting ||
              !canSubmit
            }
            className="flex min-h-13 w-full items-center justify-center gap-2 bg-[#211c18] px-6 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={14}
              strokeWidth={1.4}
            />

            {isSubmitting
              ? "Creating Product..."
              : "Create Product"}
          </button>

          {message && (
            <p className="border border-[#9b493f]/20 bg-[#9b493f]/5 p-4 text-[9px] leading-5 text-[#9b493f]">
              {message}
            </p>
          )}
        </aside>
      </form>
    </>
  );
}