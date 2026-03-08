import React, { useState } from 'react';
import api from '../../services/api';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  LayoutDashboard, Package, ListTree, ShoppingCart, 
  Users, Ticket, BarChart3, Settings,
  TrendingUp, IndianRupee, Clock, AlertTriangle,
  Edit, Trash2, CheckCircle, XCircle, Plus, X, Upload, ImageIcon, LogOut,
  FileText, Briefcase, History as LedgerIcon, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  
  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Main dashboard data (Aggregated Overview)
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: async () => {
      const res = await api.get('analytics/dashboard/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard stats don't need to be live every second
    gcTime: 10 * 60 * 1000,
  });

  // Tab-specific queries - only run when tab is active (enabled: activeTab === '...')
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('products/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'products',
    staleTime: 60000,
  });

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('orders/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'orders',
    staleTime: 60000,
  });

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('accounts/admin/users/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'users',
    staleTime: 120000,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('categories/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'collections',
    staleTime: 300000,
  });

  const { data: coupons = [], isLoading: isCouponsLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('coupons/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'coupons',
    staleTime: 300000,
  });

  const { data: supplierProducts = [], isLoading: isSupplierProductsLoading } = useQuery({
    queryKey: ['admin-supplier-products'],
    queryFn: async () => {
      const res = await api.get('products/supplier-products/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'supplier-products',
    staleTime: 60000,
  });

  const { data: purchaseOrders = [], isLoading: isPurchaseOrdersLoading } = useQuery({
    queryKey: ['admin-purchase-orders'],
    queryFn: async () => {
      const res = await api.get('products/purchase-orders/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'purchase-orders',
    staleTime: 60000,
  });

  const { data: stockLedger = [], isLoading: isStockLedgerLoading } = useQuery({
    queryKey: ['admin-stock-ledger'],
    queryFn: async () => {
      const res = await api.get('products/stock-ledger/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'stock-ledger',
    staleTime: 120000,
  });

  const { data: negotiations = [], isLoading: isNegotiationsLoading } = useQuery({
    queryKey: ['admin-negotiations'],
    queryFn: async () => {
      const res = await api.get('wholesale/negotiations/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: activeTab === 'negotiations',
    staleTime: 60000,
  });

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recent_orders || [];
  const lowStockProducts = dashboardData?.low_stock || [];
  
  // Only show the global loader for critical stats and active tab data
  const isTabLoading = 
    (activeTab === 'overview' && isDashboardLoading) ||
    (activeTab === 'products' && isProductsLoading) ||
    (activeTab === 'orders' && isOrdersLoading) ||
    (activeTab === 'users' && isUsersLoading) ||
    (activeTab === 'collections' && isCategoriesLoading) ||
    (activeTab === 'coupons' && isCouponsLoading) ||
    (activeTab === 'supplier-products' && isSupplierProductsLoading) ||
    (activeTab === 'purchase-orders' && isPurchaseOrdersLoading) ||
    (activeTab === 'stock-ledger' && isStockLedgerLoading) ||
    (activeTab === 'negotiations' && isNegotiationsLoading);
    
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting: formSubmitting } } = useForm();

  // Added error tracking for dashboards
  const isCriticalError = 
    (activeTab === 'overview' && !dashboardData && !isDashboardLoading);

  const loading = isTabLoading && !isCriticalError;

  if (isCriticalError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-500 text-sm mb-8">We're having trouble reaching the luxury servers. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-gold-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  const onProductSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Core product data
      formData.append('name', data.name);
      formData.append('price', data.price);
      formData.append('available_quantity', data.available_quantity);
      formData.append('description', data.description || '');
      
      // Handle optional category
      if (data.category) {
        formData.append('category', data.category);
      }
      
      // Boolean fields as strings "true"/"false" for DRF
      formData.append('is_active', data.is_active ? 'true' : 'false');
      
      // Optional jewelry details if they exist in the form
      if (data.purity) formData.append('purity', data.purity);
      if (data.gold_weight) formData.append('gold_weight', data.gold_weight);
      if (data.diamond_clarity) formData.append('diamond_clarity', data.diamond_clarity);
      
      // Handle keep_images (IDs of existing images that were not deleted)
      if (editingProduct) {
        const keepIds = existingImages.map(img => img.id);
        // We can send them as a comma separated string which we handled in serializer.to_internal_value
        formData.append('keep_images', keepIds.join(','));
      }
      
      // Append multiple images - ensure no indexed keys (like uploaded_images[0])
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          if (file instanceof File) {
            formData.append('uploaded_images', file);
          }
        });
      }

      // DO NOT set Content-Type header manually for FormData.
      // Axios will set it automatically with the correct boundary.

      if (editingProduct) {
        const response = await api.patch(`products/${editingProduct.id}/`, formData);
        queryClient.invalidateQueries(['admin-products']);
        toast.success("Product updated!");
      } else {
        const response = await api.post('products/', formData);
        queryClient.invalidateQueries(['admin-products']);
        toast.success("Product added!");
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      reset();
      setImagePreviews([]);
      setSelectedFiles([]);
      setExistingImages([]);
    } catch (error) {
      let errorMessage = "Action failed. Check form data.";
      const errorData = error.response?.data;
      
      if (typeof errorData === 'object' && errorData !== null) {
        const errorEntries = Object.entries(errorData);
        if (errorEntries.length > 0) {
          const [field, value] = errorEntries[0];
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Handle nested errors like {uploaded_images: {0: ["..."]}}
            const firstNestedValue = Object.values(value)[0];
            const msg = Array.isArray(firstNestedValue) ? firstNestedValue[0] : JSON.stringify(firstNestedValue);
            errorMessage = `${fieldName}: ${msg}`;
          } else {
            const msg = Array.isArray(value) ? value[0] : value;
            errorMessage = `${fieldName}: ${msg}`;
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Reset file input value so same file can be selected again
    e.target.value = "";
  };

  const removePreview = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (id) => {
    setExistingImages(existingImages.filter(img => img.id !== id));
  };

  const onCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        const response = await api.patch(`categories/${editingCategory.id}/`, data);
        queryClient.invalidateQueries(['admin-categories']);
        toast.success("Collection updated!");
      } else {
        const response = await api.post('categories/', data);
        queryClient.invalidateQueries(['admin-categories']);
        toast.success("New collection added!");
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      reset();
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const onCouponSubmit = async (data) => {
    try {
      if (editingCoupon) {
        const response = await api.patch(`coupons/${editingCoupon.id}/`, data);
        queryClient.invalidateQueries(['admin-coupons']);
        toast.success("Coupon updated!");
      } else {
        const response = await api.post('coupons/', data);
        queryClient.invalidateQueries(['admin-coupons']);
        toast.success("Coupon created successfully!");
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      reset();
    } catch (error) {
      toast.error("Action failed.");
    }
  };


  const handleUpdateOrderStatus = async (id, currentStatus) => {
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    try {
      await api.patch(`orders/${id}/`, { status: nextStatus });
      toast.success(`Order status updated to ${nextStatus}`);
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['admin-stats']);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      price: product.price || product.selling_price,
      available_quantity: product.available_quantity || product.stock_quantity,
      category: product.category,
      description: product.description,
      is_active: product.is_active !== false && product.is_enabled !== false
    });
    setExistingImages(product.images || []);
    setImagePreviews([]); 
    setSelectedFiles([]);
    setShowProductModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description
    });
    setShowCategoryModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      usage_limit: coupon.usage_limit
    });
    setShowCouponModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`products/${id}/`);
      queryClient.invalidateQueries(['admin-products']);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure? This will delete the collection.")) return;
    try {
      await api.delete(`categories/${id}/`);
      queryClient.invalidateQueries(['admin-categories']);
      toast.success("Collection removed");
    } catch (error) {
      toast.error("Failed to remove collection");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`coupons/${id}/`);
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`accounts/admin/users/${id}/`);
      queryClient.invalidateQueries(['admin-users']);
      toast.success("User deleted successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to delete user";
      toast.error(errorMsg);
    }
  };

  const handleApproveSupplierProduct = async (id) => {
    try {
      await api.post(`products/supplier-products/${id}/approve/`);
      toast.success("Product approved and added to store!");
      queryClient.invalidateQueries(['admin-supplier-products']);
      queryClient.invalidateQueries(['admin-products']);
    } catch (error) {
      toast.error("Approval failed.");
    }
  };

  const handleRejectSupplierProduct = async (id) => {
    const notes = window.prompt("Reason for rejection:");
    if (notes === null) return;
    try {
      await api.post(`products/supplier-products/${id}/reject/`, { notes });
      toast.success("Product rejected.");
      queryClient.invalidateQueries(['admin-supplier-products']);
    } catch (error) {
      toast.error("Rejection failed.");
    }
  };

  const onPOSubmit = async (data) => {
    try {
      await api.post('products/purchase-orders/', {
        product: data.product,
        supplier: data.supplier,
        quantity: parseInt(data.quantity),
        total_cost: parseFloat(data.total_cost),
      });
      queryClient.invalidateQueries(['admin-purchase-orders']);
      setShowPOModal(false);
      reset();
      toast.success("Purchase order created!");
    } catch (error) {
      toast.error("Failed to create purchase order.");
    }
  };

  const handleMarkReceived = async (id) => {
    try {
      await api.post(`products/purchase-orders/${id}/mark_received/`);
      toast.success("PO marked as RECEIVED. Stock updated.");
      queryClient.invalidateQueries(['admin-purchase-orders']);
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['admin-stock-ledger']);
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const handleAcceptNegotiation = async (id) => {
    const response = window.prompt("Admin response (optional):");
    try {
      await api.post(`wholesale/negotiations/${id}/accept/`, { response });
      toast.success("Negotiation accepted!");
      queryClient.invalidateQueries(['admin-negotiations']);
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const handleRejectNegotiation = async (id) => {
    const response = window.prompt("Reason for rejection:");
    if (response === null) return;
    try {
      await api.post(`wholesale/negotiations/${id}/reject/`, { response });
      toast.success("Negotiation rejected.");
      queryClient.invalidateQueries(['admin-negotiations']);
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Stock Management', icon: Package },
    { id: 'categories', name: 'Collections', icon: ListTree },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'purchase-orders', name: 'Purchase Orders', icon: Briefcase },
    { id: 'negotiations', name: 'Negotiations', icon: MessageSquare },
    { id: 'stock-ledger', name: 'Stock Ledger', icon: LedgerIcon },
    { id: 'users', name: 'Customers', icon: Users },
    { id: 'coupons', name: 'Coupons', icon: Ticket },
    { id: 'supplier-products', name: 'Vendor Approvals', icon: Clock },
    { id: 'analytics', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Maison Admin</h1>
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Store Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
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
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-slate-500">Hello, {user?.name || 'Admin'}. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-slate-600">System Live</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Sales', value: `₹${stats?.total_revenue?.toLocaleString('en-IN') || '0'}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Orders', value: stats?.total_orders || '0', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Customers', value: stats?.total_users || '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Total Products', value: stats?.total_products || '0', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <stat.icon size={18} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Recent Orders</h3>
                  <button className="text-blue-600 text-xs font-bold" onClick={() => setActiveTab('orders')}>View All</button>
                </div>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-100">
                            {order.user_email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Order #{order.order_number || order.id}</p>
                            <p className="text-xs text-slate-500">{order.user_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">₹{parseFloat(order.net_amount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">No recent orders found.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Quick Status</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Products Active</span>
                    <span className="text-sm font-bold text-green-600">{products.filter(p => p.is_active).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Out of Stock</span>
                    <span className="text-sm font-bold text-red-500">{products.filter(p => p.available_quantity === 0).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Collections</span>
                    <span className="text-sm font-bold text-blue-600">{categories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-900">Product Inventory</h3>
              <button 
                onClick={() => { reset(); setImagePreviews([]); setSelectedFiles([]); setShowProductModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product Code</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Available Quantity</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.category_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono font-medium text-slate-500">{product.sku}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(product.price || product.selling_price || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${(product.available_quantity || product.stock_quantity || 0) > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {product.available_quantity || product.stock_quantity || 0} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${(product.is_active !== false && product.is_enabled !== false) ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          {(product.is_active !== false && product.is_enabled !== false) ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="py-20 text-center">
                  <Package size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No products in inventory yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... Other tabs ... */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Product Collections</h3>
              <button 
                onClick={() => { reset(); setShowCategoryModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={16} /> Add Collection
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <ListTree size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Order Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-bold text-slate-900">#{order.order_number || order.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900">{order.user_email}</p>
                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(order.net_amount).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 text-lg font-bold text-slate-900">Customers</div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 text-xs font-bold uppercase text-slate-400">User</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-400">Role</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-400">Email</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {u.username?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{u.username}</span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase">{u.role}</td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Discount Coupons</h3>
              <button 
                onClick={() => { reset(); setShowCouponModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={16} /> Create Coupon
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 relative group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditCoupon(coupon)} className="text-slate-300 hover:text-blue-500"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{coupon.code}</div>
                  <div className="text-sm font-bold text-blue-600 mb-4">
                    {coupon.discount_type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Used: {coupon.used_count} / {coupon.usage_limit || '∞'}</span>
                    <span className={coupon.active ? 'text-green-500' : 'text-red-500'}>{coupon.active ? 'Active' : 'Expired'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'supplier-products' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Vendor Product Approvals</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase">
                  {supplierProducts.filter(p => p.status === 'PENDING').length} Pending
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Vendor Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Cost Price</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.category_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(product.price || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4 text-sm text-slate-500">{product.available_quantity} units</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          product.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 
                          product.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {product.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApproveSupplierProduct(product.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectSupplierProduct(product.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {supplierProducts.length === 0 && (
                <div className="py-20 text-center">
                  <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No vendor products to review.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchase-orders' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Purchase Orders</h3>
              <button 
                onClick={() => { reset(); setShowPOModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> Create PO
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">PO ID</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Supplier</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Qty</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Cost</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-900">#PO-{po.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-900">{po.product_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{po.product_sku}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{po.supplier_email}</td>
                      <td className="p-4 text-sm font-medium text-slate-900">{po.quantity}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(po.total_cost).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          po.status === 'RECEIVED' ? 'bg-green-50 text-green-600' : 
                          po.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {po.status === 'PENDING' && (
                          <button 
                            onClick={() => handleMarkReceived(po.id)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-green-700"
                          >
                            Mark Received
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchaseOrders.length === 0 && (
                <div className="py-20 text-center">
                  <Briefcase size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No purchase orders found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'negotiations' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Wholesale Negotiations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Wholesaler</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Qty</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Offered Price</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {negotiations.map(neg => (
                    <tr key={neg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-900">{neg.wholesaler_name}</td>
                      <td className="p-4 text-sm text-slate-600">{neg.product_name}</td>
                      <td className="p-4 text-sm font-medium text-slate-900">{neg.quantity}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(neg.offered_price).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          neg.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' : 
                          neg.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {neg.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {neg.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleAcceptNegotiation(neg.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-green-700">Accept</button>
                            <button onClick={() => handleRejectNegotiation(neg.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700">Reject</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {negotiations.length === 0 && (
                <div className="py-20 text-center">
                  <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No negotiations found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stock-ledger' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Stock Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Adjustment</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Balance</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockLedger.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-900">{entry.product_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{entry.product_sku}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          entry.entry_type === 'PURCHASE' ? 'bg-blue-50 text-blue-600' : 
                          entry.entry_type === 'SALE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {entry.entry_type_display}
                        </span>
                      </td>
                      <td className={`p-4 text-sm font-bold ${entry.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">{entry.current_stock}</td>
                      <td className="p-4 text-xs text-slate-400 font-mono">{entry.reference_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stockLedger.length === 0 && (
                <div className="py-20 text-center">
                  <LedgerIcon size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Stock ledger is empty.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center py-20">
            <BarChart3 size={40} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reports & Analytics</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">This section is being updated to provide more detailed real-time insights into your store's performance.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Store Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Temporarily disable the storefront for customers</p>
                </div>
                <button 
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-12 h-6 rounded-full relative transition-colors ${maintenanceMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${maintenanceMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-900">Email Alerts</p>
                  <p className="text-xs text-slate-500">Receive notifications for new orders and stock alerts</p>
                </div>
                <button 
                  onClick={() => {
                    setEmailNotifications(!emailNotifications);
                    toast.success(`Email alerts ${!emailNotifications ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-12 h-6 rounded-full relative transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailNotifications ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <button 
                onClick={() => {
                  setIsSettingsSaving(true);
                  setTimeout(() => {
                    setIsSettingsSaving(false);
                    toast.success("Settings saved successfully");
                  }, 800);
                }}
                disabled={isSettingsSaving}
                className={`w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm transition-colors active:scale-[0.98] ${isSettingsSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
              >
                {isSettingsSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showPOModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPOModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Create Purchase Order</h3>
                <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onPOSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Product</label>
                  <select {...register('product', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Supplier</label>
                  <select {...register('supplier', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none">
                    <option value="">Select Supplier</option>
                    {/* Using users with role SUPPLIER */}
                    {users.filter(u => u.role === 'SUPPLIER').map(s => <option key={s.id} value={s.id}>{s.email} ({s.name || 'No Name'})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Quantity</label>
                    <input {...register('quantity', { required: true })} type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Total Cost (₹)</label>
                    <input {...register('total_cost', { required: true })} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="0.00" />
                  </div>
                </div>
                <button 
                  disabled={formSubmitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm disabled:opacity-50 mt-4 shadow-lg shadow-blue-100"
                >
                  {formSubmitting ? 'Creating...' : 'Create Purchase Order'}
                </button>
              </form>
            </Motion.div>
          </div>
        )}

        {showProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => { setShowProductModal(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onProductSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Product Name</label>
                    <input {...register('name', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="e.g. Gold Diamond Necklace" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Collection</label>
                    <select {...register('category', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none">
                      <option value="">Select a collection</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Price (₹)</label>
                    <input {...register('price', { required: true })} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Available Quantity</label>
                    <input {...register('available_quantity', { required: true })} type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Product Description</label>
                  <textarea {...register('description')} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none resize-none" placeholder="Tell customers about this product..." />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 ml-1">Product Images</label>
                  <div className="grid grid-cols-4 gap-4">
                    {/* Existing Images (Backend) */}
                    {existingImages.map((img) => (
                      <div key={`existing-${img.id}`} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img.image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[8px] text-white py-0.5 text-center">Existing</div>
                      </div>
                    ))}
                    
                    {/* New Previews (Frontend) */}
                    {imagePreviews.map((url, idx) => (
                      <div key={`new-${idx}`} className="aspect-square relative rounded-xl overflow-hidden border border-blue-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removePreview(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600/60 text-[8px] text-white py-0.5 text-center">New</div>
                      </div>
                    ))}
                    
                    <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-500">
                      <Upload size={20} />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">Total images: {existingImages.length + selectedFiles.length}. First image will be used as primary.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" {...register('is_active')} defaultChecked />
                  <label htmlFor="is_active" className="text-xs font-medium text-slate-600">This product is active and visible to customers</label>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={formSubmitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </div>
        )}

        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCategoryModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editingCategory ? 'Edit Collection' : 'New Collection'}</h3>
                <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onCategorySubmit)} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Collection Name</label>
                  <input {...register('name', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="e.g. Bridal Jewellery" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Description</label>
                  <textarea {...register('description')} rows={2} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none resize-none" placeholder="Short description..." />
                </div>
                <button 
                  disabled={formSubmitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  {formSubmitting ? 'Adding...' : 'Add Collection'}
                </button>
              </form>
            </Motion.div>
          </div>
        )}

        {showCouponModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCouponModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
                <button onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }} className="text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onCouponSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Coupon Code</label>
                  <input {...register('code', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="e.g. SAVE20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Discount Type</label>
                    <select {...register('discount_type', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Value</label>
                    <input {...register('value', { required: true })} type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Usage Limit (Optional)</label>
                  <input {...register('usage_limit')} type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none" placeholder="Leave empty for unlimited" />
                </div>
                <div className="pt-2">
                  <button 
                    disabled={formSubmitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    {formSubmitting ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
