import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { designerAPI, reviewAPI, consultationAPI } from '../services/api';
import { useSelector } from 'react-redux';

const DesignerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [designer, setDesigner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [userConsultations, setUserConsultations] = useState([]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [likedItems, setLikedItems] = useState([]);

  useEffect(() => {
    fetchDesigner();
    fetchReviews();
    if (user?.role === 'homeowner') {
      fetchUserConsultations();
    }
  }, [id, user]);

  const fetchDesigner = async () => {
    try {
      const response = await designerAPI.getById(id);
      setDesigner(response.data.data);
    } catch (error) {
      console.error('Failed to fetch designer:', error);
      navigate('/designers');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getAll({ targetId: id, targetType: 'designer' });
      setReviews(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchUserConsultations = async () => {
    try {
      const response = await consultationAPI.getAll();
      setUserConsultations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch user consultations:', error);
    }
  };

  const hasActiveConsultation = () => {
    return userConsultations.some(consultation => 
      consultation.designer._id === id && 
      consultation.status !== 'completed' && 
      consultation.status !== 'cancelled'
    );
  };

  const openPortfolioModal = (item, index) => {
    console.log('Opening portfolio modal:', item, index);
    setSelectedPortfolioItem({ ...item, index });
    setShowPortfolioModal(true);
  };

  const closePortfolioModal = () => {
    setSelectedPortfolioItem(null);
    setShowPortfolioModal(false);
  };

  const toggleLike = (portfolioIndex) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    console.log('Toggling like for index:', portfolioIndex);
    const itemId = `${id}-${portfolioIndex}`;
    setLikedItems(prev => {
      const newLikes = prev.includes(itemId) 
        ? prev.filter(item => item !== itemId)
        : [...prev, itemId];
      console.log('Updated likes:', newLikes);
      return newLikes;
    });
  };

  const isLiked = (portfolioIndex) => {
    const itemId = `${id}-${portfolioIndex}`;
    return likedItems.includes(itemId);
  };

  const handleBookConsultation = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/book-consultation/${id}`, {
      state: { designer, selectedDate, selectedSlot, notes: bookingNotes }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Designer not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 rounded-full overflow-hidden relative">
                {(designer.user?.avatarUrl || designer.profileImage) ? (
                  <img 
                    src={`http://localhost:5000${designer.user?.avatarUrl || designer.profileImage}`}
                    alt={designer.user?.name || 'Designer'}
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      console.log('Profile image error:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center ${(designer.user?.avatarUrl || designer.profileImage) ? 'hidden' : 'flex'}`}>
                  <span className="text-4xl font-bold text-indigo-600">
                    {designer.user?.name?.charAt(0) || 'D'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{designer.user?.name}</h1>
                <p className="text-xl text-gray-600 mb-2">{designer.professionalTitle}</p>
                <p className="text-gray-600 mb-2">{designer.location}</p>
                {(designer.phone || designer.user?.phone) && (
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{designer.phone || designer.user?.phone}</span>
                  </div>
                )}
                {designer.rating > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(designer.rating) ? 'fill-current' : 'stroke-current'}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
                  </div>
                )}
                <p className="text-2xl font-bold text-indigo-600">${designer.hourlyRate}/hour</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 mb-4">{designer.bio}</p>
            {designer.specialties?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {designer.specialties.map(specialty => (
                    <span key={specialty} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {designer.portfolio?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designer.portfolio.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group relative"
                    onClick={() => openPortfolioModal(item, index)}
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={item.url || item.image}
                        alt={item.caption || `Portfolio ${index + 1}`}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          console.log('Portfolio image load error:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-4 relative">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.caption || `Portfolio Item ${index + 1}`}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Like button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(index);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-md border"
                      >
                        <svg 
                          className={`w-4 h-4 ${isLiked(index) ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                          fill={isLiked(index) ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
            {/* Modern Review Form - Only for authenticated users who are not the designer and not admin */}
            {user && user._id !== designer.user?._id && user.role !== 'admin' && (
              <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Share Your Experience</h3>
                    <p className="text-sm text-gray-600">Help others by reviewing this designer</p>
                  </div>
                </div>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const rating = parseInt(formData.get('rating'));
                  const comment = formData.get('comment');
                  
                  if (rating && comment) {
                    try {
                      await reviewAPI.create({
                        targetId: designer._id,
                        targetType: 'designer',
                        rating,
                        comment
                      });
                      
                      // Refresh reviews after successful submission
                      await fetchReviews();
                      
                      // Reset form
                      e.target.reset();
                      
                      // Show success message (optional)
                      alert('Review submitted successfully!');
                    } catch (error) {
                      console.error('Failed to submit review:', error);
                      alert('Failed to submit review. Please try again.');
                    }
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Rate your experience</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="cursor-pointer group">
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            className="sr-only peer"
                            required
                          />
                          <div className="relative">
                            <svg
                              className="w-8 h-8 text-gray-300 peer-checked:text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Your review</label>
                    <textarea
                      name="comment"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Share your experience with this designer..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Modern Reviews Display */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {review.author?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{review.author?.name}</h4>
                            <div className="flex items-center mt-1">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-300 fill-current'}`}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {review.rating}/5 stars
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Review Content */}
                        <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                          <p className="text-gray-700 leading-relaxed italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to share your experience with this designer!</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Show booking section only if user doesn't have active consultation and is not admin */}
          {!hasActiveConsultation() && user?.role !== 'admin' ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>
              
{(designer.availabilitySlots && designer.availabilitySlots.length > 0) || (designer.availability && designer.availability.length > 0) ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose a date</option>
                    {/* Handle both availabilitySlots (backend format) and availability (frontend format) */}
                    {(designer.availabilitySlots || designer.availability || []).map((slot, index) => (
                      <option key={index} value={slot.date}>
                        {new Date(slot.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choose a time</option>
                      {/* Handle both formats for time slots */}
                      {(() => {
                        const slots = designer.availabilitySlots || designer.availability || [];
                        const selectedSlotData = slots.find(slot => slot.date === selectedDate);
                        
                        if (selectedSlotData?.slots) {
                          // Frontend format with slots array
                          return selectedSlotData.slots.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ));
                        } else if (selectedSlotData?.from) {
                          // Backend format with from/to times
                          return (
                            <option value={selectedSlotData.from}>
                              {selectedSlotData.from} - {selectedSlotData.to}
                            </option>
                          );
                        }
                        return null;
                      })()}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your project or specific requirements..."
                  />
                </div>

                <button
                  onClick={handleBookConsultation}
                  disabled={!selectedDate || !selectedSlot}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Consultation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500 mb-4">No availability slots set by designer</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your project or specific requirements..."
                  />
                </div>
                <button
                  onClick={handleBookConsultation}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Request Consultation
                </button>
              </div>
            )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Consultation Booked</h3>
                <p className="text-gray-600 mb-4">You already have an active consultation with this designer.</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View My Consultations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Modal */}
      {showPortfolioModal && selectedPortfolioItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={closePortfolioModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={selectedPortfolioItem.url || selectedPortfolioItem.image}
                  alt={selectedPortfolioItem.caption || 'Portfolio Item'}
                  className="w-full max-h-[60vh] object-contain bg-gray-100"
                />
                
                {/* Like button in modal */}
                <button
                  onClick={() => toggleLike(selectedPortfolioItem.index)}
                  className="absolute top-4 left-4 w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 shadow-lg"
                >
                  <svg 
                    className={`w-6 h-6 ${isLiked(selectedPortfolioItem.index) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                    fill={isLiked(selectedPortfolioItem.index) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedPortfolioItem.caption || `Portfolio Item ${selectedPortfolioItem.index + 1}`}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By {designer.user?.name}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {isLiked(selectedPortfolioItem.index) ? 'Liked' : 'Like this'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedPortfolioItem.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">{selectedPortfolioItem.description}</p>
                  </div>
                )}

                {/* Tags/Categories */}
                {selectedPortfolioItem.tags && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedPortfolioItem.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => toggleLike(selectedPortfolioItem.index)}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isLiked(selectedPortfolioItem.index)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill={isLiked(selectedPortfolioItem.index) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isLiked(selectedPortfolioItem.index) ? 'Liked' : 'Like'}
                  </button>
                  
                  {user && user._id !== designer.user?._id && (
                    <button
                      onClick={() => {
                        closePortfolioModal();
                        navigate(`/book-consultation/${id}`);
                      }}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Consultation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerProfile;
