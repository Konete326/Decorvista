import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { consultationAPI } from '../services/api';
import { useSelector } from 'react-redux';

const BookConsultation = () => {
  const { designerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const { designer, selectedDate, selectedSlot, notes } = location.state || {};
  
  const [formData, setFormData] = useState({
    date: selectedDate || '',
    time: selectedSlot || '',
    serviceType: 'online',
    address: '',
    notes: notes || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const consultationData = {
        designer: designerId,
        slot: {
          date: formData.date,
          time: formData.time
        },
        serviceType: formData.serviceType,
        address: formData.address,
        notes: formData.notes,
        phone: formData.phone
      };

      await consultationAPI.create(consultationData);
      alert('Consultation booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  if (!designer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Invalid booking request</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Consultation</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Designer Details</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {designer.user?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{designer.user?.name}</h3>
            <p className="text-gray-600">{designer.professionalTitle}</p>
            <p className="text-indigo-600 font-medium">${designer.hourlyRate}/hour</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <select
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceType"
                  value="online"
                  checked={formData.serviceType === 'online'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Online Consultation
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceType"
                  value="in-person"
                  checked={formData.serviceType === 'in-person'}
                  onChange={handleChange}
                  className="mr-2"
                />
                In-Person Visit
              </label>
            </div>
          </div>

          {formData.serviceType === 'in-person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full address"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your project, requirements, and any specific questions..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookConsultation;
