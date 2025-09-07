import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { designerAPI, uploadAPI } from '../services/api';
import { useSelector, useDispatch } from 'react-redux';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    professionalTitle: '',
    bio: '',
    specialties: [],
    location: '',
    hourlyRate: '',
    phone: ''
  });
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [existingPortfolio, setExistingPortfolio] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [existingProfileImage, setExistingProfileImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing designer profile for editing
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const res = await designerAPI.getMe();
        const existing = res?.data?.data;
        console.log('Existing designer data:', existing); // Debug log
        if (existing?._id) {
          console.log('Phone from designer:', existing.phone);
          console.log('Phone from user:', existing.user?.phone);
          
          const phoneValue = existing.phone || existing.user?.phone || '';
          console.log('Final phone value:', phoneValue);
          
          setFormData({
            professionalTitle: existing.professionalTitle || '',
            bio: existing.bio || '',
            specialties: existing.specialties || [],
            location: existing.location || '',
            hourlyRate: existing.hourlyRate || '',
            phone: phoneValue
          });
          
          // Set existing profile image
          setExistingProfileImage(existing.user?.avatarUrl || '');
          console.log('Setting existing profile image:', existing.user?.avatarUrl);
          
          // Convert availabilitySlots to availability format for the form
          const existingSlots = existing.availabilitySlots || [];
          const groupedAvailability = existingSlots.reduce((acc, slot) => {
            const dateStr = new Date(slot.date).toISOString().split('T')[0];
            if (!acc[dateStr]) {
              acc[dateStr] = { date: dateStr, slots: [] };
            }
            acc[dateStr].slots.push(slot.from);
            return acc;
          }, {});
          
          setAvailability(Object.values(groupedAvailability));
          
          // Set existing portfolio images
          if (existing.portfolio && existing.portfolio.length > 0) {
            setExistingPortfolio(existing.portfolio);
          }
        }
      } catch (err) {
        console.log('Error loading profile:', err);
        // No existing profile, continue with empty form
      }
    };
    loadExistingProfile();
  }, []);

  const specialtyOptions = ['Modern', 'Traditional', 'Minimalist', 'Industrial', 'Scandinavian', 'Bohemian', 'Contemporary'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.includes(specialty)
        ? formData.specialties.filter(s => s !== specialty)
        : [...formData.specialties, specialty]
    });
  };

  const handlePortfolioChange = (e) => {
    setPortfolioFiles([...e.target.files]);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { date: '', slots: [''] }]);
  };

  const updateAvailabilityDate = (index, date) => {
    const updated = [...availability];
    updated[index].date = date;
    setAvailability(updated);
  };

  const updateAvailabilitySlot = (dateIndex, slotIndex, time) => {
    const updated = [...availability];
    updated[dateIndex].slots[slotIndex] = time;
    setAvailability(updated);
  };

  const addTimeSlot = (dateIndex) => {
    const updated = [...availability];
    updated[dateIndex].slots.push('');
    setAvailability(updated);
  };

  const removeExistingImage = (index) => {
    const updated = [...existingPortfolio];
    updated.splice(index, 1);
    setExistingPortfolio(updated);
  };

  const removeAvailabilitySlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Client-side validation to avoid server 400s
      const errors = [];
      if (!formData.professionalTitle?.trim()) errors.push('Professional title is required');
      if (!formData.location?.trim()) errors.push('Location is required');
      if (!formData.bio || formData.bio.trim().length < 10) errors.push('Bio must be at least 10 characters');
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) errors.push('Hourly rate must be a non-negative number');

      if (errors.length > 0) {
        alert(errors[0]);
        setLoading(false);
        return;
      }

      let portfolioImages = [];
      let profileImageUrl = '';
      
      // Upload profile image if provided
      if (profileImage) {
        const profileUploadResponse = await uploadAPI.single(profileImage);
        profileImageUrl = profileUploadResponse.data.data?.url || profileUploadResponse.data.data;
      }
      
      if (portfolioFiles.length > 0) {
        const uploadResponse = await uploadAPI.multiple(portfolioFiles);
        const uploaded = uploadResponse.data.data || [];
        // Normalize to { url, caption } objects expected by backend
        portfolioImages = uploaded.map((item) => ({ url: (item?.url ?? item), caption: '' }));
      }

      const profileData = {
        bio: formData.bio,
        specialties: formData.specialties,
        location: formData.location,
        professionalTitle: formData.professionalTitle,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        portfolio: [...existingPortfolio, ...portfolioImages],
        phone: formData.phone,
        profileImage: profileImageUrl,
        availabilitySlots: availability
          .filter(slot => slot.date && slot.slots.some(s => s))
          .flatMap(slot => 
            slot.slots
              .filter(time => time)
              .map(time => ({
                date: new Date(slot.date),
                from: time,
                to: time,
                status: 'available'
              }))
          )
      };

      // Check if profile exists to determine create vs update
      try {
        const existingRes = await designerAPI.getMe();
        if (existingRes?.data?.data?._id) {
          // Update existing profile
          await designerAPI.update(existingRes.data.data._id, profileData);
          alert('Profile updated successfully!');
        } else {
          // Create new profile
          await designerAPI.create(profileData);
          alert('Profile created successfully!');
        }
      } catch (checkError) {
        // If getMe fails, assume no profile exists and create
        await designerAPI.create(profileData);
        alert('Profile created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      const msg = error?.response?.data?.errors?.[0]?.msg
        || error?.response?.data?.message
        || 'Failed to create profile';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {formData.professionalTitle ? 'Update Your Designer Profile' : 'Complete Your Designer Profile'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          {/* Profile Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <div className="flex items-center space-x-4">
              {(existingProfileImage || profileImage) ? (
                <div className="relative">
                  <img
                    src={profileImage ? URL.createObjectURL(profileImage) : existingProfileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      console.log('Image load error:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setExistingProfileImage('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-upload"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {existingProfileImage || profileImage ? 'Change Image' : 'Upload Image'}
                </label>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
              <input
                type="text"
                name="professionalTitle"
                required
                value={formData.professionalTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Senior Interior Designer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                required
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              required
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell clients about your experience, approach, and what makes you unique..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Specialties</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specialtyOptions.map(specialty => (
              <label key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="mr-2"
                />
                {specialty}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Images</h2>
          
          {/* Display existing portfolio images */}
          {existingPortfolio.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Portfolio Images:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {existingPortfolio.map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={item.url}
                      alt={item.caption || `Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                    {item.caption && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{item.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePortfolioChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            {existingPortfolio.length > 0 
              ? `You have ${existingPortfolio.length} existing images. Upload additional images or replace existing ones.`
              : 'Upload up to 10 images showcasing your best work'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Availability</h2>
            <button
              type="button"
              onClick={addAvailabilitySlot}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Add Date
            </button>
          </div>
          {availability.map((slot, dateIndex) => (
            <div key={dateIndex} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="date"
                  value={slot.date}
                  onChange={(e) => updateAvailabilityDate(dateIndex, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeAvailabilitySlot(dateIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                {slot.slots.map((time, slotIndex) => (
                  <div key={slotIndex} className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateAvailabilitySlot(dateIndex, slotIndex, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTimeSlot(dateIndex)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
          >
            Skip for Now
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (formData.professionalTitle ? 'Update Profile' : 'Complete Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;
