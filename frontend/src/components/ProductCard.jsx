import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { favoriteAPI } from '../services/api';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isSaved, setIsSaved] = useState(false);
  const [savedItems, setSavedItems] = useState(new Set());

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Restrict admin from adding to cart
    if (user?.role === 'admin') {
      alert('Admins cannot purchase products. Only users and designers can make purchases.');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      // You could add a toast notification here
    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  // Load saved items from localStorage on component mount
  useEffect(() => {
    const loadSavedItems = () => {
      try {
        const saved = localStorage.getItem('savedProducts');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedItems(new Set(Array.isArray(parsed) ? parsed : []));
          setIsSaved(Array.isArray(parsed) && parsed.includes(product._id));
        }
      } catch (error) {
        console.error('Error loading saved items:', error);
      }
    };

    loadSavedItems();
  }, [product._id]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSavedItems(prevSavedItems => {
      const newSavedItems = new Set(prevSavedItems);
      
      if (newSavedItems.has(product._id)) {
        newSavedItems.delete(product._id);
        setIsSaved(false);
      } else {
        newSavedItems.add(product._id);
        setIsSaved(true);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('savedProducts', JSON.stringify(Array.from(newSavedItems)));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      return newSavedItems;
    });
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0].startsWith('http') ? product.images[0] : `/uploads/${product.images[0]}`}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0E5QjQiLz4KPHBhdGggZD0iTTE1MCAyMDBMMjAwIDE1MEwyNTAgMjAwVjI1MEgxNTBWMjAwWiIgZmlsbD0iIzlDQTlCNCIvPgo8L3N2Zz4K';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">No Image</p>
              </div>
            </div>
          )}
          
          {/* Save button */}
          <button
            onClick={toggleSave}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform ${
              isSaved 
                ? 'bg-blue-500/90 text-white shadow-md' 
                : 'bg-white/80 text-gray-700 hover:bg-white/90 hover:scale-110'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            <svg
              className="w-4 h-4"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={isSaved ? 0 : 1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </button>
          
          {/* Stock indicator */}
          {product.inventory === 0 ? (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          ) : product.category?.name && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                {product.category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 mb-1">
              {product.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
            
            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  ${product.price?.toFixed(2) || '0.00'}
                </p>
                {product.originalPrice > product.price && (
                  <p className="text-xs text-gray-500 line-through">
                    ${product.originalPrice?.toFixed(2) || '0.00'}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={product.inventory === 0}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  product.inventory === 0
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200'
                }`}
              >
                {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            
            {/* Stock info */}
            <div className="mt-2 flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                product.inventory > 10 ? 'bg-green-400' : 
                product.inventory > 0 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                product.inventory > 10 ? 'text-green-600' : 
                product.inventory > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {product.inventory > 10 ? 'In Stock' : 
                 product.inventory > 0 ? `Only ${product.inventory} left` : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
