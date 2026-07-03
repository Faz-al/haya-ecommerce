import { Check, ShoppingBag } from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount) || 0);
}

function formatDeliveryMethod(method) {
  return String(method || "standard")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function OrderSuccess() {
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const customerEmail =
    order.customerEmail ||
    order.customer_email ||
    order.email ||
    "";

  const orderNumber =
    order.orderNumber ||
    order.order_number ||
    "Order confirmed";

  const itemCount =
    Number(order.itemCount ?? order.item_count) || 0;

  const deliveryMethod =
    order.deliveryMethod ||
    order.delivery_method ||
    "standard";

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto flex min-h-[85vh] max-w-[900px] items-center justify-center px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <div className="w-full border border-black/10 bg-[#eee7df] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/15">
            <Check size={27} strokeWidth={1.3} />
          </div>

          <p className="mt-7 text-[8px] uppercase tracking-[0.28em] text-[#7d726a] sm:text-[9px]">
            Order Confirmed
          </p>

          <h1 className="mt-4 font-serif text-[38px] leading-none tracking-[-0.04em] sm:text-[52px] lg:text-[60px]">
            Thank You
          </h1>

          <p className="mx-auto mt-6 max-w-[540px] text-[11px] leading-7 text-[#71665e] sm:text-[12px]">
            Your order has been received
            {customerEmail ? (
              <>
                . A confirmation will be sent to{" "}
                <span className="break-all text-[#211c18]">
                  {customerEmail}
                </span>
              </>
            ) : (
              "."
            )}
          </p>

          <div className="mx-auto mt-9 max-w-[520px] border-y border-black/10 py-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[8px] uppercase tracking-[0.18em] text-[#746960]">
                Order Number
              </span>

              <span className="text-right text-[10px] uppercase tracking-[0.12em]">
                {orderNumber}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[8px] uppercase tracking-[0.18em] text-[#746960]">
                Items
              </span>

              <span className="text-[10px]">
                {itemCount}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[8px] uppercase tracking-[0.18em] text-[#746960]">
                Delivery
              </span>

              <span className="text-[10px]">
                {formatDeliveryMethod(deliveryMethod)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[8px] uppercase tracking-[0.18em] text-[#746960]">
                Payment
              </span>

              <span className="text-[10px]">
                Pending
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[8px] uppercase tracking-[0.18em] text-[#746960]">
                Total
              </span>

              <span className="text-[13px]">
                {formatCurrency(order.total, order.currency)}
              </span>
            </div>
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={`/account/orders/${order.id}`}
              className="flex min-h-12 items-center justify-center border border-black/15 px-8 text-[8px] uppercase tracking-[0.21em] transition hover:bg-white"
            >
              View Order
            </Link>

            <Link
              to="/shop"
              className="flex min-h-12 items-center justify-center gap-2 bg-[#211c18] px-8 text-[8px] uppercase tracking-[0.21em] text-white transition hover:bg-black"
            >
              <ShoppingBag size={13} strokeWidth={1.4} />
              Continue Shopping
            </Link>

            <Link
              to="/"
              className="flex min-h-12 items-center justify-center border border-black/15 px-8 text-[8px] uppercase tracking-[0.21em] transition hover:bg-white"
            >
              Return Home
            </Link>
          </div>

          <p className="mx-auto mt-8 max-w-[460px] text-[8px] leading-5 text-[#847970]">
            Payment is currently pending. The order has been created and
            inventory has been updated successfully.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}