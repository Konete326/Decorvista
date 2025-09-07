import React, { useState, useEffect } from 'react';
import { consultationAPI, productAPI, orderAPI, favoriteAPI, reviewAPI } from '../services/api';
import { useSelector } from 'react-redux';

const HomeownerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { items: cart } = useSelector((state) => state.cart);
  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultRes, productRes, orderRes, favoriteRes] = await Promise.all([
        consultationAPI.getAll(),
        productAPI.getAll({ limit: 4 }),
        orderAPI.getAll(),
        favoriteAPI.getAll()
      ]);
      
      console.log('Consultations data:', consultRes.data.data);
      setConsultations(consultRes.data.data || []);
      setRecentProducts(productRes.data.data || []);
      setOrders(orderRes.data.data || []);
      setFavorites(favoriteRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConsultationModal = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  const closeConsultationModal = () => {
    setSelectedConsultation(null);
    setShowConsultationModal(false);
  };

  const openReviewModal = () => {
    setShowReviewModal(true);
    setReviewData({ rating: 5, comment: '' });
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewData({ rating: 5, comment: '' });
  };

  const handleReviewSubmit = async () => {
    try {
      setSubmittingReview(true);
      await reviewAPI.create({
        targetType: 'designer',
        targetId: selectedConsultation.designer._id,
        consultation: selectedConsultation._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      alert('Review submitted successfully!');
      closeReviewModal();
      closeConsultationModal();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
      <p className="text-gray-600 mb-8">Here's what's happening with your DecorVista account.</p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Items in Cart</p>
              <p className="text-2xl font-semibold text-gray-900">{cart?.items?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Consultations</p>
              <p className="text-2xl font-semibold text-gray-900">{consultations?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orders?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Saved Items</p>
              <p className="text-2xl font-semibold text-gray-900">{favorites?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="p-6">
            {(orders?.length || 0) === 0 ? (
              <p className="text-gray-500">No orders placed yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <div key={order._id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">Order #{order._id?.substring(0, 8) || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} - {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total?.toFixed(2) || '0.00'}</p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Your Consultations</h2>
          </div>
          <div className="p-6">
            {(consultations?.length || 0) === 0 ? (
              <p className="text-gray-500">No consultations scheduled</p>
            ) : (
              <div className="space-y-4">
                {consultations.slice(0, 3).map(consultation => (
                  <div 
                    key={consultation._id} 
                    className="flex items-center justify-between pb-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => openConsultationModal(consultation)}
                  >
                    <div>
                      <p className="font-medium">{consultation.designer?.user?.name || 'Designer'}</p>
                      <p className="text-sm text-gray-600">
                        {consultation.slot?.date ? new Date(consultation.slot.date).toLocaleDateString() : 'N/A'} at {consultation.slot?.from || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      consultation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {consultation.status || 'unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/products" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
            <svg className="h-8 w-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <p className="font-medium">Browse Products</p>
              <p className="text-sm text-gray-600">Explore our catalog</p>
            </div>
          </a>
          <a href="/designers" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="font-medium">Find Designers</p>
              <p className="text-sm text-gray-600">Book consultations</p>
            </div>
          </a>
          <a href="/gallery" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
            <svg className="h-8 w-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium">View Gallery</p>
              <p className="text-sm text-gray-600">Get inspired</p>
            </div>
          </a>
        </div>
      </div>

      {/* Consultation Details Modal */}
      {showConsultationModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Consultation Details</h3>
                <button
                  onClick={closeConsultationModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Designer Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    {selectedConsultation.designer?.user?.avatarUrl ? (
                      <img 
                        src={`http://localhost:5000${selectedConsultation.designer.user.avatarUrl}`}
                        alt={selectedConsultation.designer.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`fallback-avatar w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center ${selectedConsultation.designer?.user?.avatarUrl ? 'hidden' : 'flex'}`}>
                      <span className="text-2xl font-bold text-indigo-600">
                        {selectedConsultation.designer?.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{selectedConsultation.designer?.user?.name || 'Designer'}</h4>
                    <p className="text-gray-600">{selectedConsultation.designer?.professionalTitle || 'Interior Designer'}</p>
                    <p className="text-indigo-600 font-medium">${selectedConsultation.designer?.hourlyRate || '0'}/hour</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Consultation Date & Time</h5>
                    <p className="text-gray-700">
                      {selectedConsultation.slot?.date ? new Date(selectedConsultation.slot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      {selectedConsultation.slot?.from || 'N/A'} - {selectedConsultation.slot?.to || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Status</h5>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedConsultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedConsultation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedConsultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedConsultation.status || 'unknown'}
                    </span>
                  </div>
                </div>

                {/* Booking Date */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Booked On</h5>
                  <p className="text-gray-700">
                    {selectedConsultation.createdAt ? new Date(selectedConsultation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Project Details</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                {selectedConsultation.designer?.user?.phone && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Designer Contact</h5>
                    <p className="text-gray-700">
                      Phone: {selectedConsultation.designer.user.phone}
                    </p>
                    <p className="text-gray-700">
                      Email: {selectedConsultation.designer.user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConsultationModal}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedConsultation.status === 'pending' && (
                  <button
                    onClick={() => {
                      // Add cancel consultation logic here
                      closeConsultationModal();
                    }}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Cancel Consultation
                  </button>
                )}
                {selectedConsultation.status === 'completed' && (
                  <button
                    onClick={openReviewModal}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Write Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Write Review</h3>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Designer Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative">
                    {selectedConsultation.designer?.user?.avatarUrl ? (
                      <img 
                        src={`http://localhost:5000${selectedConsultation.designer.user.avatarUrl}`}
                        alt={selectedConsultation.designer.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center ${selectedConsultation.designer?.user?.avatarUrl ? 'hidden' : 'flex'}`}>
                      <span className="text-lg font-bold text-indigo-600">
                        {selectedConsultation.designer?.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedConsultation.designer?.user?.name || 'Designer'}</h4>
                    <p className="text-sm text-gray-600">{selectedConsultation.designer?.professionalTitle || 'Interior Designer'}</p>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={`w-8 h-8 ${
                          star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Share your experience with this designer..."
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={submittingReview || !reviewData.comment.trim()}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeownerDashboard;
