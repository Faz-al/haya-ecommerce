import {
  CalendarDays,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

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
  }).format(date);
}

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default function Account() {
  const {
    orders,
    orderCount,
    ordersLoading,
    ordersError,
    fetchOrders,
  } = useOrders();

  const latestOrder = orders[0];

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#7d726a] sm:text-[9px]">
              Your Haya
            </p>

            <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[58px] lg:text-[68px]">
              My Account
            </h1>

            <p className="mt-4 text-[11px] text-[#71665e]">
              View your order history and saved purchases.
            </p>
          </div>

          {!ordersLoading && (
            <button
              type="button"
              onClick={fetchOrders}
              className="w-fit text-[8px] uppercase tracking-[0.18em] text-[#756a62] underline underline-offset-4 transition hover:text-[#211c18]"
            >
              Refresh Orders
            </button>
          )}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="border border-black/10 bg-[#eee7df] p-6">
            <Package size={19} strokeWidth={1.3} />

            <p className="mt-5 text-[8px] uppercase tracking-[0.21em] text-[#786d65]">
              Total Orders
            </p>

            <p className="mt-2 font-serif text-[34px]">
              {ordersLoading ? "—" : orderCount}
            </p>
          </div>

          <div className="border border-black/10 bg-[#eee7df] p-6">
            <ShoppingBag size={19} strokeWidth={1.3} />

            <p className="mt-5 text-[8px] uppercase tracking-[0.21em] text-[#786d65]">
              Latest Order
            </p>

            <p className="mt-3 text-[10px] uppercase tracking-[0.11em]">
              {ordersLoading
                ? "Loading..."
                : latestOrder
                  ? latestOrder.orderNumber
                  : "No orders"}
            </p>
          </div>

          <div className="border border-black/10 bg-[#eee7df] p-6">
            <UserRound size={19} strokeWidth={1.3} />

            <p className="mt-5 text-[8px] uppercase tracking-[0.21em] text-[#786d65]">
              Customer
            </p>

            <p className="mt-3 text-[10px] uppercase tracking-[0.11em]">
              {ordersLoading
                ? "Loading..."
                : latestOrder
                  ? latestOrder.customerName
                  : "Haya Customer"}
            </p>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-6">
            <div>
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#776d65]">
                Purchase History
              </p>

              <h2 className="mt-3 font-serif text-[30px] leading-none tracking-[-0.03em] sm:text-[40px]">
                Your Orders
              </h2>
            </div>

            <span className="text-[9px] text-[#786d65]">
              {ordersLoading
                ? "Loading..."
                : `${orderCount} ${
                    orderCount === 1 ? "order" : "orders"
                  }`}
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <span className="h-10 w-10 animate-spin rounded-full border border-black/15 border-t-[#211c18]" />

              <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-[#746960]">
                Loading your orders
              </p>
            </div>
          ) : ordersError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9b493f]/20 text-[#9b493f]">
                <Package size={25} strokeWidth={1.2} />
              </span>

              <h3 className="mt-6 font-serif text-[30px] tracking-[-0.03em] sm:text-[38px]">
                Orders unavailable
              </h3>

              <p className="mt-3 max-w-md text-[11px] leading-6 text-[#746960] sm:text-[12px]">
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
          ) : orders.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10">
                <Package size={25} strokeWidth={1.2} />
              </span>

              <h3 className="mt-6 font-serif text-[30px] tracking-[-0.03em] sm:text-[38px]">
                No orders yet
              </h3>

              <p className="mt-3 max-w-md text-[11px] leading-6 text-[#746960] sm:text-[12px]">
                Your completed orders will appear here after
                checkout.
              </p>

              <Link
                to="/shop"
                className="mt-7 bg-[#211c18] px-8 py-4 text-[8px] uppercase tracking-[0.22em] text-white transition hover:bg-black"
              >
                Explore the Collection
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {orders.map((order) => (
                <article
                  key={order.id || order.orderNumber}
                  className="border border-black/10"
                >
                  <div className="flex flex-col gap-5 bg-[#eee7df] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
                        Order Number
                      </p>

                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em]">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                      <div className="flex items-center gap-2 text-[9px] text-[#71665e]">
                        <CalendarDays
                          size={13}
                          strokeWidth={1.3}
                        />

                        {formatOrderDate(order.createdAt)}
                      </div>
<div className="flex flex-wrap gap-2">
  <span className="bg-[#dfe6d9] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#53634c]">
    Order: {order.status}
  </span>

  <span className="bg-[#e8e1ce] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#6d5a27]">
    Payment: {order.paymentStatus}
  </span>

  <span className="bg-[#dce5ea] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#35576a]">
    Fulfilment: {order.fulfillmentStatus}
  </span>
</div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                      {order.items?.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="grid grid-cols-[75px_1fr] gap-4 py-5 sm:grid-cols-[90px_1fr]"
                        >
                          {item.slug ? (
                            <Link
                              to={`/product/${item.slug}`}
                              className="overflow-hidden bg-[#ddd4cc]"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="aspect-[4/5] h-full w-full object-cover"
                              />
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

                          <div className="flex min-w-0 justify-between gap-4">
                            <div>
                              {item.slug ? (
                                <Link
                                  to={`/product/${item.slug}`}
                                  className="text-[8px] uppercase leading-[1.55] tracking-[0.12em] transition hover:opacity-60 sm:text-[9px]"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                <p className="text-[8px] uppercase leading-[1.55] tracking-[0.12em] sm:text-[9px]">
                                  {item.name}
                                </p>
                              )}

                              <p className="mt-2 text-[9px] leading-[1.7] text-[#7d726a]">
                                Colour: {item.colour || "Not selected"}
                                <br />
                                Size: {item.size || "Not selected"}
                                <br />
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <span className="shrink-0 text-[10px]">
                              {formatCurrency(
                                item.price * item.quantity,
                                order.currency
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-5 border-b border-black/10 pb-6 sm:grid-cols-2">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
                          Delivery
                        </p>

                        <p className="mt-2 text-[10px] capitalize">
                          {order.deliveryMethod}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-[#786d65]">
                          Shipping Address
                        </p>

                        <p className="mt-2 text-[10px] leading-5 text-[#625850]">
                          {order.shippingAddress?.address ||
                            "Address unavailable"}

                          {order.shippingAddress?.apartment
                            ? `, ${order.shippingAddress.apartment}`
                            : ""}

                          <br />

                          {order.shippingAddress?.city}
                          {order.shippingAddress?.city ? ", " : ""}
                          {order.shippingAddress?.state}{" "}
                          {order.shippingAddress?.postalCode}

                          <br />

                          {order.shippingAddress?.country}
                        </p>
                      </div>
                    </div>

                   <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="text-[8px] uppercase tracking-[0.18em] text-[#786d65]">
      Order Total
    </p>

    <p className="mt-2 text-[16px]">
      {formatCurrency(
        order.total,
        order.currency
      )}
    </p>
  </div>

  <Link
    to={`/account/orders/${order.id}`}
    className="flex min-h-11 w-full items-center justify-center border border-black/15 px-6 text-[8px] uppercase tracking-[0.19em] transition hover:bg-[#211c18] hover:text-white sm:w-auto"
  >
    View Order
  </Link>
</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}