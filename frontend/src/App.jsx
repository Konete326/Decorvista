import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import SkipLink from './components/ui/SkipLink';
import LazyWrapper from './components/ui/LazyWrapper';
import ErrorBoundary from './components/ErrorBoundary';
import { useSocket } from './hooks/useSocket';
import { loadUser } from './store/slices/authSlice';

// Lazy loaded components for code splitting
import * as LazyComponents from './utils/lazyComponents';
import UserProfile from './pages/UserProfile';
import CompleteUserProfile from './pages/CompleteUserProfile';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // Initialize user authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  
  // Initialize socket connection
  useSocket();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        <SkipLink />
        <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LazyWrapper><LazyComponents.Home /></LazyWrapper>} />
                <Route path="login" element={<LazyWrapper><LazyComponents.Login /></LazyWrapper>} />
                <Route path="register" element={<LazyWrapper><LazyComponents.Register /></LazyWrapper>} />
                <Route path="products" element={<LazyWrapper><LazyComponents.Products /></LazyWrapper>} />
                <Route path="products/:id" element={<LazyWrapper><LazyComponents.ProductDetail /></LazyWrapper>} />
                <Route path="gallery" element={<LazyWrapper><LazyComponents.Gallery /></LazyWrapper>} />
                <Route path="designers" element={<LazyWrapper><LazyComponents.Designers /></LazyWrapper>} />
                <Route path="designers/:id" element={<LazyWrapper><LazyComponents.DesignerProfile /></LazyWrapper>} />
                <Route path="contact" element={<LazyWrapper><LazyComponents.Contact /></LazyWrapper>} />
                <Route path="about" element={<LazyWrapper><LazyComponents.About /></LazyWrapper>} />
                
                {/* User Activity Routes */}
                <Route 
                  path="my-activity" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.MyActivity /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="my-reviews" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.MyReviews /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="my-gallery" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.MyGallery /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="cart" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.Cart /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.Dashboard /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="homeowner/dashboard" 
                  element={
                    <ProtectedRoute roles={['homeowner']}>
                      <LazyWrapper><LazyComponents.Dashboard /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <LazyWrapper><LazyComponents.AdvancedAdminPanel /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="consultations" 
                  element={
                    <ProtectedRoute roles={['designer']}>
                      <LazyWrapper><LazyComponents.ConsultationManagement /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="complete-profile" 
                  element={
                    <ProtectedRoute roles={['designer']}>
                      <LazyWrapper><LazyComponents.CompleteProfile /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="complete-user-profile" 
                  element={
                    <ProtectedRoute roles={['homeowner']}>
                      <CompleteUserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="designer-dashboard" 
                  element={
                    <ProtectedRoute roles={['designer']}>
                      <LazyWrapper><LazyComponents.DesignerDashboard /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="designer/dashboard" 
                  element={
                    <ProtectedRoute roles={['designer']}>
                      <LazyWrapper><LazyComponents.DesignerDashboard /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="user/:userId" 
                  element={<UserProfile />} 
                />
                <Route 
                  path="book-consultation/:designerId" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.BookConsultation /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="checkout" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.Checkout /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/products" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <LazyWrapper><LazyComponents.AdminProducts /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/contacts" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <LazyWrapper><LazyComponents.AdminContactManagement /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/add-gallery" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <LazyWrapper><LazyComponents.AddGalleryItem /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="favorites" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.Favorites /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="thank-you" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper><LazyComponents.ThankYou /></LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="404" 
                  element={<LazyWrapper><LazyComponents.NotFound /></LazyWrapper>} 
                />
                <Route 
                  path="*" 
                  element={<LazyWrapper><LazyComponents.NotFound /></LazyWrapper>} 
                />
              </Route>
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
