import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { userAPI } from '../services/api';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ page: currentPage, limit: 10 });
      setUsers(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await userAPI.updateStatus(userId, { isActive: !currentStatus });
      if (response.data.success) {
        fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      designer: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (isActive) => {
    const active = isActive !== false; // treat undefined as active
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <>
      {loading && users.length === 0 ? (
        <tr>
          <td colSpan="4" className="px-6 py-4 text-center text-neutral-500">
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </td>
        </tr>
      ) : users.length === 0 ? (
        <tr>
          <td colSpan="4" className="px-6 py-4 text-center text-neutral-500">
            No users found
          </td>
        </tr>
      ) : (
        users.map(user => (
          <tr key={user._id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={`http://localhost:5000${user.avatarUrl}`}
                        alt={user.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-gray-600 font-medium">${user.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                  <div className="text-sm text-neutral-500">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                {user.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(user)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleStatusToggle(user._id, user.isActive !== false)}
                  className={`px-3 py-1 rounded text-xs ${
                    (user.isActive !== false)
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {user.isActive !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </td>
          </tr>
        ))
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedUser.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.isActive)}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Designer Information (if applicable) */}
              {selectedUser.role === 'designer' && selectedUser.designerInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Designer Information</h3>
                  <div className="space-y-2">
                    {selectedUser.designerInfo.bio && (
                      <div>
                        <p className="text-sm text-gray-600">Bio</p>
                        <p className="font-medium">{selectedUser.designerInfo.bio}</p>
                      </div>
                    )}
                    {selectedUser.designerInfo.specialties && (
                      <div>
                        <p className="text-sm text-gray-600">Specialties</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.designerInfo.specialties.map((specialty, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedUser.designerInfo.hourlyRate && (
                      <div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                        <p className="font-medium">${selectedUser.designerInfo.hourlyRate}/hour</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminUserManagement;
