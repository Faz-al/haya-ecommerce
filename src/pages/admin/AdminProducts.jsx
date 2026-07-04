import {
  Boxes,
  Copy,
  ImageOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

function formatStatus(status) {
  return String(status || "draft")
    .replaceAll("_", " ")
    .toUpperCase();
}

function createCopySlug(slug) {
  const cleanSlug = String(slug || "product")
    .trim()
    .toLowerCase()
    .replace(/-copy-\d+$/, "");

  return `${cleanSlug}-copy-${Date.now()}`;
}

function removeSystemFields(row) {
  const clean = { ...(row || {}) };

  delete clean.id;
  delete clean.created_at;
  delete clean.updated_at;

  return clean;
}

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [duplicatingId, setDuplicatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            status,
            base_price,
            compare_at_price,
            currency,
            featured,
            is_featured,
            is_new_arrival,
            is_bestseller,
            created_at,
            product_categories (
              category_id,
              categories (
                id,
                name,
                slug,
                parent_id,
                is_active,
                position
              )
            ),
            product_images (
              id,
              public_url,
              alt_text,
              position,
              is_primary
            ),
            product_variants (
              id,
              stock_quantity,
              is_active
            )
          `)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select("id, name, slug, parent_id, is_active, position")
          .eq("is_active", true)
          .order("position", {
            ascending: true,
          }),
      ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error) {
      console.error("Failed to load admin products:", error);

      setErrorMessage(error.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const productCategories =
        product.product_categories
          ?.map((row) => row.categories)
          .filter(Boolean) || [];

      const categoryIds = productCategories.map((category) => category.id);

      const searchableText = [
        product.name,
        product.slug,
        product.status,
        ...productCategories.map((category) => category.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatches = !query || searchableText.includes(query);

      const categoryMatches =
        categoryFilter === "all" || categoryIds.includes(categoryFilter);

      const statusMatches =
        statusFilter === "all" || product.status === statusFilter;

      return searchMatches && categoryMatches && statusMatches;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const statusOptions = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.status)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const handleDuplicateProduct = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      "Duplicate this product as a draft? You can edit it afterwards."
    );

    if (!confirmed) return;

    setDuplicatingId(productId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const newProductPayload = {
        ...removeSystemFields(product),
        name: `${product.name} Copy`,
        slug: createCopySlug(product.slug),
        status: "draft",
        published_at: null,
      };

      const { data: newProduct, error: newProductError } = await supabase
        .from("products")
        .insert(newProductPayload)
        .select("id")
        .single();

      if (newProductError) throw newProductError;

      const newProductId = newProduct.id;

      const [
        categoriesResult,
        colorsResult,
        variantsResult,
        imagesResult,
      ] = await Promise.all([
        supabase
          .from("product_categories")
          .select("*")
          .eq("product_id", productId),

        supabase
          .from("product_colors")
          .select("*")
          .eq("product_id", productId)
          .order("position", {
            ascending: true,
          }),

        supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("position", {
            ascending: true,
          }),

        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("position", {
            ascending: true,
          }),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (colorsResult.error) throw colorsResult.error;
      if (variantsResult.error) throw variantsResult.error;
      if (imagesResult.error) throw imagesResult.error;

      const categoryRows =
        categoriesResult.data?.map((row) => ({
          product_id: newProductId,
          category_id: row.category_id,
        })) || [];

      if (categoryRows.length > 0) {
        const { error } = await supabase
          .from("product_categories")
          .insert(categoryRows);

        if (error) throw error;
      }

      const colorIdMap = {};

      for (const color of colorsResult.data || []) {
        const oldColorId = color.id;

        const colorPayload = {
          ...removeSystemFields(color),
          product_id: newProductId,
        };

        const { data: newColor, error } = await supabase
          .from("product_colors")
          .insert(colorPayload)
          .select("id")
          .single();

        if (error) throw error;

        colorIdMap[oldColorId] = newColor.id;
      }

      const variantRows =
        variantsResult.data?.map((variant) => {
          const oldColorId = variant.color_id;

          return {
            ...removeSystemFields(variant),
            product_id: newProductId,
            color_id: oldColorId ? colorIdMap[oldColorId] || null : null,
            sku: variant.sku ? `${variant.sku}-COPY-${Date.now()}` : null,
          };
        }) || [];

      if (variantRows.length > 0) {
        const { error } = await supabase
          .from("product_variants")
          .insert(variantRows);

        if (error) throw error;
      }

      const imageRows =
        imagesResult.data?.map((image) => ({
          ...removeSystemFields(image),
          product_id: newProductId,
        })) || [];

      if (imageRows.length > 0) {
        const { error } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (error) throw error;
      }

      setSuccessMessage("Product duplicated as a draft.");
      await fetchProducts();

      navigate(`/admin/products/${newProductId}`);
    } catch (error) {
      console.error("Failed to duplicate product:", error);

      setErrorMessage(error.message || "Unable to duplicate product.");
    } finally {
      setDuplicatingId("");
    }
  };

  const handleDeleteProduct = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const productName = product?.name || "this product";

    const confirmed = window.confirm(
      `Delete "${productName}" permanently?\n\nThis will remove the product, variants, colours, category connections and image records from the database. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const deleteSteps = [
        supabase
          .from("product_categories")
          .delete()
          .eq("product_id", product.id),

        supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id),

        supabase
          .from("product_variants")
          .delete()
          .eq("product_id", product.id),

        supabase
          .from("product_colors")
          .delete()
          .eq("product_id", product.id),
      ];

      for (const step of deleteSteps) {
        const { error } = await step;

        if (error) {
          throw error;
        }
      }

      const { error: productDeleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (productDeleteError) {
        throw productDeleteError;
      }

      setSuccessMessage(`"${productName}" deleted permanently.`);

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);

      setErrorMessage(error.message || "Unable to delete product.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.27em] text-[#786d65]">
            Catalogue
          </p>

          <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[55px]">
            Products
          </h1>

          <p className="mt-4 text-[11px] text-[#71665e]">
            Search, filter, duplicate, delete and manage Haya products.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="flex min-h-12 items-center justify-center gap-2 border border-black/15 px-6 text-[8px] uppercase tracking-[0.18em] transition hover:bg-white disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.4}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/admin/products/new"
            className="flex min-h-12 items-center justify-center gap-2 bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
          >
            <Plus size={14} strokeWidth={1.4} />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-3 border-b border-black/10 pb-7 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_240px_190px]">
        <label className="relative block">
          <Search
            size={15}
            strokeWidth={1.4}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756a62]"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search product name, slug or category"
            className="h-12 w-full border border-black/10 bg-[#eee7df] pl-11 pr-4 text-[10px] outline-none placeholder:text-[#8a7f76] focus:border-black/25"
          />
        </label>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-12 border border-black/10 bg-[#eee7df] px-4 text-[10px] outline-none focus:border-black/25"
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-12 border border-black/10 bg-[#eee7df] px-4 text-[10px] outline-none focus:border-black/25"
        >
          <option value="all">All Statuses</option>

          {statusOptions.map((status) => (
            <option
              key={status}
              value={status}
            >
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {successMessage && (
        <div className="mt-5 border border-green-900/15 bg-green-50 px-4 py-3 text-[10px] text-green-900">
          {successMessage}
        </div>
      )}

      {errorMessage && !loading && (
        <div className="mt-5 border border-red-900/15 bg-red-50 px-4 py-3 text-[10px] text-red-900">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <span className="mx-auto block h-10 w-10 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />

            <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#71665e]">
              Loading products
            </p>
          </div>
        </div>
      ) : errorMessage && products.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center text-center">
          <div className="max-w-md">
            <Boxes
              size={32}
              strokeWidth={1.2}
              className="mx-auto"
            />

            <h2 className="mt-5 font-serif text-[34px] tracking-[-0.03em]">
              Products unavailable
            </h2>

            <p className="mt-4 text-[11px] leading-6 text-[#71665e]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.2em] text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center border-b border-black/10 text-center">
          <div className="max-w-md">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/10">
              <Boxes size={25} strokeWidth={1.2} />
            </span>

            <h2 className="mt-6 font-serif text-[34px] tracking-[-0.03em]">
              No products yet
            </h2>

            <p className="mt-4 text-[11px] leading-6 text-[#71665e]">
              Create your first Haya product and upload its images, pricing,
              colours, sizes and inventory.
            </p>

            <Link
              to="/admin/products/new"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 bg-[#211c18] px-8 text-[8px] uppercase tracking-[0.2em] text-white"
            >
              <Plus size={14} strokeWidth={1.4} />
              Create First Product
            </Link>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex min-h-[360px] items-center justify-center text-center">
          <div className="max-w-md">
            <h2 className="font-serif text-[32px] tracking-[-0.03em]">
              No matching products
            </h2>

            <p className="mt-3 text-[11px] leading-6 text-[#71665e]">
              Try clearing the search or changing the category/status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="mt-6 border-b border-black pb-1 text-[8px] uppercase tracking-[0.18em]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const sortedImages = [...(product.product_images || [])].sort(
              (a, b) => (a.position || 0) - (b.position || 0)
            );

            const primaryImage =
              sortedImages.find((image) => image.is_primary) ||
              sortedImages[0];

            const activeVariants =
              product.product_variants?.filter(
                (variant) => variant.is_active
              ) || [];

            const totalStock = activeVariants.reduce(
              (total, variant) =>
                total + (Number(variant.stock_quantity) || 0),
              0
            );

            const productCategories =
              product.product_categories
                ?.map((row) => row.categories)
                .filter((category) => category && category.is_active)
                .sort((a, b) => (a.position || 0) - (b.position || 0)) || [];

            const placementBadges = [];

            if (product.is_featured || product.featured) {
              placementBadges.push("Featured");
            }

            if (product.is_new_arrival) {
              placementBadges.push("New Arrival");
            }

            if (product.is_bestseller) {
              placementBadges.push("Bestseller");
            }

            const isDuplicating = duplicatingId === product.id;
            const isDeleting = deletingId === product.id;

            return (
              <Link
                key={product.id}
                to={`/admin/products/${product.id}`}
                className="group grid gap-4 border border-black/10 bg-[#eee7df] p-4 transition hover:bg-white/60 sm:grid-cols-[105px_minmax(0,1fr)]"
              >
                <div className="h-[260px] w-full overflow-hidden bg-[#ddd4cc] sm:h-[140px] sm:w-[105px] sm:shrink-0">
                  {primaryImage?.public_url ? (
                    <img
                      src={primaryImage.public_url}
                      alt={primaryImage.alt_text || product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#81766e]">
                      <ImageOff
                        size={21}
                        strokeWidth={1.2}
                      />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] uppercase tracking-[0.12em]">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#786d65]">
                        /{product.slug}
                      </p>
                    </div>

                    <span className="shrink-0 bg-[#e3ddd5] px-2.5 py-1.5 text-[7px] uppercase tracking-[0.14em]">
                      {formatStatus(product.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {productCategories.length > 0 ? (
                      <>
                        {productCategories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="bg-[#f5f1ec] px-2 py-1 text-[7px] uppercase tracking-[0.13em] text-[#3a332e]"
                          >
                            {category.name}
                          </span>
                        ))}

                        {productCategories.length > 2 && (
                          <span className="bg-[#f5f1ec] px-2 py-1 text-[7px] uppercase tracking-[0.13em] text-[#3a332e]">
                            +{productCategories.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[8px] text-[#8a7f76]">
                        No category
                      </span>
                    )}
                  </div>

                  {placementBadges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {placementBadges.map((badge) => (
                        <span
                          key={badge}
                          className="bg-[#211c18] px-2 py-1 text-[7px] uppercase tracking-[0.13em] text-white"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    <div className="grid grid-cols-2 gap-3 text-[9px] text-[#71665e]">
                      <div>
                        <p className="text-[7px] uppercase tracking-[0.17em]">
                          Stock
                        </p>

                        <p className="mt-1 text-[10px] text-[#211c18]">
                          {totalStock}
                        </p>
                      </div>

                      <div>
                        <p className="text-[7px] uppercase tracking-[0.17em]">
                          Variants
                        </p>

                        <p className="mt-1 text-[10px] text-[#211c18]">
                          {activeVariants.length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                      <p className="text-[11px]">
                        {formatCurrency(product.base_price, product.currency)}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(event) =>
                            handleDuplicateProduct(event, product.id)
                          }
                          disabled={isDuplicating || isDeleting}
                         className="flex h-9 min-w-0 items-center justify-center gap-1 border border-black/15 px-2 text-[7px] uppercase tracking-[0.12em] transition hover:bg-white disabled:opacity-50"
                        >
                          <Copy
                            size={12}
                            strokeWidth={1.3}
                          />

                          {isDuplicating ? "Copying" : "Duplicate"}
                        </button>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleDeleteProduct(event, product)
                          }
                          disabled={isDeleting || isDuplicating}
                          className="flex h-9 min-w-0 items-center justify-center gap-1 border border-red-900/20 px-2 text-[7px] uppercase tracking-[0.12em] text-red-900 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2
                            size={12}
                            strokeWidth={1.3}
                          />

                          {isDeleting ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}