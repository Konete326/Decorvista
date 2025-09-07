import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await productAPI.getReviews(id);
      console.log('Reviews response:', response.data);
      setReviews(response.data.data.reviews || []);
      
      // Update product rating and review count from reviews response
      if (response.data.data.rating !== undefined) {
        setProduct(prev => ({
          ...prev,
          rating: response.data.data.rating,
          reviewCount: response.data.data.reviewCount
        }));
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Restrict admin from adding to cart
    if (user.role === 'admin') {
      alert('Admins cannot purchase products. Only users and designers can make purchases.');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      navigate('/cart');
    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Restrict admin from buying products
    if (user.role === 'admin') {
      alert('Admins cannot purchase products. Only users and designers can make purchases.');
      return;
    }

    try {
      // Add to cart first
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: quantity 
      })).unwrap();

      // Navigate to checkout with product details
      navigate('/checkout', {
        state: {
          directBuy: true,
          product: {
            ...product,
            quantity: quantity
          }
        }
      });
    } catch (error) {
      alert(error || 'Failed to process buy now');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      console.log('Submitting review data:', reviewData);
      const response = await productAPI.addReview(id, reviewData);
      console.log('Review submission response:', response);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchReviews(); // Refresh reviews
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Review submission error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-white rounded-2xl shadow-xl overflow-hidden group">
              <img
                src={product.images?.[0] || '/api/placeholder/600/600'}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={image}
                      alt={`${product.title} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {product.category?.name || 'Product'}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{product.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating || 0)}
                  <span className="text-lg font-medium text-gray-900">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">({product.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-indigo-600">${product.price}</span>
              <span className="text-lg text-gray-500 line-through">${(product.price * 1.2).toFixed(2)}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                20% OFF
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {user?.role !== 'admin' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border rounded">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.inventory} items available</p>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <div className="mb-6">
                <p className="text-sm text-gray-500">{product.inventory} items available in inventory</p>
              </div>
            )}

            {user?.role !== 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="group relative overflow-hidden bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">
                    {cartLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Buy Now</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-6 lg:space-y-0">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-600 uppercase tracking-wide text-sm">Overall Rating</h5>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-indigo-600">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {renderStars(product.rating || 0)}
                      </div>
                      <span className="text-sm text-gray-500 mt-1">out of 5 stars</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-600 uppercase tracking-wide text-sm">Total Reviews</h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">{product.reviewCount || reviews.length || 0}</span>
                    <span className="text-gray-500">reviews</span>
                  </div>
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Write a Review</span>
                </div>
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-10 p-8 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Share Your Experience</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderStars(reviewData.rating, true, (rating) => 
                      setReviewData({ ...reviewData, rating })
                    )}
                    <span className="ml-3 text-lg font-medium text-gray-700">({reviewData.rating}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your Review
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                    placeholder="Tell others about your experience with this product. What did you like? How was the quality?"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {submittingReview ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      'Publish Review'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-8">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share your experience with this product!</p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Write First Review
                  </button>
                )}
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.user?.avatarUrl || review.user?.avatar ? (
                        <img
                          src={`http://localhost:5000${review.user.avatarUrl || review.user.avatar}`}
                          alt={review.user?.name || 'User'}
                          className="w-14 h-14 rounded-2xl object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-bold text-lg">${review.user?.name?.charAt(0) || 'U'}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-indigo-600 font-bold text-lg">
                          {review.user?.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 text-lg">{review.user?.name || 'Anonymous User'}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Verified Purchase
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center mb-4">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-600">({review.rating}/5)</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
