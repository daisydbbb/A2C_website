import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminPage } from "./pages/AdminPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { AccountPage } from "./pages/AccountPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { UserRole } from "./types";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.OWNER]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute allowedRoles={[UserRole.OWNER]}>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute allowedRoles={[UserRole.OWNER]}>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
