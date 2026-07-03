import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "modest-store-cart";

function createCartItemId({ productId, variantId }) {
  return `${productId}-${variantId}`;
}

function getSafeQuantity(value, fallback = 1) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 1) {
    return fallback;
  }

  return Math.floor(quantity);
}

function getVariantStock(variant) {
  const stock =
    variant?.stock_quantity ??
    variant?.stockQuantity ??
    variant?.stock ??
    null;

  if (stock === null || stock === undefined) {
    return null;
  }

  const numericStock = Number(stock);

  return Number.isFinite(numericStock)
    ? Math.max(0, numericStock)
    : null;
}

function loadStoredCart() {
  try {
    const savedCart = localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    /*
     * Remove old cart items that do not contain
     * the Supabase variant UUID required by
     * the production checkout RPC.
     */
    return parsedCart
      .filter(
        (item) =>
          item &&
          item.productId &&
          item.variantId
      )
      .map((item) => ({
        ...item,
        quantity: getSafeQuantity(
          item.quantity
        ),
        price:
          Number(item.price) || 0,
        originalPrice:
          item.originalPrice === null ||
          item.originalPrice === undefined
            ? null
            : Number(
                item.originalPrice
              ),
        availableStock:
          item.availableStock === null ||
          item.availableStock === undefined
            ? null
            : Number(
                item.availableStock
              ),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}) {
  const [cartItems, setCartItems] =
    useState(loadStoredCart);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addToCart = useCallback(
    ({
      product,
      variant,
      colour,
      size,
      quantity = 1,
      openDrawer = true,
    }) => {
      if (!product) {
        console.error(
          "Cannot add item: product is missing."
        );
        return;
      }

      const variantId =
        variant?.id ?? null;

      /*
       * The production checkout requires the
       * exact Supabase product_variants UUID.
       */
      if (!variantId) {
        console.error(
          "Cannot add item: Supabase variant ID is missing.",
          {
            product,
            variant,
            colour,
            size,
          }
        );

        return;
      }

      if (!colour || !size) {
        console.error(
          "Cannot add item: colour or size is missing."
        );
        return;
      }

      const requestedQuantity =
        getSafeQuantity(quantity);

      const availableStock =
        getVariantStock(variant);

      const tracksInventory =
        variant?.track_inventory ??
        variant?.trackInventory ??
        true;

      const allowsBackorder =
        variant?.allow_backorder ??
        variant?.allowBackorder ??
        false;

      if (
        tracksInventory &&
        !allowsBackorder &&
        availableStock !== null &&
        availableStock < 1
      ) {
        console.error(
          "Cannot add item: variant is out of stock."
        );
        return;
      }

      const quantityToAdd =
        tracksInventory &&
        !allowsBackorder &&
        availableStock !== null
          ? Math.min(
              requestedQuantity,
              availableStock
            )
          : requestedQuantity;

      const cartItemId =
        createCartItemId({
          productId: product.id,
          variantId,
        });

      const itemPrice =
        variant?.price ??
        product.base_price ??
        product.basePrice ??
        product.price ??
        0;

      const itemOriginalPrice =
        variant?.compare_at_price ??
        variant?.compareAtPrice ??
        variant?.originalPrice ??
        product.compare_at_price ??
        product.compareAtPrice ??
        product.originalPrice ??
        null;

      const colourOption =
        product.colourOptions?.find(
          (option) =>
            option.name === colour
        ) ??
        product.colorOptions?.find(
          (option) =>
            option.name === colour
        );

      const itemImage =
        variant?.image_url ??
        variant?.imageUrl ??
        variant?.image ??
        colourOption?.images?.[0] ??
        product.image_url ??
        product.imageUrl ??
        product.image ??
        product.images?.[0]?.public_url ??
        product.images?.[0]?.url ??
        product.images?.[0] ??
        "";

      const colourId =
        variant?.color_id ??
        variant?.colour_id ??
        variant?.colorId ??
        variant?.colourId ??
        colourOption?.id ??
        null;

      setCartItems(
        (currentItems) => {
          const existingItem =
            currentItems.find(
              (item) =>
                item.cartItemId ===
                cartItemId
            );

          if (existingItem) {
            const nextQuantity =
              getSafeQuantity(
                existingItem.quantity
              ) + quantityToAdd;

            const finalQuantity =
              tracksInventory &&
              !allowsBackorder &&
              availableStock !== null
                ? Math.min(
                    nextQuantity,
                    availableStock
                  )
                : nextQuantity;

            return currentItems.map(
              (item) =>
                item.cartItemId ===
                cartItemId
                  ? {
                      ...item,
                      quantity:
                        finalQuantity,
                      price:
                        Number(
                          itemPrice
                        ) || 0,
                      availableStock,
                    }
                  : item
            );
          }

          return [
            ...currentItems,
            {
              cartItemId,

              productId: product.id,
              variantId,

              sku:
                variant?.sku ??
                null,

              slug:
                product.slug ??
                null,

              name:
                product.name ??
                "Product",

              price:
                Number(itemPrice) ||
                0,

              originalPrice:
                itemOriginalPrice ===
                  null ||
                itemOriginalPrice ===
                  undefined
                  ? null
                  : Number(
                      itemOriginalPrice
                    ),

              currency:
                product.currency ??
                "INR",

              image: itemImage,

              colour,
              colourId,

              size,

              quantity:
                quantityToAdd,

              availableStock,

              trackInventory:
                tracksInventory,

              allowBackorder:
                allowsBackorder,
            },
          ];
        }
      );

      if (openDrawer) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const removeFromCart =
    useCallback((cartItemId) => {
      setCartItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.cartItemId !==
              cartItemId
          )
      );
    }, []);

  const updateQuantity =
    useCallback(
      (cartItemId, quantity) => {
        const nextQuantity =
          Number(quantity);

        if (
          !Number.isFinite(
            nextQuantity
          ) ||
          nextQuantity < 1
        ) {
          setCartItems(
            (currentItems) =>
              currentItems.filter(
                (item) =>
                  item.cartItemId !==
                  cartItemId
              )
          );

          return;
        }

        setCartItems(
          (currentItems) =>
            currentItems.map((item) => {
              if (
                item.cartItemId !==
                cartItemId
              ) {
                return item;
              }

              const normalizedQuantity =
                Math.floor(
                  nextQuantity
                );

              const shouldLimitStock =
                item.trackInventory !==
                  false &&
                item.allowBackorder !==
                  true &&
                item.availableStock !==
                  null &&
                item.availableStock !==
                  undefined;

              return {
                ...item,
                quantity:
                  shouldLimitStock
                    ? Math.min(
                        normalizedQuantity,
                        Number(
                          item.availableStock
                        )
                      )
                    : normalizedQuantity,
              };
            })
        );
      },
      []
    );

  const clearCart =
    useCallback(() => {
      setCartItems([]);
    }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          getSafeQuantity(
            item.quantity
          ),
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          (Number(item.price) ||
            0) *
            getSafeQuantity(
              item.quantity
            ),
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      subtotal,
      isCartOpen,

      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,

      openCart: () =>
        setIsCartOpen(true),

      closeCart: () =>
        setIsCartOpen(false),

      toggleCart: () =>
        setIsCartOpen(
          (current) => !current
        ),
    }),
    [
      cartItems,
      cartCount,
      subtotal,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}