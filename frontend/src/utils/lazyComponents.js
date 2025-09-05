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
export const AdminProducts = lazy(() => import('../pages/AdminProducts'));
export const Favorites = lazy(() => import('../pages/Favorites'));
export const ThankYou = lazy(() => import('../pages/ThankYou'));
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));

// Lazy load admin components
export const AdvancedAdminPanel = lazy(() => import('../components/admin/AdvancedAdminPanel'));

// Lazy load heavy components
export const NotificationCenter = lazy(() => import('../components/ui/Notification'));
