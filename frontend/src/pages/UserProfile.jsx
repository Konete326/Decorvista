import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userProfileAPI, reviewAPI } from '../services/api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    consultation: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    bio: '',
    phone: '',
    preferredStyles: [],
    roomTypes: []
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;
  const canReview = isAuthenticated && !isOwnProfile && user?.role === 'designer';

  useEffect(() => {
    // If no userId from params and user is authenticated, use current user's ID
    const targetUserId = userId || user?.id;
    
    if (targetUserId) {
      fetchUserProfile(targetUserId);
      fetchUserReviews(targetUserId);
    } else if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/404');
    }
  }, [userId, user?.id, isAuthenticated]);

  const fetchUserProfile = async (targetUserId) => {
    try {
      const response = await userProfileAPI.getUserProfile(targetUserId);
      setProfile(response.data.data);
      
      // Populate edit form with current profile data
      if (response.data.data) {
        setEditForm({
          name: response.data.data.user.name || '',
          location: response.data.data.location || '',
          bio: response.data.data.bio || '',
          phone: response.data.data.phone || '',
          preferredStyles: response.data.data.preferredStyles || [],
          roomTypes: response.data.data.roomTypes || []
        });
        setImagePreview(response.data.data.user.avatarUrl || null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 404) {
        navigate('/404');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async (targetUserId) => {
    try {
      const response = await userProfileAPI.getUserReviews(targetUserId);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.create({
        targetType: 'user',
        targetId: userId,
        ...reviewForm
      });
      
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', consultation: '' });
      fetchUserReviews();
      fetchUserProfile(); 
      
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s\-\(\)]?[\d\s\-\(\)]{7,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (editForm.phone && !validatePhoneNumber(editForm.phone)) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setUploading(true);
    
    try {
      const targetUserId = userId || user?.id;
      
      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (Array.isArray(editForm[key])) {
          formData.append(key, JSON.stringify(editForm[key]));
        } else {
          formData.append(key, editForm[key]);
        }
      });
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      await userProfileAPI.updateUserProfile(targetUserId, formData);
      
      setShowEditForm(false);
      setProfileImage(null);
      setImagePreview(null);
      fetchUserProfile(targetUserId);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  const handleStyleToggle = (style) => {
    setEditForm(prev => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(style)
        ? prev.preferredStyles.filter(s => s !== style)
        : [...prev.preferredStyles, style]
    }));
  };

  const handleRoomTypeToggle = (roomType) => {
    setEditForm(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(roomType)
        ? prev.roomTypes.filter(r => r !== roomType)
        : [...prev.roomTypes, roomType]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">This user hasn't completed their profile yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
            {profile.user.avatarUrl ? (
              <img
                src={profile.user.avatarUrl}
                alt={profile.user.name || 'User'}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-semibold text-2xl">${profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                }}
              />
            ) : (
              <span className="text-indigo-600 font-semibold text-2xl">
                {profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>
                <p className="text-gray-600">{profile.location}</p>
                {profile.phone && (
                  <p className="text-gray-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profile.phone}
                  </p>
                )}
                {profile.rating > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(profile.rating) ? 'fill-current' : 'stroke-current'}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {profile.rating.toFixed(1)} ({profile.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {(isOwnProfile || (!userId && isAuthenticated)) && (
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
                {canReview && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Write Review
                  </button>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-700 mt-4">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      {profile.preferences && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Design Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.preferences.style?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Preferred Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.style.map((style, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.preferences.budget && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Budget Range</h3>
                <p className="text-gray-700">
                  ${profile.preferences.budget.min?.toLocaleString()} - ${profile.preferences.budget.max?.toLocaleString()}
                </p>
              </div>
            )}
            {profile.preferences.roomTypes?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Room Types</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.roomTypes.map((room, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {room}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project History */}
      {profile.projectHistory?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project History</h2>
          <div className="space-y-4">
            {profile.projectHistory.map((project, index) => (
              <div key={index} className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-medium text-gray-900">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Completed: {new Date(project.completedDate).toLocaleDateString()}</span>
                  {project.budget && <span>Budget: ${project.budget.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                      {review.author.avatarUrl ? (
                        <img
                          src={review.author.avatarUrl}
                          alt={review.author.name || 'User'}
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
                      <p className="font-medium">{review.author.name}</p>
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
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit}>
              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">
                        {editForm.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImage"
                      className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-block"
                    >
                      Choose Image
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div></div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Styles
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Modern', 'Traditional', 'Minimalist', 'Industrial', 'Scandinavian', 'Bohemian'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleToggle(style)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        editForm.preferredStyles.includes(style)
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'].map(roomType => (
                    <button
                      key={roomType}
                      type="button"
                      onClick={() => handleRoomTypeToggle(roomType)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        editForm.roomTypes.includes(roomType)
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {roomType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
