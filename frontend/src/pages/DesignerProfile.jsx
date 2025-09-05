import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { designerAPI, reviewAPI } from '../services/api';
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

  useEffect(() => {
    fetchDesigner();
    fetchReviews();
  }, [id]);

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
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-indigo-600">
                  {designer.user?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{designer.user?.name}</h1>
                <p className="text-xl text-gray-600 mb-2">{designer.professionalTitle}</p>
                <p className="text-gray-600 mb-4">{designer.location}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {designer.portfolio.map((item, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={item.image || '/api/placeholder/400/300'}
                      alt={item.caption || `Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    {item.caption && (
                      <div className="p-3 bg-gray-50">
                        <p className="text-sm text-gray-700">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'stroke-current'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 font-medium">{review.author?.name}</span>
                      <span className="ml-2 text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>
            
            {designer.availability?.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose a date</option>
                    {designer.availability.map((slot, index) => (
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
                      {designer.availability
                        .find(slot => slot.date === selectedDate)
                        ?.slots?.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
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
              <p className="text-gray-500">No availability slots set by designer</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfile;
