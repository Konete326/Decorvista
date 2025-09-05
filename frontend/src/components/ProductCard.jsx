import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    const result = await addToCart(product._id);
    if (result.success) {
      // You could add a toast notification here
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={product.images?.[0] || '/api/placeholder/400/400'}
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-indigo-600">${product.price}</span>
            {product.inventory > 0 ? (
              <button
                onClick={handleAddToCart}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
              >
                Add to Cart
              </button>
            ) : (
              <span className="text-red-500 text-sm">Out of Stock</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="mt-2 flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'stroke-current'}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
