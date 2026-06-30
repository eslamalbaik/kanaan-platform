import React, { lazy, Suspense } from 'react';
import './App.css';
import MainLayout from './components/layouts/MainLayout';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';
import useScrollToTop from './hooks/ScrollToTop';

import AdminLayout from './components/layouts/AdminLayout/AdminLayout';
import { useAuth } from './context/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';

const HomePage = lazy(() => import('./components/pages/HomePage/HomePage'));
const ProductsPage = lazy(() => import('./components/pages/ProductsPage/ProductsPage'));
const ProductDetails = lazy(() => import('./components/pages/ProductDetails/ProductDetails'));
const AboutPage = lazy(() => import('./components/pages/AboutPage/AboutPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage/ContactPage'));
const UserProfilePage = lazy(() => import('./components/pages/UserProfilePage/UserProfile'));
const Signup = lazy(() => import('./components/pages/SignupPage/SignupPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./components/pages/ForgotPasswordPage/ForgotPasswordPage'));
const NewPasswordPage = lazy(() => import('./components/pages/NewPasswordPage/NewPasswordPage'));
const OTPPage = lazy(() => import('./components/pages/OTPPage/OTPPage'));
const CartPage = lazy(() => import('./components/pages/CartPage/CartPage'));
const DashboardOverview = lazy(() => import('./components/pages/AdminPages/DashboardOverview/DashboardOverview'));
const CategoryManagement = lazy(() => import('./components/pages/AdminPages/CategoryManagement/CategoryManagement'));
const ProductManagement = lazy(() => import('./components/pages/AdminPages/ProductManagement/ProductManagement'));
const OrderManagement = lazy(() => import('./components/pages/AdminPages/OrderManagement/OrderManagement'));
const CustomerManagement = lazy(() => import('./components/pages/AdminPages/CustomerManagement/CustomerManagement'));
const AdminProfile = lazy(() => import('./components/pages/AdminPages/AdminProfile/AdminProfile'));
const CouponManagement = lazy(() => import('./components/pages/AdminPages/CouponManagement/CouponManagement'));
const AdminLogin = lazy(() => import('./components/pages/AdminPages/AdminLogin/AdminLogin'));
const CheckoutPage = lazy(() => import('./components/pages/CheckoutPage/CheckoutPage'));
const CustomizePage = lazy(() => import('./components/pages/CustomizePage/CustomizePage'));
const AIAssistantPage = lazy(() => import('./components/pages/AIAssistantPage/AIAssistantPage'));

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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500 font-bold" dir="rtl">جاري التحميل...</div>}>
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
    </Suspense>
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
