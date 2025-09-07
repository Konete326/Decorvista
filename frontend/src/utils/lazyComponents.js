import { lazy } from 'react';

// Lazy load pages for code splitting
export const Home = lazy(() => import('../pages/Home'));
export const Products = lazy(() => import('../pages/Products'));
export const ProductDetail = lazy(() => import('../pages/ProductDetail'));
export const Gallery = lazy(() => import('../pages/Gallery'));
export const Designers = lazy(() => import('../pages/Designers'));
export const DesignerProfile = lazy(() => import('../pages/DesignerProfile'));
export const Cart = lazy(() => import('../pages/Cart'));
export const Checkout = lazy(() => import('../pages/Checkout'));
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const BookConsultation = lazy(() => import('../pages/BookConsultation'));
export const CompleteProfile = lazy(() => import('../pages/CompleteProfile'));
export const DesignerDashboard = lazy(() => import('../pages/DesignerDashboard'));
export const AdminProducts = lazy(() => import('../pages/AdminProducts'));
export const Favorites = lazy(() => import('../pages/Favorites'));
export const ThankYou = lazy(() => import('../pages/ThankYou'));
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));
export const Contact = lazy(() => import('../pages/Contact'));
export const About = lazy(() => import('../pages/About'));

// User Activity Pages
export const MyActivity = lazy(() => import('../pages/MyActivity'));
export const MyReviews = lazy(() => import('../pages/MyReviews'));
export const MyGallery = lazy(() => import('../pages/MyGallery'));

// Lazy load admin components
export const AdvancedAdminPanel = lazy(() => import('../components/admin/AdvancedAdminPanel'));
export const AdminContactManagement = lazy(() => import('../components/AdminContactManagement'));
export const AddGalleryItem = lazy(() => import('../pages/AddGalleryItem'));

// Lazy load consultation management
export const ConsultationManagement = lazy(() => import('../pages/ConsultationManagement'));

// Lazy load heavy components
export const NotificationCenter = lazy(() => import('../components/ui/Notification'));
export const NotFound = lazy(() => import('../pages/NotFound'));
