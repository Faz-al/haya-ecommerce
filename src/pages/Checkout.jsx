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
const COD_CHARGE = 100;

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

let razorpayScriptPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise =
    new Promise((resolve) => {
      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    });

  return razorpayScriptPromise;
}

async function getFunctionErrorMessage(
  error,
  fallback
) {
  try {
    if (
      error?.context instanceof
      Response
    ) {
      const payload =
        await error.context
          .clone()
          .json();

      if (payload?.message) {
        return payload.message;
      }
    }
  } catch {
    // Ignore unreadable function responses.
  }

  return (
    error?.message?.trim() ||
    fallback
  );
}

const FIELD_LABELS = {
  email: "Email address",
  firstName: "First name",
  lastName: "Last name",
  address: "Address",
  city: "City",
  state: "State",
  postalCode: "Postal code",
  country: "Country",
  phone: "Phone number",
};

const REQUIRED_FIELDS =
  Object.keys(FIELD_LABELS);

function validateCheckoutForm(
  formData,
  paymentMethod,
  estimatedTotal
) {
  const errors = {};

  for (
    const field of
    REQUIRED_FIELDS
  ) {
    if (
      !String(
        formData[field] ?? ""
      ).trim()
    ) {
      errors[field] =
        `${FIELD_LABELS[field]} is required.`;
    }
  }

  const email =
    String(
      formData.email ?? ""
    ).trim();

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    errors.email =
      "Enter a valid email address.";
  }

  const phoneDigits =
    String(
      formData.phone ?? ""
    ).replace(/\D/g, "");

  if (
    formData.phone &&
    formData.country === "India" &&
    phoneDigits.length !== 10
  ) {
    errors.phone =
      "Enter a valid 10-digit Indian phone number.";
  } else if (
    formData.phone &&
    phoneDigits.length < 7
  ) {
    errors.phone =
      "Enter a valid phone number.";
  }

  const postalCode =
    String(
      formData.postalCode ?? ""
    ).trim();

  if (
    postalCode &&
    formData.country === "India" &&
    !/^[1-9][0-9]{5}$/.test(
      postalCode
    )
  ) {
    errors.postalCode =
      "Enter a valid 6-digit Indian postal code.";
  }

  if (
    paymentMethod === "cod" &&
    formData.country !== "India"
  ) {
    errors.country =
      "Cash on Delivery is currently available only in India.";
  }

  if (
    paymentMethod === "cod" &&
    Number(estimatedTotal) > 5000
  ) {
    errors.paymentMethod =
      "Cash on Delivery is available for orders up to ₹5,000.";
  }

  return errors;
}

function createSavedOrder(
  order,
  fallback
) {
  return {
    ...order,

    id: order.id,

    orderNumber:
      order.order_number,

    order_number:
      order.order_number,

    paymentStatus:
      order.payment_status ||
      fallback.paymentStatus,

    payment_status:
      order.payment_status ||
      fallback.paymentStatus,

    paymentProvider:
      order.payment_provider ||
      fallback.paymentProvider,

    payment_provider:
      order.payment_provider ||
      fallback.paymentProvider,

    fulfillmentStatus:
      order.fulfillment_status ||
      "unfulfilled",

    fulfillment_status:
      order.fulfillment_status ||
      "unfulfilled",

    shippingCost: Number(
      order.shipping_cost ?? 0
    ),

    shipping_cost: Number(
      order.shipping_cost ?? 0
    ),

    discountAmount: Number(
      order.discount_amount ?? 0
    ),

    discount_amount: Number(
      order.discount_amount ?? 0
    ),

    total: Number(
      order.total ?? 0
    ),

    currency:
      order.currency ||
      "INR",

    email:
      order.email ||
      fallback.customerEmail,

    customerEmail:
      order.customer_email ||
      fallback.customerEmail,

    customerName:
      order.customer_name ||
      fallback.customerName,

    deliveryMethod:
      order.delivery_method ||
      fallback.deliveryMethod,

    delivery_method:
      order.delivery_method ||
      fallback.deliveryMethod,

    itemCount: Number(
      order.item_count ??
      fallback.cartCount
    ),

    item_count: Number(
      order.item_count ??
      fallback.cartCount
    ),

    codCharge: Number(
      order.cod_fee ??
      fallback.codCharge ??
      0
    ),

    cod_fee: Number(
      order.cod_fee ??
      fallback.codCharge ??
      0
    ),
  };
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
    useRef(
      createIdempotencyKey()
    );

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

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("razorpay");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState({});

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

  const estimatedCodCharge =
    paymentMethod === "cod"
      ? COD_CHARGE
      : 0;

  const estimatedTotal =
    Number(subtotal) +
    estimatedShippingCost +
    estimatedCodCharge;

  const handleChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setFieldErrors(
      (current) => {
        if (!current[name]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[name];

        return next;
      }
    );

    setMessage("");
  };

  const getFieldClassName = (
    field,
    extra = ""
  ) =>
    `mt-3 w-full border bg-transparent px-4 text-[11px] outline-none transition ${
      fieldErrors[field]
        ? "border-[#9b493f] focus:border-[#9b493f]"
        : "border-black/15 focus:border-black/50"
    } ${extra}`;

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      cartItems.length === 0
    ) {
      setMessage(
        "Your bag is empty."
      );

      return;
    }

    const validationErrors =
      validateCheckoutForm(
        formData,
        paymentMethod,
        estimatedTotal
      );

    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {
      setFieldErrors(
        validationErrors
      );

      setMessage(
        "Please complete the highlighted fields."
      );

      const firstField =
        Object.keys(
          validationErrors
        ).find(
          (field) =>
            field !==
            "paymentMethod"
        );

      if (firstField) {
        window.requestAnimationFrame(
          () => {
            const element =
              document.querySelector(
                `[name="${firstField}"]`
              );

            element?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            element?.focus({
              preventScroll: true,
            });
          }
        );
      } else {
        document
          .getElementById(
            "payment-method-section"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }

      return;
    }

    setFieldErrors({});

    const invalidCartItem =
      cartItems.find(
        (item) =>
          !item.variantId ||
          !Number.isInteger(
            Number(
              item.quantity
            )
          ) ||
          Number(
            item.quantity
          ) < 1
      );

    if (invalidCartItem) {
      setMessage(
        "One of the products in your bag is no longer valid. Remove it and add it again."
      );

      return;
    }

    setIsSubmitting(true);

    setMessage(
      paymentMethod === "cod"
        ? "Placing your Cash on Delivery order..."
        : "Preparing secure payment..."
    );

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
        cartItems.map(
          (item) => ({
            variant_id:
              item.variantId,

            quantity: Number(
              item.quantity
            ),
          })
        );

      const customerName =
        `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      const customerEmail =
        formData.email
          .trim()
          .toLowerCase();

      const customerPhone =
        formData.phone.trim();

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
          customerPhone,
      };

      const functionBody = {
        items:
          checkoutItems,

        customer_name:
          customerName,

        customer_email:
          customerEmail,

        customer_phone:
          customerPhone,

        shipping_address:
          shippingAddress,

        delivery_method:
          deliveryMethod,

        notes:
          formData.notes.trim() ||
          null,

        idempotency_key:
          idempotencyKeyRef.current,
      };

      if (
        paymentMethod === "cod"
      ) {
        const {
          data: codData,
          error: codError,
        } =
          await supabase.functions.invoke(
            "create-cod-order",
            {
              body:
                functionBody,
            }
          );

        if (codError) {
          const errorMessage =
            await getFunctionErrorMessage(
              codError,
              "Unable to place the Cash on Delivery order."
            );

          throw new Error(
            errorMessage
          );
        }

        if (
          !codData?.success ||
          !codData?.order?.id
        ) {
          throw new Error(
            codData?.message ||
              "Unable to place the Cash on Delivery order."
          );
        }

        const savedOrder =
          createSavedOrder(
            codData.order,
            {
              paymentStatus:
                "pending",

              paymentProvider:
                "cash_on_delivery",

              customerEmail,

              customerName,

              deliveryMethod,

              cartCount,

              codCharge:
                COD_CHARGE,
            }
          );

        setOrderPlaced(true);

        clearCart();

        navigate(
          "/order-success",
          {
            replace: true,

            state: {
              order:
                savedOrder,
            },
          }
        );

        return;
      }

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay could not load. Check your internet connection and try again."
        );
      }

      const {
        data: createData,
        error: createError,
      } =
        await supabase.functions.invoke(
          "razorpay-create-order",
          {
            body:
              functionBody,
          }
        );

      if (createError) {
        const errorMessage =
          await getFunctionErrorMessage(
            createError,
            "Unable to start Razorpay payment."
          );

        throw new Error(
          errorMessage
        );
      }

      if (
        !createData?.success ||
        !createData?.key_id ||
        !createData
          ?.razorpay_order_id ||
        !Number(
          createData?.amount
        )
      ) {
        if (
          createData
            ?.checkout_expired
        ) {
          idempotencyKeyRef.current =
            createIdempotencyKey();
        }

        throw new Error(
          createData?.message ||
            "Unable to prepare the secure payment."
        );
      }

      setMessage(
        "Complete your payment in the Razorpay window."
      );

      let paymentFinished =
        false;

      const razorpay =
        new window.Razorpay({
          key:
            createData.key_id,

          amount: Number(
            createData.amount
          ),

          currency:
            createData.currency ||
            "INR",

          name: "Haya",

          description:
            `${cartCount} ${
              cartCount === 1
                ? "item"
                : "items"
            }`,

          order_id:
            createData
              .razorpay_order_id,

          handler: async (
  paymentResponse
) => {
  console.log("🔥 RAZORPAY HANDLER FIRED");
  console.log("🔥 PAYMENT RESPONSE:", paymentResponse);

  paymentFinished = true;

            setMessage(
              "Payment received. Confirming your order..."
            );

            try {

              console.log(
  "🚀 CALLING razorpay-verify-payment..."
);

console.log(
  "🚀 VERIFY PAYLOAD:",
  {
    razorpay_payment_id:
      paymentResponse.razorpay_payment_id,

    razorpay_order_id:
      paymentResponse.razorpay_order_id,

    razorpay_signature:
      paymentResponse.razorpay_signature,
  }
);
              const {
                data:
                  verifyData,

                error:
                  verifyError,
              } =
                await supabase.functions.invoke(
                  "razorpay-verify-payment",
                  {
                    body: {
                      razorpay_payment_id:
                        paymentResponse
                          .razorpay_payment_id,

                      razorpay_order_id:
                        paymentResponse
                          .razorpay_order_id,

                      razorpay_signature:
                        paymentResponse
                          .razorpay_signature,
                    },
                  }
                );

              if (
                verifyError
              ) {
                const errorMessage =
                  await getFunctionErrorMessage(
                    verifyError,
                    "Payment was received, but the order could not be confirmed."
                  );

                throw new Error(
                  errorMessage
                );
              }

              if (
                !verifyData?.success ||
                !verifyData
                  ?.order?.id
              ) {
                throw new Error(
                  verifyData?.message ||
                    "Payment was received, but the order could not be confirmed."
                );
              }

              const paidOrder =
                verifyData.order;

              const savedOrder =
                createSavedOrder(
                  paidOrder,
                  {
                    paymentStatus:
                      "paid",

                    paymentProvider:
                      "razorpay",

                    customerEmail,

                    customerName,

                    deliveryMethod,

                    cartCount,

                    codCharge: 0,
                  }
                );

              setOrderPlaced(
                true
              );

              clearCart();

              navigate(
                "/order-success",
                {
                  replace:
                    true,

                  state: {
                    order:
                      savedOrder,
                  },
                }
              );
            } catch (error) {
              console.error(
                "Payment verification failed:",
                error
              );

              setMessage(
                getCheckoutErrorMessage(
                  error
                )
              );

              setIsSubmitting(
                false
              );
            }
          },

          prefill: {
            name:
              customerName,

            email:
              customerEmail,

            contact:
              customerPhone,
          },

          notes: {
            delivery_method:
              deliveryMethod,
          },

          theme: {
            color:
              "#211c18",
          },

          modal: {
            ondismiss: () => {
              if (
                !paymentFinished
              ) {
                setMessage(
                  "Payment was cancelled. Your bag has not been changed."
                );

                setIsSubmitting(
                  false
                );
              }
            },
          },
        });

      razorpay.on(
        "payment.failed",
        (response) => {
          paymentFinished =
            true;

          const failureMessage =
            response?.error
              ?.description ||
            "Payment failed. Please try again.";

          console.error(
            "Razorpay payment failed:",
            response?.error
          );

          setMessage(
            failureMessage
          );

          setIsSubmitting(
            false
          );
        }
      );

      razorpay.open();
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
          noValidate
          onSubmit={
            handleSubmit
          }
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

              {Object.keys(
                fieldErrors
              ).length > 0 && (
                <div
                  role="alert"
                  className="mt-5 border border-[#9b493f]/30 bg-[#9b493f]/5 px-4 py-3 text-[10px] leading-5 text-[#8f3f37]"
                >
                  Please complete the highlighted fields before continuing.
                </div>
              )}

              <div className="mt-6">
                <label className="block text-[8px] uppercase tracking-[0.17em]">
                  Email Address *
                </label>

                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  aria-invalid={
                    Boolean(
                      fieldErrors.email
                    )
                  }
                  className={getFieldClassName(
                    "email",
                    "h-13 placeholder:text-[#9b9189]"
                  )}
                />

                {fieldErrors.email && (
                  <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                    {
                      fieldErrors.email
                    }
                  </p>
                )}
              </div>
            </section>

            <section className="border-t border-black/10 pt-10">
              <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                Shipping Address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    First Name *
                  </label>

                  <input
                    required
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.firstName
                      )
                    }
                    className={getFieldClassName(
                      "firstName",
                      "h-13"
                    )}
                  />

                  {fieldErrors.firstName && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.firstName
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Last Name *
                  </label>

                  <input
                    required
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.lastName
                      )
                    }
                    className={getFieldClassName(
                      "lastName",
                      "h-13"
                    )}
                  />

                  {fieldErrors.lastName && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.lastName
                      }
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Address *
                  </label>

                  <input
                    required
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Street and house number"
                    aria-invalid={
                      Boolean(
                        fieldErrors.address
                      )
                    }
                    className={getFieldClassName(
                      "address",
                      "h-13 placeholder:text-[#9b9189]"
                    )}
                  />

                  {fieldErrors.address && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.address
                      }
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Apartment, suite, etc.
                  </label>

                  <input
                    type="text"
                    name="apartment"
                    autoComplete="address-line2"
                    value={
                      formData.apartment
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    City *
                  </label>

                  <input
                    required
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.city
                      )
                    }
                    className={getFieldClassName(
                      "city",
                      "h-13"
                    )}
                  />

                  {fieldErrors.city && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.city
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    State *
                  </label>

                  <input
                    required
                    type="text"
                    name="state"
                    autoComplete="address-level1"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.state
                      )
                    }
                    className={getFieldClassName(
                      "state",
                      "h-13"
                    )}
                  />

                  {fieldErrors.state && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.state
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Postal Code *
                  </label>

                  <input
                    required
                    type="text"
                    name="postalCode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={
                      formData.postalCode
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.postalCode
                      )
                    }
                    className={getFieldClassName(
                      "postalCode",
                      "h-13"
                    )}
                  />

                  {fieldErrors.postalCode && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.postalCode
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Country *
                  </label>

                  <select
                    required
                    name="country"
                    autoComplete="country-name"
                    value={
                      formData.country
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.country
                      )
                    }
                    className={getFieldClassName(
                      "country",
                      "h-13"
                    )}
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

                  {fieldErrors.country && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.country
                      }
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Phone Number *
                  </label>

                  <input
                    required
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        fieldErrors.phone
                      )
                    }
                    className={getFieldClassName(
                      "phone",
                      "h-13"
                    )}
                  />

                  {fieldErrors.phone && (
                    <p className="mt-2 text-[9px] leading-4 text-[#9b493f]">
                      {
                        fieldErrors.phone
                      }
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[8px] uppercase tracking-[0.17em]">
                    Order Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      formData.notes
                    }
                    onChange={
                      handleChange
                    }
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

            <section
              id="payment-method-section"
              className="border-t border-black/10 pt-10"
            >
              <div className="flex items-center gap-3">
                <LockKeyhole
                  size={18}
                  strokeWidth={1.3}
                />

                <h2 className="font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
                  Payment
                </h2>
              </div>

              <div className="mt-6 space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-4 border p-5 transition ${
                    paymentMethod ===
                    "razorpay"
                      ? "border-black/45 bg-[#eee7df]"
                      : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={
                      paymentMethod ===
                      "razorpay"
                    }
                    onChange={() => {
                      setPaymentMethod(
                        "razorpay"
                      );

                      setFieldErrors(
                        (current) => {
                          const next = {
                            ...current,
                          };

                          delete next.paymentMethod;

                          return next;
                        }
                      );

                      setMessage("");
                    }}
                    className="mt-0.5"
                  />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em]">
                      Pay Online
                    </p>

                    <p className="mt-2 max-w-xl text-[10px] leading-6 text-[#746960]">
                      Pay securely using Razorpay. Haya does not collect or store your card, UPI, net banking, or wallet details.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-4 border p-5 transition ${
                    paymentMethod ===
                    "cod"
                      ? "border-black/45 bg-[#eee7df]"
                      : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={
                      paymentMethod ===
                      "cod"
                    }
                    onChange={() => {
                      setPaymentMethod(
                        "cod"
                      );

                      setFieldErrors(
                        (current) => {
                          const next = {
                            ...current,
                          };

                          delete next.paymentMethod;

                          return next;
                        }
                      );

                      setMessage("");
                    }}
                    className="mt-0.5"
                  />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em]">
                      Cash on Delivery
                    </p>

                    <p className="mt-2 max-w-xl text-[10px] leading-6 text-[#746960]">
                      Pay in cash when your order is delivered. A ₹100 Cash on Delivery charge applies. Available in India for orders up to ₹5,000.
                    </p>
                  </div>
                </label>

                {fieldErrors.paymentMethod && (
                  <p className="text-[9px] leading-4 text-[#9b493f]">
                    {
                      fieldErrors.paymentMethod
                    }
                  </p>
                )}
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
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        className="aspect-[4/5] h-full w-full object-cover"
                      />

                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211c18] px-1 text-[7px] text-white">
                        {
                          item.quantity
                        }
                      </span>
                    </div>

                    <div className="flex min-w-0 justify-between gap-3">
                      <div>
                        <p className="text-[8px] uppercase leading-[1.5] tracking-[0.12em]">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-2 text-[9px] leading-[1.7] text-[#7d726a]">
                          {
                            item.colour
                          }
                          <br />
                          Size:{" "}
                          {
                            item.size
                          }
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
                <span>
                  Subtotal
                </span>

                <span>
                  {formatCurrency(
                    subtotal
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span>
                  Shipping
                </span>

                <span>
                  {estimatedShippingCost ===
                  0
                    ? "Free"
                    : formatCurrency(
                        estimatedShippingCost
                      )}
                </span>
              </div>

              {paymentMethod ===
                "cod" && (
                <div className="flex items-center justify-between text-[10px]">
                  <span>
                    COD Charge
                  </span>

                  <span>
                    {formatCurrency(
                      estimatedCodCharge
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-[#7b7068]">
                <span>
                  Taxes
                </span>

                <span>
                  Included where applicable
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
              Final prices, stock and totals are verified securely when the order is placed.
            </p>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="mt-7 flex w-full items-center justify-center gap-2 bg-[#211c18] px-5 py-4 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole
                size={13}
                strokeWidth={1.4}
              />

              {isSubmitting
                ? paymentMethod ===
                  "cod"
                  ? "Placing Order..."
                  : "Processing Payment..."
                : paymentMethod ===
                  "cod"
                  ? "Place COD Order"
                  : "Pay Securely"}
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
              {paymentMethod ===
              "cod"
                ? "Inventory is reserved when your Cash on Delivery order is confirmed. A ₹100 COD charge is included in the total."
                : "Inventory is updated only after your Razorpay payment is verified and the order is confirmed."}
            </p>
          </aside>
        </form>
      </section>

      <Footer />
    </main>
  );
}