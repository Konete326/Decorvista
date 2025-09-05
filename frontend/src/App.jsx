import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ConsultationProvider } from './context/ConsultationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Gallery from './pages/Gallery';
import Designers from './pages/Designers';
import DesignerProfile from './pages/DesignerProfile';
import BookConsultation from './pages/BookConsultation';
import CompleteProfile from './pages/CompleteProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminProducts from './pages/AdminProducts';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ConsultationProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="designers" element={<Designers />} />
                <Route path="designers/:id" element={<DesignerProfile />} />
                <Route 
                  path="cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="complete-profile" 
                  element={
                    <ProtectedRoute roles={['designer']}>
                      <CompleteProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="book-consultation/:designerId" 
                  element={
                    <ProtectedRoute>
                      <BookConsultation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/products" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminProducts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
          </ConsultationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
