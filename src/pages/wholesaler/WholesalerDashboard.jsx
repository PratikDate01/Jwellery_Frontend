import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  TrendingUp, IndianRupee, Clock,
  Building2, History, MessageSquare, Settings, ChevronRight,
  AlertCircle, X, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const WholesalerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    product: '',
    quantity: '',
    offered_price: '',
    message: '',
  });
  const navigate = useNavigate();

  const { data: wholesalerData, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['wholesaler-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('analytics/wholesaler/');
        return res.data;
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
        throw err;
      }
    },
    refetchInterval: 10000,
    retry: 3,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['available-products'],
    queryFn: async () => {
      const res = await api.get('products/');
      return res.data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('wholesale/negotiations/', {
        product: formData.product,
        quantity: parseInt(formData.quantity),
        offered_price: parseFloat(formData.offered_price),
        message: formData.message || null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Bulk order request created successfully!');
      setShowOrderModal(false);
      setOrderFormData({
        product: '',
        quantity: '',
        offered_price: '',
        message: '',
      });
      refetch();
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to create order';
      toast.error(msg);
    },
  });

  const analytics = wholesalerData?.stats;
  const recentOrders = wholesalerData?.recent_orders || [];
  const loading = isLoading;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateOrder = () => {
    setShowOrderModal(true);
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!orderFormData.product || !orderFormData.quantity || !orderFormData.offered_price) {
      toast.error('Please fill all required fields');
      return;
    }
    createOrderMutation.mutate(orderFormData);
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'bulk-orders', name: 'Bulk Orders', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'history', name: 'Order History', icon: History },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Wholesale</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Partner Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-slate-500">Welcome back, {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl font-medium text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
            >
              Refresh
            </button>
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user?.name || user?.email}</p>
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Premium Partner</p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Bulk Orders', value: analytics?.total_orders || '0', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Spent', value: `₹${analytics?.total_spent?.toLocaleString?.('en-IN') || '0'}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Negotiations', value: analytics?.active_negotiations || '0', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Status', value: analytics?.is_verified ? 'Verified' : 'Pending', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <stat.icon size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Purchase Analytics</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 days</span>
                </div>
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="text-center">
                    <TrendingUp className="text-slate-300 mx-auto mb-2" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chart visualization loading...</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Recent Orders</h3>
                <div className="space-y-3">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-bold text-slate-900">#{order.id}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{order.status}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-8 font-medium">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bulk-orders' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Bulk Orders</h3>
              <button 
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
              >
                + Create Order
              </button>
            </div>
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-500">No bulk orders yet. Create one to get started!</p>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Available Inventory</h3>
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-500">Browse our complete product catalog here</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Order History</h3>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left font-bold text-slate-600">Order ID</th>
                        <th className="p-3 text-left font-bold text-slate-600">Date</th>
                        <th className="p-3 text-left font-bold text-slate-600">Status</th>
                        <th className="p-3 text-left font-bold text-slate-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-900">#{order.id}</td>
                          <td className="p-3 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">₹{order.net_amount?.toLocaleString?.('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-500">No order history</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm max-w-2xl">
            <h3 className="font-bold text-slate-900 mb-8 text-lg">Account Settings</h3>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name</p>
                <p className="text-sm font-bold text-slate-900">{analytics?.company_name || 'Not set'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">GST Number</p>
                <p className="text-sm font-bold text-slate-900">{analytics?.gst_number || 'Not set'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Verification Status</p>
                <p className="text-sm font-bold text-slate-900">
                  {analytics?.is_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-orange-600">⚠ Pending Verification</span>
                  )}
                </p>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all mt-4">
                Update Business Profile
              </button>
            </div>
          </div>
        )}
      </main>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full">
            <div className="border-b border-slate-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Create Bulk Order</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Product</label>
                <select
                  name="product"
                  value={orderFormData.product}
                  onChange={handleOrderFormChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Stock: {prod.available_quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Required</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={orderFormData.quantity}
                  onChange={handleOrderFormChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Offered Price (per unit)</label>
                <input
                  type="number"
                  name="offered_price"
                  placeholder="Enter your offered price"
                  value={orderFormData.offered_price}
                  onChange={handleOrderFormChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message (Optional)</label>
                <textarea
                  name="message"
                  placeholder="Add any special requirements or notes..."
                  value={orderFormData.message}
                  onChange={handleOrderFormChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesalerDashboard;
