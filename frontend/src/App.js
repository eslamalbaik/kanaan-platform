import './App.css';
import HomePage from './components/pages/HomePage/HomePage'; 
import ProductsPage from './components/pages/ProductsPage/ProductsPage';
import ProductDetails from './components/pages/ProductDetails/ProductDetails';
import AboutPage from './components/pages/AboutPage/AboutPage';
import ContactPage from './components/pages/ContactPage/ContactPage';
import MainLayout from './components/layouts/MainLayout';
import UserProfilePage from './components/pages/UserProfilePage/UserProfile';
import Signup from './components/pages/SignupPage/SignupPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage/ForgotPasswordPage';
import NewPasswordPage from './components/pages/NewPasswordPage/NewPasswordPage';
import OTPPage from './components/pages/OTPPage/OTPPage';
import CartPage from './components/pages/CartPage/CartPage'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';
import useScrollToTop from './hooks/ScrollToTop';

import AdminLayout from './components/layouts/AdminLayout/AdminLayout';
import DashboardOverview from './components/pages/AdminPages/DashboardOverview/DashboardOverview';
import CategoryManagement from './components/pages/AdminPages/CategoryManagement/CategoryManagement';
import ProductManagement from './components/pages/AdminPages/ProductManagement/ProductManagement';
import OrderManagement from './components/pages/AdminPages/OrderManagement/OrderManagement';
import CustomerManagement from './components/pages/AdminPages/CustomerManagement/CustomerManagement';
import AdminProfile from './components/pages/AdminPages/AdminProfile/AdminProfile';
import CouponManagement from './components/pages/AdminPages/CouponManagement/CouponManagement';
import AdminLogin from './components/pages/AdminPages/AdminLogin/AdminLogin';
import CheckoutPage from './components/pages/CheckoutPage/CheckoutPage';
import CustomizePage from './components/pages/CustomizePage/CustomizePage';
import AIAssistantPage from './components/pages/AIAssistantPage/AIAssistantPage';
import { useAuth } from './context/AuthContext';

import { Outlet, Navigate } from 'react-router-dom';
function UserStoreLayout() {
  return (
    <MainLayout>
      <Outlet /> 
    </MainLayout>
  );
}

function AdminGuard() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

function CustomerGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Outlet />;
}

function AppContent() {
  useScrollToTop();

  return (
    <Routes>
      
      <Route element={<UserStoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/c" element={<AIAssistantPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route element={<CustomerGuard />}>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
        <Route element={<CustomerGuard />}>
          <Route path="/customize/:productId" element={<CustomizePage />} />
        </Route>
        <Route element={<CustomerGuard />}>
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
      </Route>
      
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<NewPasswordPage />} />
      <Route path="/otp" element={<OTPPage />} />
      
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Route>
      
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <AppContent />
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
