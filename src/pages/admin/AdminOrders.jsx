import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ChevronRight,
  LoaderCircle,
  PackageSearch,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";

const ORDER_STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUS_OPTIONS = [
  "all",
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

const FULFILLMENT_STATUS_OPTIONS = [
  "all",
  "unfulfilled",
  "processing",
  "partially_fulfilled",
  "fulfilled",
  "cancelled",
];

function formatCurrency(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  switch (status) {
    case "delivered":
    case "paid":
    case "fulfilled":
      return "bg-[#dce8dc] text-[#355b39]";

    case "confirmed":
    case "processing":
    case "authorized":
    case "partially_fulfilled":
      return "bg-[#e8e1ce] text-[#6d5a27]";

    case "shipped":
      return "bg-[#dce5ea] text-[#35576a]";

    case "cancelled":
    case "failed":
    case "refunded":
    case "partially_refunded":
      return "bg-[#ead8d5] text-[#7d3932]";

    case "pending":
    case "unfulfilled":
    default:
      return "bg-black/[0.06] text-[#655c55]";
  }
}

function StatusBadge({ value }) {
  return (
    <span
      className={[
        "inline-flex max-w-full rounded-full px-2 py-1",
        "truncate whitespace-nowrap text-[6px] uppercase tracking-[0.1em]",
        "sm:px-2.5 sm:text-[7px] sm:tracking-[0.13em]",
        getStatusClass(value),
      ].join(" ")}
    >
      {formatStatus(value)}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [deleteTargetOrder, setDeleteTargetOrder] = useState(null);
const [deleteModalError, setDeleteModalError] = useState("");

  const loadOrders = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");
      setSuccessMessage("");

      try {
        let query = supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              user_id,
              customer_name,
              customer_email,
              email,
              customer_phone,
              status,
              payment_status,
              fulfillment_status,
              subtotal,
              shipping_cost,
              discount_amount,
              total,
              currency,
              item_count,
              delivery_method,
              created_at,
              updated_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (orderStatus !== "all") {
          query = query.eq("status", orderStatus);
        }

        if (paymentStatus !== "all") {
          query = query.eq("payment_status", paymentStatus);
        }

        if (fulfillmentStatus !== "all") {
          query = query.eq("fulfillment_status", fulfillmentStatus);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setOrders(data ?? []);
      } catch (error) {
        console.error("Failed to load admin orders:", error);

        setErrorMessage(
          error.message || "Orders could not be loaded."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderStatus, paymentStatus, fulfillmentStatus]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) => {
      const searchableValues = [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.email,
        order.customer_phone,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [orders, searchTerm]);

  const summary = useMemo(() => {
    return orders.reduce(
      (totals, order) => {
        totals.totalOrders += 1;
        totals.revenue += Number(order.total ?? 0);

        if (order.status === "pending") {
          totals.pending += 1;
        }

        if (order.fulfillment_status === "unfulfilled") {
          totals.unfulfilled += 1;
        }

        return totals;
      },
      {
        totalOrders: 0,
        revenue: 0,
        pending: 0,
        unfulfilled: 0,
      }
    );
  }, [orders]);

 const handleDeleteOrder = (event, order) => {
  event.preventDefault();
  event.stopPropagation();

  setDeleteTargetOrder(order);
  setDeleteModalError("");
  setErrorMessage("");
  setSuccessMessage("");
};

const confirmDeleteOrder = async () => {
  if (!deleteTargetOrder) return;

  const order = deleteTargetOrder;
  const orderLabel = order.order_number || "this order";

  setDeletingOrderId(order.id);
  setDeleteModalError("");
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const { data, error } = await supabase.rpc("admin_delete_order", {
      p_order_id: order.id,
    });

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.message || "The order could not be deleted."
      );
    }

    setOrders((currentOrders) =>
      currentOrders.filter((currentOrder) => currentOrder.id !== order.id)
    );

    setSuccessMessage(`${orderLabel} was deleted permanently.`);
    setDeleteTargetOrder(null);
  } catch (error) {
    console.error("Failed to delete order:", error);

    setDeleteModalError(
      error.message || "The order could not be deleted."
    );
  } finally {
    setDeletingOrderId("");
  }
};

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.23em] text-[#756a62]">
            Order Management
          </p>

          <h1 className="mt-3 font-serif text-[38px] tracking-[-0.04em] sm:text-[48px]">
            Orders
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-6 text-[#766b63]">
            Review customer orders, payment states, fulfilment progress and
            delivery details. Test orders can be permanently deleted.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadOrders({
              refresh: true,
            })
          }
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 border border-black/15 px-4 py-3 text-[8px] uppercase tracking-[0.16em] transition hover:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            strokeWidth={1.4}
            className={isRefreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-black/10 bg-[#e9e2da] p-5">
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#776c64]">
            Total Orders
          </p>

          <p className="mt-3 font-serif text-[30px]">
            {summary.totalOrders}
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5">
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#776c64]">
            Order Value
          </p>

          <p className="mt-3 font-serif text-[25px]">
            {formatCurrency(summary.revenue)}
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5">
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#776c64]">
            Pending Orders
          </p>

          <p className="mt-3 font-serif text-[30px]">
            {summary.pending}
          </p>
        </article>

        <article className="border border-black/10 bg-[#e9e2da] p-5">
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#776c64]">
            Unfulfilled
          </p>

          <p className="mt-3 font-serif text-[30px]">
            {summary.unfulfilled}
          </p>
        </article>
      </section>

      <section className="mt-8 border border-black/10 bg-[#ebe5de] p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_190px_210px]">
          <label className="relative block">
            <Search
              size={15}
              strokeWidth={1.4}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7d726a]"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search order number, customer, email or phone"
              className="h-12 w-full border border-black/10 bg-[#f4f0eb] pl-11 pr-4 text-[10px] outline-none transition placeholder:text-[#938980] focus:border-black/40"
            />
          </label>

          <select
            value={orderStatus}
            onChange={(event) => setOrderStatus(event.target.value)}
            className="h-12 border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40"
          >
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                Order: {formatStatus(status)}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="h-12 border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40"
          >
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                Payment: {formatStatus(status)}
              </option>
            ))}
          </select>

          <select
            value={fulfillmentStatus}
            onChange={(event) => setFulfillmentStatus(event.target.value)}
            className="h-12 border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40"
          >
            {FULFILLMENT_STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                Fulfilment: {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {successMessage && (
        <div className="mt-5 border border-[#5f7a5f]/20 bg-[#dde8dc] p-4 text-[10px] leading-5 text-[#355b39]">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={28}
              strokeWidth={1.2}
              className="mx-auto animate-spin"
            />

            <p className="mt-4 text-[8px] uppercase tracking-[0.18em] text-[#766b63]">
              Loading Orders
            </p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="mt-8 border border-[#9b493f]/20 bg-[#eadbd7] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              strokeWidth={1.4}
              className="mt-0.5 shrink-0 text-[#8c443b]"
            />

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#7d3932]">
                Orders Could Not Load
              </p>

              <p className="mt-2 text-[10px] leading-6 text-[#7d4b45]">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-8 flex min-h-[320px] items-center justify-center border border-black/10 bg-[#ebe5de] p-8 text-center">
          <div>
            <PackageSearch
              size={32}
              strokeWidth={1.1}
              className="mx-auto text-[#71675f]"
            />

            <h2 className="mt-5 font-serif text-[27px]">
              No orders found
            </h2>

            <p className="mt-3 text-[10px] leading-6 text-[#766b63]">
              Try changing the search or status filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden border border-black/10 bg-[#eee8e1]">
  {/* Desktop table headings */}
  <div className="hidden grid-cols-[1.1fr_1.25fr_0.85fr_0.9fr_0.9fr_0.7fr_110px] gap-4 border-b border-black/10 bg-[#e4ddd5] px-5 py-4 text-[7px] uppercase tracking-[0.16em] text-[#756a62] xl:grid">
    <span>Order</span>
    <span>Customer</span>
    <span>Order Status</span>
    <span>Payment</span>
    <span>Fulfilment</span>
    <span>Total</span>
    <span>Actions</span>
  </div>

  <div className="divide-y divide-black/[0.08]">
    {filteredOrders.map((order) => {
      const customerEmail =
        order.customer_email ||
        order.email ||
        "No email";

      const isDeleting =
        deletingOrderId ===
        order.id;

      return (
        <Link
          key={order.id}
          to={`/admin/orders/${order.id}`}
          className="group block px-4 py-4 transition hover:bg-black/[0.025] sm:px-5 xl:grid xl:grid-cols-[1.1fr_1.25fr_0.85fr_0.9fr_0.9fr_0.7fr_110px] xl:items-center xl:gap-4 xl:py-5"
        >
          {/* Compact mobile/tablet layout */}
          <div className="xl:contents">
            <div className="flex items-start justify-between gap-4 xl:block">
              <div className="min-w-0">
                <p className="truncate text-[9px] uppercase tracking-[0.12em]">
                  {order.order_number ||
                    "Order"}
                </p>

                <p className="mt-1.5 text-[8px] text-[#7a7068]">
                  {formatDate(
                    order.created_at
                  )}
                </p>

                <p className="mt-1 text-[8px] text-[#7a7068]">
                  {Number(
                    order.item_count
                  ) || 0}{" "}
                  {Number(
                    order.item_count
                  ) === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <div className="shrink-0 text-right xl:hidden">
                <p className="text-[11px]">
                  {formatCurrency(
                    order.total,
                    order.currency
                  )}
                </p>

                <ChevronRight
                  size={16}
                  strokeWidth={1.3}
                  className="ml-auto mt-2 text-[#776c64]"
                />
              </div>
            </div>

            <div className="mt-3 min-w-0 border-t border-black/[0.06] pt-3 xl:mt-0 xl:border-0 xl:pt-0">
              <p className="truncate text-[9px]">
                {order.customer_name ||
                  "Customer"}
              </p>

              <p className="mt-1 truncate text-[8px] text-[#7a7068]">
                {customerEmail}
              </p>

              {order.customer_phone && (
                <p className="mt-1 hidden truncate text-[8px] text-[#7a7068] sm:block">
                  {
                    order.customer_phone
                  }
                </p>
              )}
            </div>

            {/* Mobile status row */}
            <div className="mt-3 grid grid-cols-3 gap-2 xl:contents">
              <div className="min-w-0">
                <p className="mb-1.5 text-[6px] uppercase tracking-[0.12em] text-[#81766e] xl:hidden">
                  Order
                </p>

                <StatusBadge
                  value={
                    order.status
                  }
                />
              </div>

              <div className="min-w-0">
                <p className="mb-1.5 text-[6px] uppercase tracking-[0.12em] text-[#81766e] xl:hidden">
                  Payment
                </p>

                <StatusBadge
                  value={
                    order.payment_status
                  }
                />
              </div>

              <div className="min-w-0">
                <p className="mb-1.5 text-[6px] uppercase tracking-[0.12em] text-[#81766e] xl:hidden">
                  Fulfilment
                </p>

                <StatusBadge
                  value={
                    order.fulfillment_status
                  }
                />
              </div>
            </div>

            {/* Desktop total */}
            <div className="hidden xl:block">
              <p className="text-[10px]">
                {formatCurrency(
                  order.total,
                  order.currency
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/[0.06] pt-3 xl:mt-0 xl:border-0 xl:pt-0">
              <button
                type="button"
                onClick={(event) =>
                  handleDeleteOrder(
                    event,
                    order
                  )
                }
                disabled={isDeleting}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 border border-red-900/20 px-3 text-[7px] uppercase tracking-[0.14em] text-red-900 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <LoaderCircle
                    size={12}
                    strokeWidth={1.4}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={12}
                    strokeWidth={1.4}
                  />
                )}

                {isDeleting
                  ? "Deleting"
                  : "Delete"}
              </button>

              <ChevronRight
                size={17}
                strokeWidth={1.3}
                className="hidden text-[#776c64] transition group-hover:translate-x-1 xl:block"
              />
            </div>
          </div>
        </Link>
      );
    })}
  </div>
</div>
      )}


      {deleteTargetOrder && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4">
    <div className="w-full max-w-[460px] border border-black/10 bg-[#f2eee9] p-6 shadow-2xl sm:p-8">
      <p className="text-[8px] uppercase tracking-[0.22em] text-[#8c443b]">
        Confirm Delete
      </p>

      <h2 className="mt-4 font-serif text-[32px] leading-tight tracking-[-0.03em]">
        Delete this order?
      </h2>

      <p className="mt-4 text-[10px] leading-6 text-[#6f655d]">
        This will permanently remove{" "}
        <span className="font-medium text-[#211c18]">
          {deleteTargetOrder.order_number || "this order"}
        </span>{" "}
        and all its order items from the database. This action cannot be undone.
      </p>

      {deleteModalError && (
        <p className="mt-5 border border-[#9b493f]/20 bg-[#9b493f]/5 p-4 text-[9px] leading-5 text-[#9b493f]">
          {deleteModalError}
        </p>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            if (deletingOrderId) return;

            setDeleteTargetOrder(null);
            setDeleteModalError("");
          }}
          disabled={Boolean(deletingOrderId)}
          className="border border-black/15 px-6 py-4 text-[8px] uppercase tracking-[0.17em] transition hover:border-black/40 disabled:opacity-50"
        >
          Keep Order
        </button>

        <button
          type="button"
          onClick={confirmDeleteOrder}
          disabled={Boolean(deletingOrderId)}
          className="bg-[#8c443b] px-6 py-4 text-[8px] uppercase tracking-[0.17em] text-white transition hover:bg-[#75372f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deletingOrderId ? "Deleting..." : "Delete Permanently"}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}