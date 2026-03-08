import React, { useState } from 'react';
import api from '../../services/api';
import { 
  LayoutDashboard, Package, ListTree, ShoppingCart, 
  Users, Ticket, BarChart3, Settings,
  TrendingUp, IndianRupee, Clock, Truck, ShieldCheck, Inbox, Plus,
  AlertCircle, X, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { normalizeImageUrl, safeData } from '../../utils/helpers';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    available_quantity: '',
    category: '',
    purity: '22K',
    gold_weight: '',
    diamond_clarity: '',
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: supplierData, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['supplier-dashboard'],
    queryFn: async () => {
      const res = await api.get('analytics/dashboard/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('categories/');
      return safeData(res.data);
    },
    staleTime: 300000,
  });

  const { data: supplyOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['supplier-purchase-orders'],
    queryFn: async () => {
      const res = await api.get('products/purchase-orders/supplier_orders/');
      return safeData(res.data);
    },
    staleTime: 60000,
  });

  const createProductMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('available_quantity', formData.available_quantity);
      data.append('category', formData.category);
      data.append('purity', formData.purity);
      if (formData.gold_weight) data.append('gold_weight', formData.gold_weight);
      if (formData.diamond_clarity) data.append('diamond_clarity', formData.diamond_clarity);
      
      uploadedImages.forEach((image) => {
        data.append('uploaded_images', image);
      });

      const res = await api.post('products/supplier-products/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Product created successfully!');
      setShowProductModal(false);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        available_quantity: '',
        category: '',
        purity: '22K',
        gold_weight: '',
        diamond_clarity: '',
      });
      setUploadedImages([]);
      refetch();
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to create product';
      toast.error(msg);
    },
  });

  const analytics = supplierData?.stats;
  const inventory = supplierData?.inventory || [];
  
  // Robust loading state that stops on error
  const loading = isLoading && !queryError;
  const hasError = !!queryError;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleAddProduct = () => {
    setShowProductModal(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!productFormData.name || !productFormData.description || !productFormData.price || !productFormData.available_quantity || !productFormData.category) {
      toast.error('Please fill all required fields');
      return;
    }
    if (selectedProduct) {
      toast('Edit functionality coming soon');
    } else {
      createProductMutation.mutate(productFormData);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price || '',
      available_quantity: product.available_quantity || '',
      category: product.category || '',
      purity: product.purity || '22K',
      gold_weight: product.gold_weight || '',
      diamond_clarity: product.diamond_clarity || '',
    });
    setShowProductModal(true);
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', name: 'Products', icon: Package },
    { id: 'orders', name: 'Supply Orders', icon: Inbox },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Portal Unavailable</h2>
          <p className="text-slate-500 text-sm mb-8">We're experiencing technical difficulties connecting to your supplier portal. Please try again in a moment.</p>
          <button 
            onClick={() => refetch()}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all"
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
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Supplier</h1>
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
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Verified Vendor</p>
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
                { label: 'Active Products', value: analytics?.approved_products || '0', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Earnings', value: `₹${analytics?.total_earnings?.toLocaleString?.('en-IN') || '0'}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Products', value: analytics?.total_products || '0', icon: Inbox, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Quality Rating', value: '4.8/5', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                  <h3 className="font-bold text-slate-900">Sales Performance</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 days</span>
                </div>
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="text-center">
                    <BarChart3 className="text-slate-300 mx-auto mb-2" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performance chart loading...</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Live Inventory</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inventory.length > 0 ? (
                    inventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stock: {item.available_quantity || item.stock_quantity}</p>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap">Edit</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-8 font-medium">No products yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">My Products</h3>
              <button 
                onClick={handleAddProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
            {inventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Product</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Stock</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Status</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">{item.available_quantity || item.stock_quantity} units</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.is_approved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {item.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleEditProduct(item)}
                            className="text-blue-600 hover:text-blue-800 p-2 transition-colors"
                            title="Edit product"
                          >
                            <Settings size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package className="text-slate-200 mx-auto mb-4" size={48} />
                <p className="text-slate-500">No products yet. Add one to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Supply Orders (Purchase Orders)</h3>
            </div>
            {supplyOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">PO ID</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Product</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Quantity</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Total Revenue</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplyOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-sm font-bold text-slate-900">#PO-{order.id}</td>
                        <td className="p-4 text-sm text-slate-600">{order.product_name}</td>
                        <td className="p-4 text-sm font-medium text-slate-900">{order.quantity} units</td>
                        <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(order.total_cost).toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'RECEIVED' ? 'bg-green-50 text-green-600' : 
                            order.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Inbox className="text-slate-200 mx-auto mb-4" size={48} />
                <p className="text-slate-500">No supply orders yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
            <BarChart3 size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reports</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto uppercase tracking-widest font-medium">Detailed reports and analytics will be available here soon.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm max-w-2xl">
            <h3 className="font-bold text-slate-900 mb-8 text-lg">Vendor Settings</h3>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Store Status</p>
                  <p className="text-sm font-bold text-green-600">✓ Active & Verified</p>
                </div>
                <ShieldCheck className="text-green-500" size={24} />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Earnings</p>
                <p className="text-2xl font-bold text-slate-900">₹{analytics?.total_earnings?.toLocaleString?.('en-IN') || '0'}</p>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                Edit Vendor Profile
              </button>
            </div>
          </div>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                  setProductFormData({
                    name: '',
                    description: '',
                    price: '',
                    available_quantity: '',
                    category: '',
                    purity: '22K',
                    gold_weight: '',
                    diamond_clarity: '',
                  });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={productFormData.name}
                  onChange={handleProductFormChange}
                  className="col-span-2 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <textarea
                  name="description"
                  placeholder="Description"
                  value={productFormData.description}
                  onChange={handleProductFormChange}
                  className="col-span-2 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  required
                />
                
                <input
                  type="number"
                  name="price"
                  placeholder="Retail Price"
                  value={productFormData.price}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  required
                />
                
                <input
                  type="number"
                  name="available_quantity"
                  placeholder="Stock Quantity"
                  value={productFormData.available_quantity}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <select
                  name="category"
                  value={productFormData.category}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  name="purity"
                  value={productFormData.purity}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="18K">18K</option>
                  <option value="22K">22K</option>
                  <option value="24K">24K</option>
                </select>
                
                <input
                  type="number"
                  name="gold_weight"
                  placeholder="Gold Weight (grams)"
                  value={productFormData.gold_weight}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.001"
                />
                
                <select
                  name="diamond_clarity"
                  value={productFormData.diamond_clarity}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Clarity (Optional)</option>
                  <option value="IF">IF - Internally Flawless</option>
                  <option value="VVS1">VVS1</option>
                  <option value="VVS2">VVS2</option>
                  <option value="VS1">VS1</option>
                  <option value="VS2">VS2</option>
                  <option value="SI1">SI1</option>
                  <option value="SI2">SI2</option>
                  <option value="I1">I1</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
                {uploadedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={URL.createObjectURL(img)} 
                          alt="preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {createProductMutation.isPending ? (selectedProduct ? 'Updating...' : 'Creating...') : (selectedProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProduct(null);
                    setProductFormData({
                      name: '',
                      description: '',
                      price: '',
                      available_quantity: '',
                      category: '',
                      purity: '22K',
                      gold_weight: '',
                      diamond_clarity: '',
                    });
                  }}
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

export default SupplierDashboard;
