import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";

import { useOrders } from "../context/OrderContext";

function formatOrderDate(dateValue) {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);
}

export default function OrderDetails() {
  const { orderId } = useParams();

  const {
    orders,
    ordersLoading,
    ordersError,
    fetchOrders,
  } = useOrders();

  const order = orders.find(
    (currentOrder) =>
      currentOrder.id === orderId ||
      currentOrder.orderNumber === orderId
  );

  if (ordersLoading) {
    return (
      <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
        <AnnouncementBar />
        <Navbar />

        <section className="flex min-h-screen items-center justify-center px-4 pt-[120px]">
          <div className="text-center">
            <span className="mx-auto block h-10 w-10 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />

            <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-[#746960]">
              Loading order
            </p>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (ordersError) {
    return (
      <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
        <AnnouncementBar />
        <Navbar />

        <section className="mx-auto flex min-h-[80vh] max-w-[700px] items-center justify-center px-4 pb-20 pt-[140px] text-center">
          <div>
            <Package
              size={35}
              strokeWidth={1.2}
              className="mx-auto"
            />

            <h1 className="mt-6 font-serif text-[38px] tracking-[-0.04em] sm:text-[48px]">
              Order unavailable
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[11px] leading-6 text-[#746960]">
              {ordersError}
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.22em] text-white transition hover:bg-black"
            >
              Try Again
            </button>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
        <AnnouncementBar />
        <Navbar />

        <section className="mx-auto flex min-h-[80vh] max-w-[700px] items-center justify-center px-4 pb-20 pt-[140px] text-center">
          <div>
            <Package
              size={35}
              strokeWidth={1.2}
              className="mx-auto"
            />

            <p className="mt-6 text-[8px] uppercase tracking-[0.26em] text-[#7d726a]">
              Order Not Found
            </p>

            <h1 className="mt-4 font-serif text-[38px] tracking-[-0.04em] sm:text-[48px]">
              This order is unavailable
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[11px] leading-6 text-[#746960]">
              The order may not exist, or it may not belong
              to the currently signed-in account.
            </p>

            <Link
              to="/account"
              className="mt-7 inline-flex items-center gap-2 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.22em] text-white transition hover:bg-black"
            >
              <ArrowLeft size={13} strokeWidth={1.4} />
              Return to Account
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1250px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#746960] transition hover:text-[#211c18]"
        >
          <ArrowLeft size={13} strokeWidth={1.4} />
          Back to Account
        </Link>

        <div className="mt-8 flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#7d726a]">
              Order Details
            </p>

            <h1 className="mt-3 font-serif text-[38px] leading-none tracking-[-0.04em] sm:text-[52px] lg:text-[60px]">
              {order.orderNumber}
            </h1>

            <div className="mt-5 flex items-center gap-2 text-[9px] text-[#71665e]">
              <CalendarDays
                size={14}
                strokeWidth={1.3}
              />

              {formatOrderDate(order.createdAt)}
            </div>
          </div>

          <span className="w-fit bg-[#dfe6d9] px-4 py-3 text-[8px] uppercase tracking-[0.2em] text-[#53634c]">
            {order.status}
          </span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="border border-black/10">
            <div className="flex items-center gap-3 bg-[#eee7df] p-5 sm:p-6">
              <ShoppingBag
                size={17}
                strokeWidth={1.3}
              />

              <h2 className="text-[8px] uppercase tracking-[0.23em]">
                Order Items
              </h2>
            </div>

            <div className="divide-y divide-black/[0.08] px-5 sm:px-6">
              {order.items?.map((item) => (
                <article
                  key={item.cartItemId}
                  className="grid grid-cols-[85px_1fr] gap-5 py-6 sm:grid-cols-[105px_1fr]"
                >
                  {item.slug ? (
                    <Link
                      to={`/product/${item.slug}`}
                      className="overflow-hidden bg-[#ddd4cc]"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                      )}
                    </Link>
                  ) : (
                    <div className="overflow-hidden bg-[#ddd4cc]">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex min-w-0 justify-between gap-5">
                    <div>
                      {item.slug ? (
                        <Link
                          to={`/product/${item.slug}`}
                          className="text-[9px] uppercase leading-[1.6] tracking-[0.13em] transition hover:opacity-60"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="text-[9px] uppercase leading-[1.6] tracking-[0.13em]">
                          {item.name}
                        </p>
                      )}

                      <p className="mt-3 text-[9px] leading-6 text-[#776d65]">
  {item.variantTitle ? (
    <>
      Variant: {item.variantTitle}
      <br />
    </>
  ) : (
    <>
      Colour:{" "}
      {item.colour || "Not selected"}
      <br />

      Size:{" "}
      {item.size || "Not selected"}
      <br />
    </>
  )}

  {item.sku && (
    <>
      SKU: {item.sku}
      <br />
    </>
  )}

  Quantity: {item.quantity}
</p>
                    </div>

                    <span className="shrink-0 text-[11px]">
                      {formatCurrency(
                        item.price * item.quantity,
                        order.currency
                      )}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-black/10 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#71665e]">
                    Subtotal
                  </span>

                  <span>
                    {formatCurrency(
                      order.subtotal,
                      order.currency
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#71665e]">
                    Shipping
                  </span>

                  <span>
                    {Number(order.shippingCost) === 0
                      ? "Free"
                      : formatCurrency(
                          order.shippingCost,
                          order.currency
                        )}
                  </span>
                </div>

                {Number(order.discountAmount) > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#71665e]">
                      Discount
                    </span>

                    <span>
                      -
                      {formatCurrency(
                        order.discountAmount,
                        order.currency
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
                <span className="text-[9px] uppercase tracking-[0.2em]">
                  Total
                </span>

                <span className="text-[18px]">
                  {formatCurrency(
                    order.total,
                    order.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="border border-black/10 bg-[#eee7df] p-6">
              <div className="flex items-center gap-3">
                <MapPin size={17} strokeWidth={1.3} />

                <h2 className="text-[8px] uppercase tracking-[0.22em]">
                  Shipping Address
                </h2>
              </div>

              <p className="mt-5 text-[10px] leading-6 text-[#625850]">
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
                <br />

                {order.shippingAddress?.address}

                {order.shippingAddress?.apartment
                  ? `, ${order.shippingAddress.apartment}`
                  : ""}

                <br />

                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
                <br />

                {order.shippingAddress?.country}
                <br />

                {order.shippingAddress?.phone}
              </p>
            </section>

            <section className="border border-black/10 bg-[#eee7df] p-6">
              <div className="flex items-center gap-3">
                <Package size={17} strokeWidth={1.3} />

                <h2 className="text-[8px] uppercase tracking-[0.22em]">
                  Delivery
                </h2>
              </div>

              <p className="mt-5 text-[10px] capitalize">
                {order.deliveryMethod} delivery
              </p>
            </section>

            <section className="border border-black/10 bg-[#eee7df] p-6">
              <div className="flex items-center gap-3">
                <CreditCard size={17} strokeWidth={1.3} />

                <h2 className="text-[8px] uppercase tracking-[0.22em]">
                  Payment
                </h2>
              </div>

              <div className="mt-5 space-y-3 text-[10px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#71665e]">
                    Method
                  </span>

                  <span className="capitalize">
                    {order.paymentMethod || "card"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#71665e]">
                    Status
                  </span>

                  <span className="capitalize">
                    {order.paymentStatus || "pending"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}