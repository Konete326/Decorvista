import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import AdminOrderManagement from '../AdminOrderManagement';
import AdminUserManagement from '../AdminUserManagement';
import AdminCategoryManagement from '../AdminCategoryManagement';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdvancedAdminPanel = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [pendingDesigners, setPendingDesigners] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingConsultations: 0,
    monthlyGrowth: 0,
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingDesigners, setLoadingDesigners] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadPendingDesigners();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await adminAPI.getReports();
      const data = res?.data?.data || {};
      setAnalytics({
        totalUsers: data.users?.total ?? 0,
        totalOrders: data.orders ?? 0,
        totalRevenue: data.revenue ?? 0,
        pendingConsultations: data.consultations?.pending ?? 0,
        monthlyGrowth: 0,
      });
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadPendingDesigners = async () => {
    try {
      setLoadingDesigners(true);
      const res = await adminAPI.getPendingDesigners();
      setPendingDesigners(res?.data?.data || []);
    } catch (err) {
      console.error('Failed to load pending designers', err);
    } finally {
      setLoadingDesigners(false);
    }
  };

  const tabs = [
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'orders', name: 'Order Management', icon: ShoppingBagIcon },
    { id: 'designers', name: 'Designer Approvals', icon: CalendarDaysIcon },
    { id: 'categories', name: 'Categories', icon: TagIcon },
  ];

  // Sync active tab with URL "tab" param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  const approveDesigner = async (designerId) => {
    try {
      await adminAPI.approveDesigner(designerId);
      setPendingDesigners(prev => prev.filter(d => d._id !== designerId));
    } catch (error) {
      console.error('Error approving designer:', error);
      alert('Failed to approve designer');
    }
  };

  const rejectDesigner = async (designerId) => {
    try {
      const reason = 'Not a fit';
      await adminAPI.rejectDesigner(designerId, { reason });
      setPendingDesigners(prev => prev.filter(d => d._id !== designerId));
    } catch (error) {
      console.error('Error rejecting designer:', error);
      alert('Failed to reject designer');
    }
  };

  const AnalyticsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-primary-100">
            <UserGroupIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-600">Total Users</p>
            <p className="text-2xl font-semibold text-neutral-900">{loadingAnalytics ? '...' : analytics.totalUsers}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-success-100">
            <ShoppingBagIcon className="w-6 h-6 text-success-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-600">Total Orders</p>
            <p className="text-2xl font-semibold text-neutral-900">{loadingAnalytics ? '...' : analytics.totalOrders}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-accent-100">
            <ChartBarIcon className="w-6 h-6 text-accent-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-600">Revenue</p>
            <p className="text-2xl font-semibold text-neutral-900">{loadingAnalytics ? '...' : `$${analytics.totalRevenue}`}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-warning-100">
            <CalendarDaysIcon className="w-6 h-6 text-warning-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-600">Pending Consultations</p>
            <p className="text-2xl font-semibold text-neutral-900">{loadingAnalytics ? '...' : analytics.pendingConsultations}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const DesignerApprovalsTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pending Designer Applications</h3>
      {loadingDesigners ? (
        <div className="py-8 flex justify-center"><LoadingSpinner /></div>
      ) : pendingDesigners.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">No pending applications</p>
      ) : (
        <div className="space-y-4">
          {pendingDesigners.map((designer) => (
            <div key={designer._id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{designer.user.name}</h4>
                  <p className="text-sm text-neutral-600">{designer.user.email}</p>
                  <p className="text-sm text-neutral-500 mt-1">{designer.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {designer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDesigner(designer);
                      setShowDesignerModal(true);
                    }}
                    aria-label={`View ${designer.user.name} details`}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => approveDesigner(designer._id)}
                    aria-label={`Approve ${designer.user.name}`}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => rejectDesigner(designer._id)}
                    aria-label={`Reject ${designer.user.name}`}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const UserManagementTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">User Management</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            <AdminUserManagement />
          </tbody>
        </table>
      </div>
    </Card>
  );

  const CategoriesTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Category Management</h3>
      <AdminCategoryManagement />
    </Card>
  );

  const OrderManagementTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Management</h3>
      <AdminOrderManagement />
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsTab />;
      case 'users':
        return <UserManagementTab />;
      case 'orders':
        return <OrderManagementTab />;
      case 'designers':
        return <DesignerApprovalsTab />;
      case 'categories':
        return <CategoriesTab />;
      default:
        return <AnalyticsTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-600 mt-2">Manage your DecorVista platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Admin navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <main role="main">
        {renderTabContent()}
      </main>

      {/* Designer Detail Modal */}
      <Modal
        isOpen={showDesignerModal}
        onClose={() => setShowDesignerModal(false)}
        title="Designer Application Details"
        size="lg"
      >
        {selectedDesigner && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedDesigner.user.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedDesigner.user.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedDesigner.user.phone || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {selectedDesigner.location || 'Not provided'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Bio</h4>
              <p className="text-sm text-neutral-600">{selectedDesigner.bio}</p>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDesigner.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {selectedDesigner.portfolio && selectedDesigner.portfolio.length > 0 && (
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Portfolio</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDesigner.portfolio.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={item.url}
                        alt={item.caption || `Portfolio item ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {item.caption && (
                        <p className="text-sm text-neutral-600">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDesignerModal(false)}
              >
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  rejectDesigner(selectedDesigner._id);
                  setShowDesignerModal(false);
                }}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  approveDesigner(selectedDesigner._id);
                  setShowDesignerModal(false);
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdvancedAdminPanel;
