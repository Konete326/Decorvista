import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { designerAPI } from '../services/api';

const Designers = () => {
  const navigate = useNavigate();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    specialty: ''
  });

  useEffect(() => {
    fetchDesigners();
  }, [filters]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await designerAPI.getAll(filters);
      setDesigners(response.data.data);
    } catch (error) {
      console.error('Failed to fetch designers:', error);
    } finally {
      setLoading(false);
    }
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
            <div key={designer._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {designer.user?.name?.charAt(0) || 'D'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{designer.user?.name}</h3>
                  <p className="text-gray-600">{designer.professionalTitle}</p>
                  <p className="text-indigo-600 font-medium">${designer.hourlyRate}/hour</p>
                </div>
              </div>
              
              {designer.specialties?.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {designer.specialties.slice(0, 3).map(specialty => (
                      <span key={specialty} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-gray-700 mb-4 line-clamp-3">{designer.bio}</p>
              
              <button 
                onClick={() => navigate(`/designers/${designer._id}`)}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Designers;
