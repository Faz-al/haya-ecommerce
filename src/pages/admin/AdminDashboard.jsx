import {
  AlertTriangle,
  Boxes,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

function formatStatus(status) {
  return String(status || "pending")
    .replaceAll("_", " ")
    .toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [productsResult, ordersResult] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            status,
            base_price,
            currency,
            product_images (
              id,
              public_url,
              position,
              is_primary
            ),
            product_variants (
              id,
              sku,
              size,
              stock_quantity,
              is_active
            )
          `)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("orders")
          .select(`
            id,
            order_number,
            status,
            payment_status,
            fulfillment_status,
            total,
            currency,
            customer_email,
            email,
            created_at
          `)
          .order("created_at", {
            ascending: false,
          })
          .limit(8),
      ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      setProducts(productsResult.data || []);
      setOrders(ordersResult.data || []);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);

      setErrorMessage(
        error.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const dashboardStats = useMemo(() => {
    const activeProducts = products.filter(
      (product) => product.status === "active"
    );

    const draftProducts = products.filter(
      (product) => product.status === "draft"
    );

    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.status)
    );

    const revenue = orders
      .filter((order) =>
        ["paid", "authorized"].includes(order.payment_status)
      )
      .reduce(
        (total, order) => total + (Number(order.total) || 0),
        0
      );

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      draftProducts: draftProducts.length,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      revenue,
    };
  }, [orders, products]);

  const lowStockProducts = useMemo(() => {
    return products
      .map((product) => {
        const activeVariants =
          product.product_variants?.filter(
            (variant) => variant.is_active
          ) || [];

        const totalStock = activeVariants.reduce(
          (total, variant) =>
            total + (Number(variant.stock_quantity) || 0),
          0
        );

        const primaryImage =
          product.product_images?.find((image) => image.is_primary) ||
          [...(product.product_images || [])].sort(
            (a, b) => (a.position || 0) - (b.position || 0)
          )[0];

        return {
          ...product,
          totalStock,
          activeVariantCount: activeVariants.length,
          image: primaryImage?.public_url || "",
        };
      })
      .filter(
        (product) =>
          product.status === "active" &&
          product.activeVariantCount > 0 &&
          product.totalStock <= 5
      )
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 5);
  }, [products]);

  return (
    <>
      <div className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.27em] text-[#786d65]">
            Store Management
          </p>

          <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[55px]">
            Dashboard
          </h1>

          <p className="mt-4 text-[11px] text-[#71665e]">
            Manage Haya products, orders and store operations.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/products"
            className="flex min-h-12 items-center justify-center border border-black/15 px-6 text-[8px] uppercase tracking-[0.18em] transition hover:bg-white"
          >
            Products
          </Link>

          <Link
            to="/admin/products/new"
            className="flex min-h-12 items-center justify-center gap-2 bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
          >
            <Plus size={14} strokeWidth={1.4} />
            Add Product
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 border border-red-900/15 bg-red-50 px-4 py-3 text-[10px] text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-black/10 bg-[#e9e2da] p-5 sm:p-6">
          <Package size={19} strokeWidth={1.3} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Total Orders
          </p>

          <p className="mt-2 font-serif text-[34px]">
            {loading ? "—" : dashboardStats.totalOrders}
          </p>

          <p className="mt-2 text-[9px] text-[#71665e]">
            Recent orders loaded
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5 sm:p-6">
          <ShoppingBag size={19} strokeWidth={1.3} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Pending Orders
          </p>

          <p className="mt-2 font-serif text-[34px]">
            {loading ? "—" : dashboardStats.pendingOrders}
          </p>

          <p className="mt-2 text-[9px] text-[#71665e]">
            Pending / confirmed / processing
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5 sm:p-6">
          <Boxes size={19} strokeWidth={1.3} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Products
          </p>

          <p className="mt-2 font-serif text-[34px]">
            {loading ? "—" : dashboardStats.totalProducts}
          </p>

          <p className="mt-2 text-[9px] text-[#71665e]">
            {loading
              ? "Loading catalogue"
              : `${dashboardStats.activeProducts} active / ${dashboardStats.draftProducts} draft`}
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5 sm:p-6">
          <TrendingUp size={19} strokeWidth={1.3} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Paid Revenue
          </p>

          <p className="mt-2 font-serif text-[28px] sm:text-[34px]">
            {loading
              ? "—"
              : formatCurrency(dashboardStats.revenue, "INR")}
          </p>

          <p className="mt-2 text-[9px] text-[#71665e]">
            From paid / authorized orders
          </p>
        </article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
                Recent Orders
              </p>

              <h2 className="mt-2 font-serif text-[30px] tracking-[-0.03em]">
                Latest activity
              </h2>
            </div>

            <Link
              to="/admin/orders"
              className="w-fit text-[8px] uppercase tracking-[0.18em] underline underline-offset-4"
            >
              View All Orders
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <span className="block h-9 w-9 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <ShoppingBag size={28} strokeWidth={1.2} />

              <h3 className="mt-5 font-serif text-[28px] tracking-[-0.03em]">
                No orders yet
              </h3>

              <p className="mt-3 max-w-md text-[11px] leading-6 text-[#71665e]">
                New customer orders will appear here once checkout starts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {orders.slice(0, 6).map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="grid gap-3 py-5 transition hover:bg-white/40 sm:grid-cols-[1fr_120px_120px] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] uppercase tracking-[0.13em]">
                      {order.order_number || order.id}
                    </p>

                    <p className="mt-2 truncate text-[9px] text-[#71665e]">
                      {order.customer_email || order.email || "No email"} ·{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:block">
                    <span className="inline-flex bg-[#f5f1ec] px-2.5 py-1.5 text-[7px] uppercase tracking-[0.13em]">
                      {formatStatus(order.status)}
                    </span>

                    <span className="inline-flex bg-[#f5f1ec] px-2.5 py-1.5 text-[7px] uppercase tracking-[0.13em] sm:mt-2">
                      {formatStatus(order.payment_status)}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-right">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="border border-black/10 bg-[#e9e2da] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#786d65]">
                Inventory Watch
              </p>

              <h2 className="mt-2 font-serif text-[30px] tracking-[-0.03em]">
                Low stock
              </h2>
            </div>

            <AlertTriangle size={20} strokeWidth={1.3} />
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <span className="block h-9 w-9 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <Boxes size={28} strokeWidth={1.2} />

              <h3 className="mt-5 font-serif text-[27px] tracking-[-0.03em]">
                Stock looks okay
              </h3>

              <p className="mt-3 max-w-sm text-[11px] leading-6 text-[#71665e]">
                Products with 5 or fewer units will show here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/admin/products/${product.id}`}
                  className="flex gap-4 py-4 transition hover:bg-white/40"
                >
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#ddd4cc]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#81766e]">
                        <Boxes size={17} strokeWidth={1.2} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] uppercase tracking-[0.12em]">
                      {product.name}
                    </p>

                    <p className="mt-2 text-[9px] text-[#71665e]">
                      /{product.slug}
                    </p>

                    <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-red-900">
                      {product.totalStock} left
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/products/new"
          className="border border-black/10 bg-[#211c18] p-5 text-white transition hover:bg-black"
        >
          <Plus size={18} strokeWidth={1.4} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-white/65">
            Quick Action
          </p>

          <h3 className="mt-2 font-serif text-[25px] tracking-[-0.03em]">
            Add product
          </h3>
        </Link>

        <Link
          to="/admin/products"
          className="border border-black/10 bg-[#e9e2da] p-5 transition hover:bg-white/60"
        >
          <Boxes size={18} strokeWidth={1.4} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Catalogue
          </p>

          <h3 className="mt-2 font-serif text-[25px] tracking-[-0.03em]">
            Manage products
          </h3>
        </Link>

        <Link
          to="/admin/orders"
          className="border border-black/10 bg-[#e9e2da] p-5 transition hover:bg-white/60"
        >
          <ShoppingBag size={18} strokeWidth={1.4} />

          <p className="mt-5 text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
            Orders
          </p>

          <h3 className="mt-2 font-serif text-[25px] tracking-[-0.03em]">
            View orders
          </h3>
        </Link>
      </section>
    </>
  );
}