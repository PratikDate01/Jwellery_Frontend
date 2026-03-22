import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Package, 
  Heart, 
  MapPin, 
  User as UserIcon, 
  Settings, 
  ChevronRight,
  Clock,
  ShoppingBag,
  Trash2,
  Edit2,
  Save,
  X,
  Lock,
  ExternalLink,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeImageUrl, safeData } from '../../utils/helpers';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  
  const memberSince = useMemo(() => {
    const d = user?.date_joined ? new Date(user.date_joined) : new Date();
    return d.getFullYear();
  }, []); // Only compute once on mount or when user changes if needed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const response = await api.get('analytics/dashboard/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const orders = dashboardData?.recent_orders || [];
  const wishlist = dashboardData?.wishlist || { items: [] };
  const stats = dashboardData?.stats || {};

  const isOrdersLoading = isDashboardLoading && !orders.length;
  const isWishlistLoading = isDashboardLoading && !wishlist.items?.length;

  const selectedOrder = orders?.find(o => o.id === selectedOrderId);
  const trackingOrder = orders?.find(o => o.id === trackingOrderId);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('accounts/profile/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setIsEditingProfile(false);
      // We might need to refresh the whole page or update AuthContext user if it's not reactive to this
      window.location.reload(); 
    }
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      await api.post(`wishlist/remove/`, { product_id: productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    }
  });

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'tracking', label: 'Tracking', icon: Clock },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Account Info', icon: UserIcon },
    { id: 'settings', label: 'Security', icon: Settings },
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 text-slate-900 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6 bg-white p-8 border border-slate-100 shadow-sm rounded-3xl">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <UserIcon size={32} className="text-blue-600" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome, {user?.name || 'Customer'}</h1>
            <p className="text-slate-500 text-sm">Member since {memberSince}</p>
          </div>
          <div className="flex gap-4">
             <div className="text-center px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
                <p className="text-lg font-bold text-blue-600">{stats.total_orders || 0}</p>
             </div>
             <div className="text-center px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Wishlist</p>
                <p className="text-lg font-bold text-pink-600">{stats.wishlist_count || 0}</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-2 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedOrderId(null);
                  setTrackingOrderId(null);
                }}
                className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-all rounded-2xl ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} />
                  {tab.label}
                </div>
                <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-500 bg-white hover:bg-red-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </aside>

          {/* Content */}
          <main className="flex-grow bg-white border border-slate-100 p-8 md:p-10 rounded-3xl shadow-sm min-h-[500px]">
            {activeTab === 'orders' && !selectedOrder && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
                  <Link to="/shop" className="text-sm font-bold text-blue-600 hover:underline">New Order</Link>
                </div>
                
                {isOrdersLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : orders?.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-slate-100 bg-slate-50/50 p-6 rounded-2xl hover:border-blue-200 transition-all">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Order #</p>
                            <p className="text-sm font-bold text-slate-900">{order.order_number || order.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                            <p className="text-sm font-medium text-slate-700">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Amount</p>
                            <p className="text-sm font-bold text-slate-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                              order.status === 'DELIVERED' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> View Details
                          </button>
                          <button 
                            onClick={() => {
                              setTrackingOrderId(order.id);
                              setActiveTab('tracking');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-blue-600"
                          >
                            Track Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 text-sm font-bold hover:bg-blue-700 transition-all rounded-xl shadow-lg shadow-blue-100">Start Shopping</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && selectedOrder && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">Order {selectedOrder.order_number}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Items</h3>
                      <div className="space-y-4">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 overflow-hidden shrink-0">
                               {item.product_details?.images?.[0]?.image && (
                                 <img src={normalizeImageUrl(item.product_details.images[0].image)} alt={item.product_details.name} className="w-full h-full object-cover" />
                               )}
                            </div>
                            <div className="flex-grow">
                              <p className="text-sm font-bold text-slate-900">{item.product_details?.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-900">₹{parseFloat(item.subtotal).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-bold">₹{parseFloat(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">GST (3%)</span>
                          <span className="font-bold">₹{parseFloat(selectedOrder.tax_amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-base pt-3 border-t border-slate-200">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="font-bold text-blue-600 text-lg">₹{parseFloat(selectedOrder.net_amount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                       <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Status</h3>
                       <p className="text-sm font-medium text-slate-700">{selectedOrder.status}</p>
                       <p className="text-xs text-slate-400 mt-1">Payment: {selectedOrder.payment_status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
                  {!isEditingProfile && (
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</label>
                        <input 
                          type="email" 
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</label>
                        <input 
                          type="text" 
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address</label>
                      <textarea 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-400 min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                      >
                        <Save size={16} /> {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-bold text-slate-900">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Role</p>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">{user?.role}</span>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Address</p>
                      <p className="text-sm font-bold text-slate-900">{user?.address || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'tracking' && (
              <div className="space-y-8">
                <div className="border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-bold text-slate-900">Track Order</h2>
                  <p className="text-xs text-slate-500 mt-1">Real-time status of your luxury pieces</p>
                </div>

                {!trackingOrder ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                    <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">Select an order from the "My Orders" tab to track it.</p>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                    >
                      Go to My Orders
                    </button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                       <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Tracking Active</p>
                          <h3 className="text-2xl font-serif">{trackingOrder.order_number}</h3>
                          <div className="flex gap-8 mt-6">
                             <div>
                                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1">Status</p>
                                <p className="text-xs font-bold">{trackingOrder.status}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1">Estimated Delivery</p>
                                <p className="text-xs font-bold">Within 3-5 Business Days</p>
                             </div>
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Package size={120} />
                       </div>
                    </div>

                    <div className="px-4">
                       <div className="relative">
                          {/* Stepper Line */}
                          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-100"></div>
                          
                          <div className="space-y-12 relative">
                             {[
                               { status: 'PENDING', label: 'Order Placed', desc: 'We have received your order' },
                               { status: 'CONFIRMED', label: 'Processing', desc: 'Your jewellery is being prepared and hallmarked' },
                               { status: 'SHIPPED', label: 'In Transit', desc: 'Your package is on its way via secure courier' },
                               { status: 'DELIVERED', label: 'Delivered', desc: 'Package has been handed over successfully' }
                             ].map((step, idx) => {
                                const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                                const currentIndex = statuses.indexOf(trackingOrder.status);
                                const stepIndex = statuses.indexOf(step.status);
                                const isCompleted = stepIndex <= currentIndex;
                                const isCurrent = step.status === trackingOrder.status;

                                return (
                                   <div key={idx} className="flex gap-6 items-start">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
                                        isCompleted ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-100 text-slate-300'
                                      }`}>
                                         {isCompleted ? <Package size={14} /> : <Clock size={14} />}
                                      </div>
                                      <div className={isCompleted ? 'opacity-100' : 'opacity-40'}>
                                         <h4 className={`text-sm font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-900'}`}>{step.label}</h4>
                                         <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                                         {isCurrent && (
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded tracking-widest animate-pulse">
                                               Current Stage
                                            </span>
                                         )}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="text-blue-600" size={20} />
                          <div>
                             <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Insured Shipping</p>
                             <p className="text-[9px] text-slate-500">Your order is 100% protected against loss or damage.</p>
                          </div>
                       </div>
                       <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Support</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-bold text-slate-900">My Wishlist</h2>
                </div>
                
                {isWishlistLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : wishlist?.items?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.items.map((item) => (
                      <div key={item.id} className="group relative bg-slate-50/50 border border-slate-100 p-6 rounded-3xl flex gap-6 hover:border-pink-200 transition-all">
                        <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 overflow-hidden shrink-0">
                          <img 
                            src={item.product_details?.images?.[0]?.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070"} 
                            alt={item.product_details?.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate mb-1">{item.product_details?.name}</h3>
                          <p className="text-xs text-pink-600 font-bold mb-4">₹{Number(item.product_details?.price).toLocaleString('en-IN')}</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => {
                                api.post('cart/add_item/', { product_id: item.product_details?.id, quantity: 1 })
                                  .then(() => {
                                    toast.success('Added to cart');
                                    removeFromWishlistMutation.mutate(item.product_details?.id);
                                  });
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all"
                            >
                              Add To Cart
                            </button>
                            <button 
                              onClick={() => removeFromWishlistMutation.mutate(item.product_details?.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <Heart size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">Your wishlist is empty.</p>
                    <Link to="/shop" className="inline-block mt-6 text-sm font-bold text-blue-600 hover:underline">Explore Products</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-bold text-slate-900">My Addresses</h2>
                  <button onClick={() => { setActiveTab('profile'); setIsEditingProfile(true); }} className="text-sm font-bold text-blue-600 hover:underline">Manage Address</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-8 rounded-3xl border-2 border-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                       <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Default</span>
                    </div>
                    <MapPin className="text-blue-600 mb-4" size={24} />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Delivery Address</p>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {user?.address || 'No address saved yet. Please update your profile.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-xl">
                 <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-50 pb-6">Security Settings</h2>
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                             <Lock size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">Change Password</p>
                             <p className="text-xs text-slate-500">Update your account password</p>
                          </div>
                       </div>
                       <button className="text-xs font-bold text-blue-600 hover:underline">Update</button>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between opacity-50">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                             <UserIcon size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                             <p className="text-xs text-slate-500">Add an extra layer of security</p>
                          </div>
                       </div>
                       <span className="text-[8px] font-black text-slate-400 border border-slate-300 px-2 py-1 rounded-md uppercase">Coming Soon</span>
                    </div>
                 </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
