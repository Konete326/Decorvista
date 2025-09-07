import React, { useState, useEffect } from 'react';
import { consultationAPI } from '../services/api';
import { useSelector } from 'react-redux';

const ConsultationManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationAPI.getAll();
      setConsultations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      setActionLoading(true);
      await consultationAPI.updateStatus(consultationId, { status: newStatus });
      
      // Update local state
      setConsultations(prev => 
        prev.map(consultation => 
          consultation._id === consultationId 
            ? { ...consultation, status: newStatus }
            : consultation
        )
      );
      
      // Close modal if open
      if (selectedConsultation?._id === consultationId) {
        setSelectedConsultation(prev => ({ ...prev, status: newStatus }));
      }
      
      alert(`Consultation ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating consultation status:', error);
      alert('Failed to update consultation status');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedConsultation(null);
    setShowDetailsModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Consultation Management</h1>
        <p className="text-gray-600 mt-2">Manage your consultation requests and appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {consultations.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {consultations.filter(c => c.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{consultations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Consultations</h2>
        </div>
        
        {consultations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No consultations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultations.map((consultation) => (
                  <tr key={consultation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {consultation.homeowner?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.homeowner?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.homeowner?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {consultation.slot?.date ? new Date(consultation.slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consultation.slot?.from || 'N/A'} - {consultation.slot?.to || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                        {consultation.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailsModal(consultation)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                      {consultation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(consultation._id, 'confirmed')}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(consultation._id, 'cancelled')}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {consultation.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(consultation._id, 'completed')}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Consultation Details</h3>
                <button
                  onClick={closeDetailsModal}
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
                {/* Client Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {selectedConsultation.homeowner?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{selectedConsultation.homeowner?.name || 'Unknown User'}</h4>
                    <p className="text-gray-600">{selectedConsultation.homeowner?.email}</p>
                    {selectedConsultation.homeowner?.phone && (
                      <p className="text-gray-600">Phone: {selectedConsultation.homeowner.phone}</p>
                    )}
                  </div>
                </div>

                {/* Consultation Details */}
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
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedConsultation.status)}`}>
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

                {/* Project Details */}
                {selectedConsultation.notes && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Project Details</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedConsultation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedConsultation._id, 'confirmed');
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept Consultation
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedConsultation._id, 'cancelled');
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Consultation
                    </button>
                  </>
                )}
                {selectedConsultation.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedConsultation._id, 'completed');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark as Completed
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

export default ConsultationManagement;
