import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { designerAPI, consultationAPI } from '../services/api';
import { useSelector } from 'react-redux';

const Designers = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userConsultations, setUserConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    specialty: ''
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDesigners();
      if (user?.role === 'homeowner') {
        fetchUserConsultations();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, user]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await designerAPI.getAll(filters);
      
      const fetchedDesigners = response.data.data || [];
      
      // Filter out current user if they are a designer
      const filteredDesigners = fetchedDesigners.filter(designer => {
        const isCurrentUser = user && designer.user?._id === user._id;
        return !isCurrentUser;
      });
      
      // Sort designers by rating (highest first), then by name
      const sortedDesigners = filteredDesigners.sort((a, b) => {
        // First sort by rating (descending) - use averageRating instead of rating
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        // If ratings are equal, sort by name (ascending)
        return (a.user?.name || '').localeCompare(b.user?.name || '');
      });
      
      setDesigners(sortedDesigners);
    } catch (error) {
      console.error('Error fetching designers:', error);
      if (error.response?.status === 429) {
        // If rate limited, retry after a longer delay
        setTimeout(() => fetchDesigners(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConsultations = async () => {
    try {
      // Add a small delay to prevent rapid successive calls
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await consultationAPI.getAll();
      setUserConsultations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      // Don't throw error to prevent cascading failures
    }
  };

  const getDesignerBookingStatus = (designerId) => {
    const consultation = userConsultations.find(c => 
      c.designer._id === designerId && 
      c.status !== 'completed' && 
      c.status !== 'cancelled'
    );
    return consultation;
  };

  const openConsultationModal = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  const closeConsultationModal = () => {
    setSelectedConsultation(null);
    setShowConsultationModal(false);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Interior Designers</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter city or area..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <select
              name="specialty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.specialty}
              onChange={handleFilterChange}
            >
              <option value="">All Specialties</option>
              <option value="Modern">Modern</option>
              <option value="Traditional">Traditional</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Industrial">Industrial</option>
              <option value="Scandinavian">Scandinavian</option>
            </select>
          </div>
        </div>
      </div>

      {/* Designers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : designers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No designers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map(designer => (
            <div key={designer._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Designer Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    {designer.user?.avatarUrl ? (
                      <img 
                        src={`http://localhost:5000${designer.user.avatarUrl}`}
                        alt={designer.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          console.log('Designer card image error:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${designer.user?.avatarUrl ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {designer.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{designer.user?.name}</h3>
                    <p className="text-gray-600 font-medium">{designer.professionalTitle || 'Interior Designer'}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-indigo-600 font-bold text-lg">${designer.hourlyRate || 0}/hr</span>
                      {designer.location && (
                        <span className="ml-3 text-gray-500 text-sm">📍 {designer.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Specialties */}
              {designer.specialties?.length > 0 && (
                <div className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {designer.specialties.slice(0, 4).map(specialty => (
                      <span key={specialty} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {specialty}
                      </span>
                    ))}
                    {designer.specialties.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{designer.specialties.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Bio */}
              <div className="px-6 pb-4">
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                  {designer.bio || 'Professional interior designer with years of experience creating beautiful spaces.'}
                </p>
              </div>

              {/* Portfolio Preview */}
              {designer.portfolio?.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {designer.portfolio.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.url || item.image}
                        alt={item.caption || `Portfolio ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          console.log('Portfolio preview image error:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                    {designer.portfolio.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-600">+{designer.portfolio.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => navigate(`/designers/${designer._id}`)}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Profile
                  </button>
                  {user?.role === 'homeowner' && (() => {
                    const booking = getDesignerBookingStatus(designer._id);
                    if (booking) {
                      return (
                        <button 
                          onClick={() => openConsultationModal(booking)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Booking
                        </button>
                      );
                    } else {
                      return (
                        <button 
                          onClick={() => navigate(`/book-consultation/${designer._id}`)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Book Now
                        </button>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center ${selectedConsultation.designer?.user?.avatarUrl ? 'hidden' : 'flex'}`}>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designers;
