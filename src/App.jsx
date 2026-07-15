import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Account from "./pages/Account";
import OrderDetails from "./pages/OrderDetails";
import Auth from "./pages/Auth";
import StaticPage from "./pages/StaticPage";

import Loader from "./components/Loader";
import CartDrawer from "./components/cart/CartDrawer";
import SearchOverlay from "./components/search/SearchOverlay";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import {
  CartProvider,
} from "./context/CartContext";
import {
  SearchProvider,
} from "./context/SearchContext";
import {
  OrderProvider,
} from "./context/OrderContext";
import {
  AuthProvider,
} from "./context/AuthContext";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductCreate from "./pages/admin/AdminProductCreate";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";

import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 900);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />

      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <SearchProvider>
              <AnimatePresence
                mode="wait"
              >
                {loading ? (
                  <Loader
                    key="loader"
                  />
                ) : (
                  <motion.div
                    key="website"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  >
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Home />
                        }
                      />

                      <Route
                        path="/shop"
                        element={
                          <Shop />
                        }
                      />

                      <Route
                        path="/category/:slug"
                        element={
                          <CategoryPage />
                        }
                      />

                      <Route
                        path="/collections/:slug"
                        element={
                          <CategoryPage />
                        }
                      />

                      <Route
                        path="/product/:slug"
                        element={
                          <ProductDetails />
                        }
                      />

                      <Route
                        path="/wishlist"
                        element={
                          <Wishlist />
                        }
                      />

                      <Route
                        path="/cart"
                        element={
                          <Cart />
                        }
                      />

                      <Route
                        path="/checkout"
                        element={
                          <Checkout />
                        }
                      />

                      <Route
                        path="/order-success"
                        element={
                          <OrderSuccess />
                        }
                      />

                      <Route
                        path="/auth"
                        element={
                          <Auth />
                        }
                      />

                      <Route
                        path="/contact"
                        element={
                          <StaticPage
                            pageKey="contact"
                          />
                        }
                      />

                      <Route
                        path="/delivery"
                        element={
                          <StaticPage
                            pageKey="delivery"
                          />
                        }
                      />

                      <Route
                        path="/returns"
                        element={
                          <StaticPage
                            pageKey="returns"
                          />
                        }
                      />

                      <Route
                        path="/size-guide"
                        element={
                          <StaticPage
                            pageKey="size-guide"
                          />
                        }
                      />

                      <Route
                        path="/faqs"
                        element={
                          <StaticPage
                            pageKey="faqs"
                          />
                        }
                      />

                      <Route
                        path="/about"
                        element={
                          <StaticPage
                            pageKey="about"
                          />
                        }
                      />

                      <Route
                        path="/journal"
                        element={
                          <StaticPage
                            pageKey="journal"
                          />
                        }
                      />

                      <Route
                        path="/privacy"
                        element={
                          <StaticPage
                            pageKey="privacy"
                          />
                        }
                      />

                      <Route
                        path="/terms"
                        element={
                          <StaticPage
                            pageKey="terms"
                          />
                        }
                      />

                      <Route
                        path="/cookies"
                        element={
                          <StaticPage
                            pageKey="cookies"
                          />
                        }
                      />

                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <Account />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/account/orders/:orderId"
                        element={
                          <ProtectedRoute>
                            <OrderDetails />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        <Route
                          index
                          element={
                            <AdminDashboard />
                          }
                        />

                        <Route
                          path="products"
                          element={
                            <AdminProducts />
                          }
                        />

                        <Route
                          path="products/new"
                          element={
                            <AdminProductCreate />
                          }
                        />

                        <Route
                          path="products/:productId"
                          element={
                            <AdminProductEdit />
                          }
                        />

                        <Route
                          path="orders"
                          element={
                            <AdminOrders />
                          }
                        />

                        <Route
                          path="orders/:orderId"
                          element={
                            <AdminOrderDetails />
                          }
                        />
                      </Route>

                      <Route
                        path="/collections"
                        element={
                          <Navigate
                            to="/shop"
                            replace
                          />
                        }
                      />

                      <Route
                        path="*"
                        element={
                          <Navigate
                            to="/"
                            replace
                          />
                        }
                      />
                    </Routes>

                    <CartDrawer />
                    <SearchOverlay />
                  </motion.div>
                )}
              </AnimatePresence>
            </SearchProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}