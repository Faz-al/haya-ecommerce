import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const OrderContext = createContext(null);

function formatOrder(databaseOrder) {
  const shippingAddress =
    databaseOrder.shipping_address || {};

  const items = (
    databaseOrder.order_items || []
  ).map((item) => ({
    cartItemId: item.id,

    productId:
      item.product_id || null,

    variantId:
      item.variant_id || null,

    slug:
      item.product_slug || null,

    name:
      item.product_name ||
      "Product",

    image:
      item.image_url ||
      item.product_image ||
      "",

    price: Number(
      item.unit_price || 0
    ),

    originalPrice: null,

    colour:
      item.selected_color ||
      null,

    size:
      item.selected_size ||
      null,

    variantTitle:
      item.variant_title ||
      null,

    sku:
      item.sku || null,

    quantity: Number(
      item.quantity || 0
    ),

    lineTotal: Number(
      item.line_total || 0
    ),
  }));

  const calculatedItemCount =
    items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  return {
    id: databaseOrder.id,

    orderNumber:
      databaseOrder.order_number,

    order_number:
      databaseOrder.order_number,

    createdAt:
      databaseOrder.created_at,

    created_at:
      databaseOrder.created_at,

    updatedAt:
      databaseOrder.updated_at,

    updated_at:
      databaseOrder.updated_at,

    status:
      databaseOrder.status ||
      "pending",

    paymentStatus:
      databaseOrder.payment_status ||
      "pending",

    payment_status:
      databaseOrder.payment_status ||
      "pending",

    fulfillmentStatus:
      databaseOrder.fulfillment_status ||
      "unfulfilled",

    fulfillment_status:
      databaseOrder.fulfillment_status ||
      "unfulfilled",

    paymentMethod:
      databaseOrder.payment_method ||
      null,

    paymentReference:
      databaseOrder.payment_reference ||
      null,

    email:
      databaseOrder.customer_email ||
      databaseOrder.email ||
      "",

    customerEmail:
      databaseOrder.customer_email ||
      databaseOrder.email ||
      "",

    customerName:
      databaseOrder.customer_name ||
      "",

    customerPhone:
      databaseOrder.customer_phone ||
      "",

    shippingAddress,

    deliveryMethod:
      databaseOrder.delivery_method ||
      shippingAddress.deliveryMethod ||
      "standard",

    items,

    itemCount: Number(
      databaseOrder.item_count ??
        calculatedItemCount
    ),

    subtotal: Number(
      databaseOrder.subtotal || 0
    ),

    shippingCost: Number(
      databaseOrder.shipping_cost ??
        databaseOrder.shipping_amount ??
        0
    ),

    shipping_cost: Number(
      databaseOrder.shipping_cost ??
        databaseOrder.shipping_amount ??
        0
    ),

    discountAmount: Number(
      databaseOrder.discount_amount ||
        0
    ),

    discount_amount: Number(
      databaseOrder.discount_amount ||
        0
    ),

    total: Number(
      databaseOrder.total ??
        databaseOrder.total_amount ??
        0
    ),

    currency:
      databaseOrder.currency ||
      "INR",

    notes:
      databaseOrder.notes ||
      "",

    stockRestoredAt:
      databaseOrder.stock_restored_at ||
      null,

    stock_restored_at:
      databaseOrder.stock_restored_at ||
      null,
  };
}

export function OrderProvider({
  children,
}) {
  const [orders, setOrders] =
    useState([]);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(true);

  const [
    ordersError,
    setOrdersError,
  ] = useState("");

  const fetchOrders =
    useCallback(async () => {
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setOrders([]);
          return [];
        }

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
              stock_restored_at,
              created_at,
              updated_at,
              order_items (
                id,
                product_id,
                variant_id,
                product_name,
                product_slug,
                product_image,
                selected_color,
                selected_size,
                variant_title,
                sku,
                image_url,
                quantity,
                unit_price,
                line_total
              )
            `
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (error) {
          throw error;
        }

        const formattedOrders = (
          data || []
        ).map(formatOrder);

        setOrders(
          formattedOrders
        );

        return formattedOrders;
      } catch (error) {
        console.error(
          "Failed to load Supabase orders:",
          error
        );

        setOrders([]);

        setOrdersError(
          error.message ||
            "Unable to load your orders."
        );

        return [];
      } finally {
        setOrdersLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchOrders();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        () => {
          fetchOrders();
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  /*
   * Checkout now uses the secure
   * public.place_order() RPC directly.
   *
   * This legacy function remains only to
   * prevent older components from crashing.
   */
  const addOrder =
    useCallback(async () => {
      throw new Error(
        "Direct order creation is disabled. Use the secure checkout flow."
      );
    }, []);

  const removeOrder =
    useCallback(() => {
      console.warn(
        "Customers cannot delete submitted orders."
      );

      return false;
    }, []);

  const clearOrders =
    useCallback(() => {
      console.warn(
        "Customers cannot clear submitted orders."
      );

      return false;
    }, []);

  const value = useMemo(
    () => ({
      orders,

      orderCount:
        orders.length,

      ordersLoading,

      ordersError,

      fetchOrders,

      addOrder,

      removeOrder,

      clearOrders,
    }),
    [
      orders,
      ordersLoading,
      ordersError,
      fetchOrders,
      addOrder,
      removeOrder,
      clearOrders,
    ]
  );

  return (
    <OrderContext.Provider
      value={value}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context =
    useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders must be used inside OrderProvider"
    );
  }

  return context;
}