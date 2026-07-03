import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUS_OPTIONS = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

const FULFILLMENT_STATUS_OPTIONS = [
  "unfulfilled",
  "processing",
  "partially_fulfilled",
  "fulfilled",
  "cancelled",
];

function formatCurrency(
  value,
  currency = "INR"
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(date);
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
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
        "inline-flex rounded-full px-3 py-1.5",
        "text-[7px] uppercase tracking-[0.14em]",
        getStatusClass(value),
      ].join(" ")}
    >
      {formatStatus(value)}
    </span>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-black/[0.07] py-3 last:border-b-0">
      <span className="text-[8px] uppercase tracking-[0.14em] text-[#756b63]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-[10px] leading-5">
        {value || "—"}
      </span>
    </div>
  );
}

export default function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] =
    useState(null);

  const [
    orderStatus,
    setOrderStatus,
  ] = useState("pending");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("pending");

  const [
    fulfillmentStatus,
    setFulfillmentStatus,
  ] = useState("unfulfilled");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

    const [
  showCancelConfirm,
  setShowCancelConfirm,
] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadOrder = useCallback(
    async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("orders")
          .select(
            `
              id,
              user_id,
              order_number,
              status,
              payment_status,
              fulfillment_status,
              email,
              customer_email,
              customer_name,
              customer_phone,
              shipping_address,
              delivery_method,
              subtotal,
              shipping_cost,
              discount_amount,
              total,
              currency,
              item_count,
              notes,
              created_at,
              updated_at,
stock_restored_at,
order_items (
                id,
                product_id,
                variant_id,
                product_name,
                variant_title,
                sku,
                image_url,
                quantity,
                unit_price,
                line_total
              )
            `
          )
          .eq("id", orderId)
          .single();

        if (error) {
          throw error;
        }

        setOrder(data);

        setOrderStatus(
          data.status || "pending"
        );

        setPaymentStatus(
          data.payment_status ||
            "pending"
        );

        setFulfillmentStatus(
          data.fulfillment_status ||
            "unfulfilled"
        );
      } catch (error) {
        console.error(
          "Failed to load admin order:",
          error
        );

        setErrorMessage(
          error.message ||
            "The order could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleSaveStatuses =
  async () => {
    if (!order) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_update_order_statuses",
        {
          p_order_id: order.id,
          p_status: orderStatus,
          p_payment_status:
            paymentStatus,
          p_fulfillment_status:
            fulfillmentStatus,
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(
          "The order could not be updated."
        );
      }

      setOrder((current) => ({
        ...current,
        status: data.status,
        payment_status:
          data.payment_status,
        fulfillment_status:
          data.fulfillment_status,
        stock_restored_at:
          data.stock_restored_at,
      }));

      setSuccessMessage(
        data.status === "cancelled"
          ? "Order cancelled and inventory restored successfully."
          : "Order statuses updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      );

      setErrorMessage(
        error.message ||
          "The order could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={30}
            strokeWidth={1.2}
            className="mx-auto animate-spin"
          />

          <p className="mt-4 text-[8px] uppercase tracking-[0.18em] text-[#756b63]">
            Loading Order
          </p>
        </div>
      </div>
    );
  }

  if (
    errorMessage &&
    !order
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-lg border border-[#9b493f]/20 bg-[#eadbd7] p-8 text-center">
          <AlertCircle
            size={30}
            strokeWidth={1.2}
            className="mx-auto text-[#8c443b]"
          />

          <h1 className="mt-5 font-serif text-[34px]">
            Order unavailable
          </h1>

          <p className="mt-4 text-[10px] leading-6 text-[#7d4b45]">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={loadOrder}
            className="mt-7 bg-[#211c18] px-7 py-4 text-[8px] uppercase tracking-[0.18em] text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const shippingAddress =
    order.shipping_address || {};

  const customerEmail =
    order.customer_email ||
    order.email ||
    "";

  const items =
    order.order_items || [];

    const isOrderCancelled =
  order.status === "cancelled";

const stockWasRestored =
  Boolean(order.stock_restored_at);

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#756b63] transition hover:text-[#211c18]"
      >
        <ArrowLeft
          size={13}
          strokeWidth={1.4}
        />

        Back to Orders
      </Link>

      <div className="mt-7 flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.23em] text-[#756a62]">
            Order Details
          </p>

          <h1 className="mt-3 font-serif text-[38px] tracking-[-0.04em] sm:text-[50px]">
            {order.order_number}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-[9px] text-[#756b63]">
            <CalendarDays
              size={14}
              strokeWidth={1.3}
            />

            {formatDate(
              order.created_at
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            value={order.status}
          />

          <StatusBadge
            value={
              order.payment_status
            }
          />

          <StatusBadge
            value={
              order.fulfillment_status
            }
          />
        </div>
      </div>

      {isOrderCancelled && (
  <div className="mt-6 border border-[#8c443b]/20 bg-[#eadbd7] p-5">
    <div className="flex items-start gap-3">
      <AlertCircle
        size={18}
        strokeWidth={1.4}
        className="mt-0.5 shrink-0 text-[#8c443b]"
      />

      <div>
        <p className="text-[8px] uppercase tracking-[0.18em] text-[#7d3932]">
          Order Cancelled
        </p>

        <p className="mt-2 text-[10px] leading-6 text-[#704842]">
          {stockWasRestored
            ? "The purchased inventory has been returned to stock. This order is permanently locked and cannot be reopened."
            : "This order is cancelled."}
        </p>

        {order.stock_restored_at && (
          <p className="mt-2 text-[8px] text-[#80615c]">
            Stock restored:{" "}
            {formatDate(
              order.stock_restored_at
            )}
          </p>
        )}
      </div>
    </div>
  </div>
)}

      {(errorMessage ||
        successMessage) && (
        <div
          className={[
            "mt-6 border p-4 text-[10px] leading-5",
            errorMessage
              ? "border-[#9b493f]/20 bg-[#eadbd7] text-[#7d3932]"
              : "border-[#5f7a5f]/20 bg-[#dde8dc] text-[#355b39]",
          ].join(" ")}
        >
          {errorMessage ||
            successMessage}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="overflow-hidden border border-black/10 bg-[#eee8e1]">
            <div className="flex items-center justify-between border-b border-black/10 bg-[#e4ddd5] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <ShoppingBag
                  size={17}
                  strokeWidth={1.3}
                />

                <h2 className="text-[8px] uppercase tracking-[0.22em]">
                  Order Items
                </h2>
              </div>

              <span className="text-[8px] text-[#756b63]">
                {Number(
                  order.item_count
                ) || 0}{" "}
                items
              </span>
            </div>

            <div className="divide-y divide-black/[0.08] px-5 sm:px-6">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[75px_1fr] gap-5 py-6 sm:grid-cols-[95px_1fr]"
                >
                  <div className="overflow-hidden bg-[#ddd4cc]">
                    {item.image_url ? (
                      <img
                        src={
                          item.image_url
                        }
                        alt={
                          item.product_name ||
                          "Product"
                        }
                        className="aspect-[4/5] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center">
                        <Package
                          size={22}
                          strokeWidth={1.1}
                          className="text-[#81766e]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:justify-between sm:gap-5">
                    <div>
                      <p className="text-[9px] uppercase leading-6 tracking-[0.12em]">
                        {item.product_name ||
                          "Product"}
                      </p>

                      <p className="mt-2 text-[9px] leading-6 text-[#776d65]">
                        {item.variant_title ||
                          "Default variant"}

                        {item.sku && (
                          <>
                            <br />
                            SKU: {item.sku}
                          </>
                        )}

                        <br />
                        Quantity:{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-[10px]">
                        {formatCurrency(
                          item.line_total,
                          order.currency
                        )}
                      </p>

                      <p className="mt-2 text-[8px] text-[#776d65]">
                        {formatCurrency(
                          item.unit_price,
                          order.currency
                        )}{" "}
                        each
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-black/10 p-5 sm:p-6">
              <DetailRow
                label="Subtotal"
                value={formatCurrency(
                  order.subtotal,
                  order.currency
                )}
              />

              <DetailRow
                label="Shipping"
                value={
                  Number(
                    order.shipping_cost
                  ) === 0
                    ? "Free"
                    : formatCurrency(
                        order.shipping_cost,
                        order.currency
                      )
                }
              />

              <DetailRow
                label="Discount"
                value={
                  Number(
                    order.discount_amount
                  ) > 0
                    ? `-${formatCurrency(
                        order.discount_amount,
                        order.currency
                      )}`
                    : formatCurrency(
                        0,
                        order.currency
                      )
                }
              />

              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-5">
                <span className="text-[9px] uppercase tracking-[0.18em]">
                  Total
                </span>

                <span className="font-serif text-[24px]">
                  {formatCurrency(
                    order.total,
                    order.currency
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className="border border-black/10 bg-[#eee8e1]">
            <div className="border-b border-black/10 bg-[#e4ddd5] px-5 py-5 sm:px-6">
              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Admin Status Controls
              </h2>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-3 sm:p-6">
              <div>
                <label className="block text-[7px] uppercase tracking-[0.16em] text-[#756b63]">
                  Order Status
                </label>

               <select
  value={orderStatus}
  disabled={isOrderCancelled}
  onChange={(event) => {
    setOrderStatus(
      event.target.value
    );
    setSuccessMessage("");
  }}
  className="mt-3 h-12 w-full border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
>
                  {ORDER_STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatStatus(
                          status
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[7px] uppercase tracking-[0.16em] text-[#756b63]">
                  Payment Status
                </label>

                <select
  value={paymentStatus}
  disabled={isOrderCancelled}
  onChange={(event) => {
    setPaymentStatus(
      event.target.value
    );
    setSuccessMessage("");
  }}
  className="mt-3 h-12 w-full border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
>
                  {PAYMENT_STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatStatus(
                          status
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[7px] uppercase tracking-[0.16em] text-[#756b63]">
                  Fulfilment Status
                </label>

                <select
  value={
    fulfillmentStatus
  }
  disabled={isOrderCancelled}
  onChange={(event) => {
    setFulfillmentStatus(
      event.target.value
    );
    setSuccessMessage("");
  }}
  className="mt-3 h-12 w-full border border-black/10 bg-[#f4f0eb] px-3 text-[9px] outline-none focus:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
>
                  {FULFILLMENT_STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatStatus(
                          status
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

          <div className="border-t border-black/10 p-5 sm:p-6">
  {!isOrderCancelled && (
    <button
      type="button"
      onClick={() => {
        const isNewCancellation =
          orderStatus === "cancelled" &&
          order.status !== "cancelled";

        if (isNewCancellation) {
          setShowCancelConfirm(true);
          return;
        }

        handleSaveStatuses();
      }}
      disabled={isSaving}
      className="flex w-full items-center justify-center gap-2 bg-[#211c18] px-6 py-4 text-[8px] uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {isSaving ? (
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

      {isSaving
        ? "Saving..."
        : "Save Statuses"}
    </button>
  )}

  {isOrderCancelled && (
    <p className="text-[8px] uppercase tracking-[0.16em] text-[#7d3932]">
      This cancelled order is permanently locked.
    </p>
  )}
</div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-black/10 bg-[#e9e2da] p-6">
            <div className="flex items-center gap-3">
              <UserRound
                size={17}
                strokeWidth={1.3}
              />

              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Customer
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-[11px]">
                {order.customer_name ||
                  "Customer"}
              </p>

              {customerEmail && (
                <a
                  href={`mailto:${customerEmail}`}
                  className="flex items-center gap-3 text-[9px] text-[#655c55] transition hover:text-[#211c18]"
                >
                  <Mail
                    size={14}
                    strokeWidth={1.3}
                  />

                  <span className="break-all">
                    {customerEmail}
                  </span>
                </a>
              )}

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center gap-3 text-[9px] text-[#655c55] transition hover:text-[#211c18]"
                >
                  <Phone
                    size={14}
                    strokeWidth={1.3}
                  />

                  {
                    order.customer_phone
                  }
                </a>
              )}
            </div>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-6">
            <div className="flex items-center gap-3">
              <MapPin
                size={17}
                strokeWidth={1.3}
              />

              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Shipping Address
              </h2>
            </div>

            <p className="mt-5 text-[10px] leading-6 text-[#625850]">
  {shippingAddress.firstName ||
  shippingAddress.lastName ? (
    <>
      {shippingAddress.firstName} {shippingAddress.lastName}
      <br />
    </>
  ) : null}

  {shippingAddress.address ? (
    <>
      {shippingAddress.address}
      {shippingAddress.apartment
        ? `, ${shippingAddress.apartment}`
        : ""}
      <br />
    </>
  ) : null}

  {shippingAddress.city ||
  shippingAddress.state ||
  shippingAddress.postalCode ? (
    <>
      {shippingAddress.city}
      {shippingAddress.city && shippingAddress.state ? ", " : ""}
      {shippingAddress.state} {shippingAddress.postalCode}
      <br />
    </>
  ) : null}

  {shippingAddress.country || "No shipping address saved."}
</p>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-6">
            <div className="flex items-center gap-3">
              <Package
                size={17}
                strokeWidth={1.3}
              />

              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Delivery
              </h2>
            </div>

            <div className="mt-5">
              <DetailRow
                label="Method"
                value={`${formatStatus(
                  order.delivery_method
                )} Delivery`}
              />

              <DetailRow
                label="Shipping Fee"
                value={
                  Number(
                    order.shipping_cost
                  ) === 0
                    ? "Free"
                    : formatCurrency(
                        order.shipping_cost,
                        order.currency
                      )
                }
              />
            </div>
          </section>

          <section className="border border-black/10 bg-[#e9e2da] p-6">
            <div className="flex items-center gap-3">
              <CreditCard
                size={17}
                strokeWidth={1.3}
              />

              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Payment
              </h2>
            </div>

            <div className="mt-5">
              <DetailRow
                label="Status"
                value={formatStatus(
                  order.payment_status
                )}
              />

              <DetailRow
                label="Currency"
                value={
                  order.currency ||
                  "INR"
                }
              />

              <DetailRow
                label="Amount"
                value={formatCurrency(
                  order.total,
                  order.currency
                )}
              />
            </div>
          </section>

          {order.notes && (
            <section className="border border-black/10 bg-[#e9e2da] p-6">
              <h2 className="text-[8px] uppercase tracking-[0.22em]">
                Customer Notes
              </h2>

              <p className="mt-5 whitespace-pre-wrap text-[10px] leading-6 text-[#625850]">
                {order.notes}
              </p>
            </section>
          )}
        </aside>
      </div>

          
          {showCancelConfirm && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4">
    <div className="w-full max-w-[460px] border border-black/10 bg-[#f2eee9] p-6 shadow-2xl sm:p-8">
      <p className="text-[8px] uppercase tracking-[0.22em] text-[#8c443b]">
        Confirm Cancellation
      </p>

      <h2 className="mt-4 font-serif text-[32px] leading-tight tracking-[-0.03em]">
        Cancel this order?
      </h2>

      <p className="mt-4 text-[10px] leading-6 text-[#6f655d]">
        Cancelling this order will return the purchased
        quantity to inventory. Once stock is restored,
        this order cannot be reopened.
      </p>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            setShowCancelConfirm(false);
          }}
          disabled={isSaving}
          className="border border-black/15 px-6 py-4 text-[8px] uppercase tracking-[0.17em] transition hover:border-black/40 disabled:opacity-50"
        >
          Keep Order
        </button>

        <button
          type="button"
          onClick={async () => {
            setShowCancelConfirm(false);
            await handleSaveStatuses();
          }}
          disabled={isSaving}
          className="bg-[#8c443b] px-6 py-4 text-[8px] uppercase tracking-[0.17em] text-white transition hover:bg-[#75372f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Cancelling..."
            : "Cancel Order"}
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  );
}