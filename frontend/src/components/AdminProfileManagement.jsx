import React, { useState, useEffect } from 'react';
import { userProfileAPI, designerAPI, reviewAPI } from '../services/api';

const AdminProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [userProfiles, setUserProfiles] = useState([]);
  const [designerProfiles, setDesignerProfiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUserProfiles();
    } else if (activeTab === 'designers') {
      fetchDesignerProfiles();
    } else if (activeTab === 'reviews') {
      fetchAllReviews();
    }
  }, [activeTab]);

  const fetchUserProfiles = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in the backend
      const response = await userProfileAPI.getAll();
      setUserProfiles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
      setUserProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignerProfiles = async () => {
    setLoading(true);
    try {
      const response = await designerAPI.getAll();
      setDesignerProfiles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch designer profiles:', error);
      setDesignerProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getAll();
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (profile, type) => {
    setSelectedProfile({ ...profile, type });
    setShowProfileModal(true);
  };

  const renderUserProfiles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">User Profiles ({userProfiles.length})</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : userProfiles.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No user profiles found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfiles.map((profile) => (
            <div key={profile._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.user?.avatarUrl ? (
                    <img
                      src={profile.user.avatarUrl}
                      alt={profile.user?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-semibold text-sm">${profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-indigo-600 font-semibold text-sm">
                      {profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{profile.user?.name}</h4>
                  <p className="text-sm text-gray-500">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(profile.rating) ? 'fill-current' : 'stroke-current'}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile.rating?.toFixed(1) || '0.0'} ({profile.reviewCount || 0})
                  </span>
                </div>
                <button
                  onClick={() => handleViewProfile(profile, 'user')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDesignerProfiles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Designer Profiles ({designerProfiles.length})</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : designerProfiles.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No designer profiles found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designerProfiles.map((profile) => (
            <div key={profile._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.user?.avatarUrl ? (
                    <img
                      src={profile.user.avatarUrl}
                      alt={profile.user?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-semibold text-sm">${profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-indigo-600 font-semibold text-sm">
                      {profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{profile.user?.name}</h4>
                  <p className="text-sm text-gray-500">{profile.professionalTitle}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {profile.specialties?.slice(0, 2).map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                  {profile.specialties?.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{profile.specialties.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(profile.rating) ? 'fill-current' : 'stroke-current'}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    profile.status === 'approved' ? 'bg-green-100 text-green-800' :
                    profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile.status}
                  </span>
                  <button
                    onClick={() => handleViewProfile(profile, 'designer')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">All Reviews ({reviews.length})</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews found</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {review.author?.avatarUrl ? (
                    <img
                      src={review.author.avatarUrl}
                      alt={review.author?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-semibold text-sm">${review.author?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-indigo-600 font-semibold text-sm">
                      {review.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>  
                  <div>
                    <p className="font-medium">{review.author?.name}</p>
                    <p className="text-sm text-gray-500">
                      Reviewed {review.targetType}: {review.targetName || review.targetId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded ${
                    review.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {review.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  {review.consultation && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Consultation Review
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Management</h2>
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-6 ${
              activeTab === 'users'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            User Profiles
          </button>
          <button
            onClick={() => setActiveTab('designers')}
            className={`py-2 px-6 ${
              activeTab === 'designers'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Designer Profiles
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-6 ${
              activeTab === 'reviews'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Reviews
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && renderUserProfiles()}
      {activeTab === 'designers' && renderDesignerProfiles()}
      {activeTab === 'reviews' && renderReviews()}

      {/* Profile Detail Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedProfile.type === 'user' ? 'User' : 'Designer'} Profile Details
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedProfile.user?.avatarUrl ? (
                    <img
                      src={selectedProfile.user.avatarUrl}
                      alt={selectedProfile.user?.name || 'User'}
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-semibold text-lg">${selectedProfile.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-indigo-600 font-semibold text-lg">
                      {selectedProfile.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedProfile.user?.name}</h4>
                  <p className="text-gray-600">{selectedProfile.user?.email}</p>
                  {selectedProfile.type === 'designer' && selectedProfile.professionalTitle && (
                    <p className="text-gray-600">{selectedProfile.professionalTitle}</p>
                  )}
                </div>
              </div>

              {selectedProfile.bio && (
                <div>
                  <h5 className="font-medium mb-2">Bio</h5>
                  <p className="text-gray-700">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.type === 'designer' && selectedProfile.specialties?.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Specialties</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-1">Rating</h5>
                  <p className="text-gray-700">{selectedProfile.rating?.toFixed(1) || '0.0'}/5</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Reviews</h5>
                  <p className="text-gray-700">{selectedProfile.reviewCount || 0}</p>
                </div>
                {selectedProfile.type === 'designer' && (
                  <>
                    <div>
                      <h5 className="font-medium mb-1">Status</h5>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedProfile.status}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Hourly Rate</h5>
                      <p className="text-gray-700">${selectedProfile.hourlyRate || 'Not set'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileManagement;
