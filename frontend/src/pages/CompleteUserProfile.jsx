import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userProfileAPI } from '../services/api';

const CompleteUserProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    avatarUrl: '',
    preferences: {
      style: [],
      budget: { min: '', max: '' },
      roomTypes: []
    },
    socialLinks: {
      instagram: '',
      pinterest: '',
      website: ''
    }
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const styleOptions = [
    'Modern', 'Traditional', 'Contemporary', 'Minimalist', 'Industrial',
    'Scandinavian', 'Bohemian', 'Rustic', 'Art Deco', 'Mid-Century Modern'
  ];

  const roomTypeOptions = [
    'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room',
    'Home Office', 'Nursery', 'Basement', 'Outdoor Space'
  ];

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const response = await userProfileAPI.getMyProfile();
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setExistingProfile(profile);
        setFormData({
          bio: profile.bio || '',
          location: profile.location || '',
          avatarUrl: profile.user?.avatarUrl || '',
          preferences: {
            style: profile.preferences?.style || [],
            budget: {
              min: profile.preferences?.budget?.min || '',
              max: profile.preferences?.budget?.max || ''
            },
            roomTypes: profile.preferences?.roomTypes || []
          },
          socialLinks: {
            instagram: profile.socialLinks?.instagram || '',
            pinterest: profile.socialLinks?.pinterest || '',
            website: profile.socialLinks?.website || ''
          }
        });
        setAvatarPreview(profile.user?.avatarUrl || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStyleToggle = (style) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        style: prev.preferences.style.includes(style)
          ? prev.preferences.style.filter(s => s !== style)
          : [...prev.preferences.style, style]
      }
    }));
  };

  const handleRoomTypeToggle = (roomType) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        roomTypes: prev.preferences.roomTypes.includes(roomType)
          ? prev.preferences.roomTypes.filter(r => r !== roomType)
          : [...prev.preferences.roomTypes, roomType]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = formData.avatarUrl;
      
      // Upload avatar if file is selected
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', avatarFile);
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/upload/single`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          avatarUrl = uploadResult.data.url;
        }
      }

      const profileData = {
        ...formData,
        avatarUrl,
        preferences: {
          ...formData.preferences,
          budget: {
            min: formData.preferences.budget.min ? parseInt(formData.preferences.budget.min) : undefined,
            max: formData.preferences.budget.max ? parseInt(formData.preferences.budget.max) : undefined
          }
        }
      };

      await userProfileAPI.updateMyProfile(profileData);
      
      alert(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {existingProfile ? 'Update Your Profile' : 'Complete Your Profile'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-indigo-600 font-semibold text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about yourself and your design preferences..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Design Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Preferences</h3>
            
            {/* Preferred Styles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Styles (select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleStyleToggle(style)}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      formData.preferences.style.includes(style)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    name="preferences.budget.min"
                    value={formData.preferences.budget.min}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Minimum budget"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="preferences.budget.max"
                    value={formData.preferences.budget.max}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Maximum budget"
                  />
                </div>
              </div>
            </div>

            {/* Room Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Types of Interest (select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {roomTypeOptions.map((roomType) => (
                  <button
                    key={roomType}
                    type="button"
                    onClick={() => handleRoomTypeToggle(roomType)}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      formData.preferences.roomTypes.includes(roomType)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {roomType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://instagram.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pinterest
                </label>
                <input
                  type="url"
                  name="socialLinks.pinterest"
                  value={formData.socialLinks.pinterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://pinterest.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteUserProfile;
