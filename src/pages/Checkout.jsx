import {
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  LockKeyhole,
  ShoppingBag,
  Truck,
} from "lucide-react";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";

import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

const EXPRESS_SHIPPING_COST = 150;

function createIdempotencyKey() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.floor(
        Math.random() * 16
      );

      const value =
        character === "x"
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(value) || 0);
}

function getCheckoutErrorMessage(error) {
  const message =
    error?.message?.trim() ||
    "Your order could not be placed. Please try again.";

  const lowerMessage =
    message.toLowerCase();

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("signed in")
  ) {
    return "Please sign in again before placing your order.";
  }

  return message;
}

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    subtotal,
    clearCart,
  } = useCart();

  const idempotencyKeyRef =
    useRef(createIdempotencyKey());

  const [formData, setFormData] =
    useState({
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      notes: "",
    });

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState("standard");

  const [message, setMessage] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    orderPlaced,
    setOrderPlaced,
  ] = useState(false);

  const estimatedShippingCost =
    deliveryMethod === "express"
      ? EXPRESS_SHIPPING_COST
      : 0;

  const estimatedTotal =
    Number(subtotal) +
    estimatedShippingCost;

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (cartItems.length === 0) {
      setMessage(
        "Your bag is empty."
      );
      return;
    }

    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "phone",
    ];

    const hasMissingField =
      requiredFields.some(
        (field) =>
          !String(
            formData[field] ?? ""
          ).trim()
      );

    if (hasMissingField) {
      setMessage(
        "Please complete all required fields."
      );
      return;
    }

    const invalidCartItem =
      cartItems.find(
        (item) =>
          !item.variantId ||
          !Number.isInteger(
            Number(item.quantity)
          ) ||
          Number(item.quantity) < 1
      );

    if (invalidCartItem) {
      setMessage(
        "One of the products in your bag is no longer valid. Remove it and add it again."
      );
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (
        !sessionData.session?.user
      ) {
        throw new Error(
          "You must be signed in before placing an order."
        );
      }

      const checkoutItems =
        cartItems.map((item) => ({
          variant_id:
            item.variantId,
          quantity: Number(
            item.quantity
          ),
        }));

      const shippingAddress = {
        firstName:
          formData.firstName.trim(),

        lastName:
          formData.lastName.trim(),

        address:
          formData.address.trim(),

        apartment:
          formData.apartment.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        postalCode:
          formData.postalCode.trim(),

        country:
          formData.country.trim(),

        phone:
          formData.phone.trim(),
      };

      const {
        data,
        error,
      } = await supabase.rpc(
        "place_order",
        {
          p_items:
            checkoutItems,

          p_customer_name:
            `${formData.firstName.trim()} ${formData.lastName.trim()}`,

          p_email:
            formData.email
              .trim()
              .toLowerCase(),

          p_customer_phone:
            formData.phone.trim(),

          p_shipping_address:
            shippingAddress,

          p_delivery_method:
            deliveryMethod,

          p_shipping_cost: 0,

          p_notes:
            formData.notes.trim() ||
            null,

          p_idempotency_key:
            idempotencyKeyRef.current,
        }
      );

      if (error) {
        throw error;
      }

      if (
        !data?.success ||
        !data?.order_id
      ) {
        throw new Error(
          "The order was not completed. Please try again."
        );
      }

      const savedOrder = {
        id: data.order_id,

        orderNumber:
          data.order_number,

        order_number:
          data.order_number,

        status: "pending",

        paymentStatus:
          "pending",

        payment_status:
          "pending",

        fulfillmentStatus:
          "unfulfilled",

        fulfillment_status:
          "unfulfilled",

        subtotal: Number(
          data.subtotal ??
            subtotal
        ),

        shippingCost: Number(
          data.shipping_cost ??
            0
        ),

        shipping_cost: Number(
          data.shipping_cost ??
            0
        ),

        discountAmount: Number(
          data.discount_amount ??
            0
        ),

        discount_amount: Number(
          data.discount_amount ??
            0
        ),

        total: Number(
          data.total ?? 0
        ),

       currency:
  data.currency ?? "INR",

email:
  formData.email.trim().toLowerCase(),

customerEmail:
  formData.email.trim().toLowerCase(),

customerName:
  `${formData.firstName.trim()} ${formData.lastName.trim()}`,

deliveryMethod:
  deliveryMethod,

delivery_method:
  deliveryMethod,

itemCount: Number(
  data.item_count ??
    cartCount
),

        item_count: Number(
          data.item_count ??
            cartCount
        ),

        duplicate:
          Boolean(data.duplicate),
      };

      setOrderPlaced(true);

      clearCart();

      navigate(
        "/order-success",
        {
          replace: true,
          state: {
            order: savedOrder,
          },
        }
      );
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setMessage(
        getCheckoutErrorMessage(
          error
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    cartItems.length === 0 &&
    !isSubmitting &&
    !orderPlaced
  ) {
    return (
      <Navigate
        to="/cart"
        replace
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pt-[175px]">
        <div className="border-b border-black/10 pb-8">
          <p className="text-[8px] uppercase tracking-[0.28em] text-[#7d726a] sm:text-[9px]">
            Secure Checkout
          </p>

          <h1 className="mt-3 font-serif text-[42px] leading-none tracking-[-0.04em] sm:text-[58px] lg:text-[68px]">
            Checkout
          </h1>

          <p className="mt-4 text-[11px] text-[#71665e]">
            {cartCount}{" "}
            {cartCount === 1
              ? "item"
              : "items"}{" "}
            in your order
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px] lg:gap-16 xl:grid-cols-[1fr_430px]"
        >
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                  Contact
                </h2>

                <p className="text-[8px] uppercase tracking-[0.16em] text-[#80756d]">
                  Required
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Email Address
                </label>

                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition placeholder:text-[#9b9189] focus:border-black/50"
                />
              </div>
            </section>

            <section className="border-t border-black/10 pt-10">
              <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                Shipping Address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    First Name
                  </label>

                  <input
                    required
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    value={
                      formData.firstName
                    }
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Last Name
                  </label>

                  <input
                    required
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={
                      formData.lastName
                    }
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Address
                  </label>

                  <input
                    required
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={
                      formData.address
                    }
                    onChange={handleChange}
                    placeholder="Street and house number"
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition placeholder:text-[#9b9189] focus:border-black/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Apartment, suite, etc.
                  </label>

                  <input
                    type="text"
                    name="apartment"
                    value={
                      formData.apartment
                    }
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    City
                  </label>

                  <input
                    required
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    State
                  </label>

                  <input
                    required
                    type="text"
                    name="state"
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Postal Code
                  </label>

                  <input
                    required
                    type="text"
                    name="postalCode"
                    autoComplete="postal-code"
                    value={
                      formData.postalCode
                    }
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Country
                  </label>

                  <select
                    required
                    name="country"
                    autoComplete="country-name"
                    value={
                      formData.country
                    }
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  >
                    <option value="India">
                      India
                    </option>

                    <option value="United Arab Emirates">
                      United Arab Emirates
                    </option>

                    <option value="United Kingdom">
                      United Kingdom
                    </option>

                    <option value="United States">
                      United States
                    </option>

                    <option value="Canada">
                      Canada
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Phone Number
                  </label>

                  <input
                    required
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Order Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Optional delivery instructions"
                    className="mt-3 w-full resize-none border border-black/15 bg-transparent px-4 py-4 text-[11px] outline-none transition placeholder:text-[#9b9189] focus:border-black/50"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-black/10 pt-10">
              <div className="flex items-center gap-3">
                <Truck
                  size={19}
                  strokeWidth={1.3}
                />

                <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                  Delivery Method
                </h2>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex cursor-pointer items-center justify-between border border-black/15 p-5 transition hover:border-black/40">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={
                        deliveryMethod ===
                        "standard"
                      }
                      onChange={(
                        event
                      ) => {
                        setDeliveryMethod(
                          event.target
                            .value
                        );
                        setMessage("");
                      }}
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em]">
                        Standard Delivery
                      </p>

                      <p className="mt-2 text-[10px] text-[#7b7068]">
                        5–7 business days
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px]">
                    Free
                  </span>
                </label>

                <label className="flex cursor-pointer items-center justify-between border border-black/15 p-5 transition hover:border-black/40">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="express"
                      checked={
                        deliveryMethod ===
                        "express"
                      }
                      onChange={(
                        event
                      ) => {
                        setDeliveryMethod(
                          event.target
                            .value
                        );
                        setMessage("");
                      }}
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em]">
                        Express Delivery
                      </p>

                      <p className="mt-2 text-[10px] text-[#7b7068]">
                        2–3 business days
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px]">
                    {formatCurrency(
                      EXPRESS_SHIPPING_COST
                    )}
                  </span>
                </label>
              </div>
            </section>

            <section className="border-t border-black/10 pt-10">
              <div className="flex items-center gap-3">
                <LockKeyhole
                  size={18}
                  strokeWidth={1.3}
                />

                <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                  Payment
                </h2>
              </div>

              <div className="mt-6 border border-black/10 bg-[#eee7df] p-6">
                <p className="text-[9px] uppercase tracking-[0.16em]">
                  Payment integration pending
                </p>

                <p className="mt-3 max-w-xl text-[10px] leading-6 text-[#746960]">
                  No card information is
                  collected or stored. This
                  order will be created with
                  payment status pending until
                  the payment gateway is
                  connected.
                </p>
              </div>
            </section>
          </div>

          <aside className="h-fit border border-black/[0.1] bg-[#eee7df] p-6 sm:p-8 lg:sticky lg:top-[140px]">
            <div className="flex items-center gap-3">
              <ShoppingBag
                size={17}
                strokeWidth={1.3}
              />

              <p className="text-[8px] uppercase tracking-[0.24em]">
                Order Summary
              </p>
            </div>

            <div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {cartItems.map(
                (item) => (
                  <article
                    key={
                      item.cartItemId
                    }
                    className="grid grid-cols-[65px_1fr] gap-4 py-5"
                  >
                    <div className="relative overflow-hidden bg-[#ddd4cc]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-[4/5] h-full w-full object-cover"
                      />

                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211c18] px-1 text-[7px] text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex min-w-0 justify-between gap-3">
                      <div>
                        <p className="text-[8px] uppercase leading-[1.5] tracking-[0.12em]">
                          {item.name}
                        </p>

                        <p className="mt-2 text-[9px] leading-[1.7] text-[#7d726a]">
                          {item.colour}
                          <br />
                          Size:{" "}
                          {item.size}
                        </p>
                      </div>

                      <span className="shrink-0 text-[9px]">
                        {formatCurrency(
                          Number(
                            item.price
                          ) *
                            Number(
                              item.quantity
                            )
                        )}
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-[10px]">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(
                    subtotal
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span>Shipping</span>

                <span>
                  {estimatedShippingCost ===
                  0
                    ? "Free"
                    : formatCurrency(
                        estimatedShippingCost
                      )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#7b7068]">
                <span>Taxes</span>

                <span>
                  Included where
                  applicable
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
              <span className="text-[10px] uppercase tracking-[0.18em]">
                Estimated Total
              </span>

              <span className="text-[18px]">
                {formatCurrency(
                  estimatedTotal
                )}
              </span>
            </div>

            <p className="mt-3 text-[8px] leading-5 text-[#81766e]">
              Final prices, stock and totals
              are verified securely when the
              order is placed.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 flex w-full items-center justify-center gap-2 bg-[#211c18] px-5 py-4 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole
                size={13}
                strokeWidth={1.4}
              />

              {isSubmitting
                ? "Placing Order..."
                : "Place Order"}
            </button>

            {message && (
              <p
                role="alert"
                className="mt-4 text-center text-[10px] leading-5 text-[#9b493f]"
              >
                {message}
              </p>
            )}

            <Link
              to="/cart"
              className="mt-5 block text-center text-[8px] uppercase tracking-[0.17em] underline underline-offset-4"
            >
              Return to Bag
            </Link>

            <p className="mt-6 text-center text-[8px] leading-5 text-[#81766e]">
              Inventory is reserved only
              after the order transaction
              succeeds.
            </p>
          </aside>
        </form>
      </section>

      <Footer />
    </main>
  );
}