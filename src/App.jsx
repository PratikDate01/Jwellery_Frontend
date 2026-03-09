import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Public Pages
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));

// Dashboard Pages
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard'));
const CustomerDashboard = React.lazy(() => import('./pages/customer/CustomerDashboard'));
const SupplierDashboard = React.lazy(() => import('./pages/supplier/SupplierDashboard'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));

// Profile Redirect Helper
const ProfileRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'CUSTOMER') return <Navigate to="/" replace />;
  
  const role = user.role?.toLowerCase();
  return <Navigate to={`/dashboard/${role}`} replace />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="collections" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected Shopping Routes */}
            <Route path="cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="payment/:orderId" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={<ProfileRedirect />} />

            {/* Dashboard Routes */}
            <Route path="dashboard/customer" element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard/supplier" element={
              <ProtectedRoute allowedRoles={['SUPPLIER']}>
                <SupplierDashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
