import React, { useState, useEffect } from 'react';
import { designerAPI } from '../services/api';

const AdminDesignerManagement = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDesigners();
  }, [filter]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await designerAPI.getAll({ 
        status: filter === 'all' ? undefined : filter 
      });
      setDesigners(response.data.data);
    } catch (error) {
      console.error('Failed to fetch designers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (designerId) => {
    try {
      await designerAPI.update(designerId, { status: 'approved' });
      fetchDesigners();
      alert('Designer approved successfully!');
    } catch (error) {
      alert('Failed to approve designer');
    }
  };

  const handleReject = async (designerId) => {
    try {
      await designerAPI.update(designerId, { status: 'rejected' });
      fetchDesigners();
      alert('Designer rejected successfully!');
    } catch (error) {
      alert('Failed to reject designer');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Designer Management</h2>
      </div>
      
      <div className="p-6">
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            All Designers
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Pending Approval
          </button>
          <button 
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : designers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No designers found</p>
        ) : (
          <div className="space-y-4">
            {designers.map(designer => (
              <div key={designer._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                      {designer.user?.avatarUrl ? (
                        <img
                          src={`http://localhost:5000${designer.user.avatarUrl}`}
                          alt={designer.user?.name || 'Designer'}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-indigo-600 font-bold">${designer.user?.name?.charAt(0) || 'D'}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-indigo-600 font-bold">
                          {designer.user?.name?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{designer.user?.name}</h3>
                      <p className="text-gray-600 text-sm">{designer.professionalTitle}</p>
                      <p className="text-gray-500 text-sm mt-1">{designer.bio?.substring(0, 100)}...</p>
                      <div className="flex space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          designer.status === 'approved' ? 'bg-green-100 text-green-800' :
                          designer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {designer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {designer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(designer._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(designer._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => window.location.href = `/designers/${designer._id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDesignerManagement;
