import React, { useState, useEffect } from 'react';
import { consultationAPI, reviewAPI, designerAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DesignerDashboard = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [designerProfile, setDesignerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consultations');
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', from: '', to: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultRes, reviewRes, designerRes] = await Promise.all([
        consultationAPI.getAll(),
        reviewAPI.getAll({ targetType: 'designer' }),
        designerAPI.getMe()
      ]);
      setConsultations(consultRes.data.data);
      setReviews(reviewRes.data.data);
      
      if (designerRes.data.success) {
        setDesignerProfile(designerRes.data.data);
        setPortfolioImages(designerRes.data.data.portfolio || []);
        setAvailabilitySlots(designerRes.data.data.availabilitySlots || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 404) {
        // No designer profile yet
        setDesignerProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id, status) => {
    try {
      await consultationAPI.update(id, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update consultation:', error);
    }
  };

  const handlePortfolioUpload = async (files) => {
    try {
      const uploadResponse = await uploadAPI.multiple(files);
      const newImages = uploadResponse.data.data.map(url => ({ url, caption: '' }));
      const updatedPortfolio = [...portfolioImages, ...newImages];
      const designerId = designerProfile?._id;
      if (!designerId) {
        alert('Please complete your designer profile before uploading portfolio.');
        return;
      }
      await designerAPI.update(designerId, { portfolio: updatedPortfolio });
      setPortfolioImages(updatedPortfolio);
      alert('Portfolio images uploaded successfully!');
    } catch (error) {
      alert('Failed to upload portfolio images');
    }
  };

  const handleAddAvailabilitySlot = async () => {
    if (!newSlot.date || !newSlot.from || !newSlot.to) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const updatedSlots = [...availabilitySlots, newSlot];
      const designerId = designerProfile?._id;
      if (!designerId) {
        alert('Please complete your designer profile first.');
        return;
      }
      await designerAPI.update(designerId, { availabilitySlots: updatedSlots });
      setAvailabilitySlots(updatedSlots);
      setNewSlot({ date: '', from: '', to: '' });
      alert('Availability slot added successfully!');
    } catch (error) {
      alert('Failed to add availability slot');
    }
  };

  const handleRemoveAvailabilitySlot = async (index) => {
    try {
      const updatedSlots = availabilitySlots.filter((_, i) => i !== index);
      const designerId = designerProfile?._id;
      if (!designerId) {
        alert('Please complete your designer profile first.');
        return;
      }
      await designerAPI.update(designerId, { availabilitySlots: updatedSlots });
      setAvailabilitySlots(updatedSlots);
      alert('Availability slot removed successfully!');
    } catch (error) {
      alert('Failed to remove availability slot');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Designer Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Consultations</h3>
          <p className="text-3xl font-bold text-indigo-600">{consultations.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {consultations.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600">
            {reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-2 px-6 ${
                activeTab === 'consultations'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Consultations
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-6 ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-2 px-6 ${
                activeTab === 'portfolio'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-6 ${
                activeTab === 'availability'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-6 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'consultations' && (
            <div>
              {consultations.length === 0 ? (
                <p className="text-gray-500">No consultations yet</p>
              ) : (
                <div className="space-y-4">
                  {consultations.map(consultation => (
                    <div key={consultation._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{consultation.homeowner?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(consultation.slot.date).toLocaleDateString()} at {consultation.slot.time}
                          </p>
                          {consultation.notes && (
                            <p className="mt-2 text-sm">{consultation.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            consultation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {consultation.status}
                          </span>
                          {consultation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateConsultationStatus(consultation._id, 'confirmed')}
                                className="text-green-600 hover:text-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateConsultationStatus(consultation._id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
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
                            <span className="ml-2 text-sm text-gray-600">by {review.author?.name}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Portfolio Management</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Portfolio Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePortfolioUpload(Array.from(e.target.files))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border">
                    <img
                      src={image.url}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={image.caption}
                        onChange={(e) => {
                          const updatedImages = [...portfolioImages];
                          updatedImages[index].caption = e.target.value;
                          setPortfolioImages(updatedImages);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={async () => {
                          const updatedImages = portfolioImages.filter((_, i) => i !== index);
                          const designerId = designerProfile?._id;
                          if (!designerId) {
                            alert('Please complete your designer profile first.');
                            return;
                          }
                          await designerAPI.update(designerId, { portfolio: updatedImages });
                          setPortfolioImages(updatedImages);
                        }}
                        className="mt-2 w-full bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Availability Management</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-3">Add New Availability Slot</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">From</label>
                    <input
                      type="time"
                      value={newSlot.from}
                      onChange={(e) => setNewSlot({ ...newSlot, from: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">To</label>
                    <input
                      type="time"
                      value={newSlot.to}
                      onChange={(e) => setNewSlot({ ...newSlot, to: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddAvailabilitySlot}
                      className="w-full bg-indigo-600 text-white py-1 rounded text-sm hover:bg-indigo-700"
                    >
                      Add Slot
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {availabilitySlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium">
                        {new Date(slot.date).toLocaleDateString()} from {slot.from} to {slot.to}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        slot.status === 'available' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAvailabilitySlot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                {availabilitySlots.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No availability slots set</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Designer Profile</h3>
              <p className="text-gray-600">Profile management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;
