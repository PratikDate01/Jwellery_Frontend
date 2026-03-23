import React from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';
import { normalizeImageUrl } from '../utils/helpers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Cart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('cart/current/');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, newQty }) => {
      await api.patch(`cart/items/${itemId}/`, { quantity: newQty });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: () => {
      toast.error('Could not update quantity');
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`cart/items/${itemId}/`);
    },
    onSuccess: () => {
      toast.success('Removed from cart');
      queryClient.invalidateQueries(['cart']);
    },
    onError: () => {
      toast.error('Could not remove item');
    }
  });

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;
    updateQuantityMutation.mutate({ itemId, newQty });
  };

  const removeItem = (itemId) => {
    removeItemMutation.mutate(itemId);
  };

  if (isLoading && !cart) return <Loader />;

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const subtotal = cart?.total_price || cartItems.reduce((acc, item) => acc + (parseFloat(item.product_details?.price || 0) * item.quantity), 0);

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-12">
          <BackButton />
        </div>
        <header className="mb-16">
          <h1 className="text-5xl font-serif text-slate-900 mb-4">Your Cart</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Review your selected jewellery pieces</p>
        </header>

        {cartItems.length > 0 ? (
          <div className="flex flex-col xl:flex-row gap-16">
            {/* Cart Items List */}
            <div className="flex-1 space-y-8">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10 group border border-slate-100/50"
                  >
                    <div className="w-48 h-48 bg-slate-50 rounded-[32px] overflow-hidden flex-shrink-0 shadow-lg shadow-slate-200/50">
                      <img src={normalizeImageUrl(item.product_details?.images?.[0]?.image)} alt={item.product_details?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    
                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600 mb-2">{item.product_details?.category_name || 'Fine Jewellery'}</p>
                          <h3 className="text-2xl font-serif text-slate-900">{item.product_details?.name}</h3>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all ml-auto md:ml-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-slate-50">
                        <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentQty = parseInt(item.quantity, 10) || 1;
                              updateQuantity(item.id, currentQty - 1);
                            }}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentQty = parseInt(item.quantity, 10) || 1;
                              updateQuantity(item.id, currentQty + 1);
                            }}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Valuation</p>
                          <p className="text-xl font-serif text-slate-900">₹{(parseFloat(item.product_details?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="xl:w-[450px]">
              <div className="bg-slate-900 text-white rounded-[40px] p-10 md:p-12 shadow-2xl shadow-slate-900/20 sticky top-32">
                <h2 className="text-2xl font-serif mb-10 pb-8 border-b border-white/10">Order Summary</h2>
                
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="uppercase tracking-widest font-bold text-[10px]">Subtotal</span>
                    <span className="text-white font-serif">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="uppercase tracking-widest font-bold text-[10px]">Vault Shipping</span>
                    <span className="text-gold-400 uppercase tracking-widest font-bold text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="uppercase tracking-widest font-bold text-[10px]">Insurance</span>
                    <span className="text-gold-400 uppercase tracking-widest font-bold text-[10px]">Included</span>
                  </div>
                  
                  <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">Final Investment</span>
                      <p className="text-slate-500 text-[9px] mt-1">Inclusive of GST & Certifications</p>
                    </div>
                    <p className="text-3xl font-serif text-gold-400">₹{subtotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <Link 
                  to="/checkout"
                  className="w-full bg-gold-600 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-600/20"
                >
                  Proceed to Secure Checkout <ArrowRight size={16} />
                </Link>

                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-4 text-slate-400">
                    <ShieldCheck size={20} className="text-gold-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <Truck size={20} className="text-gold-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fully Insured Delivery</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[60px] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="w-24 h-24 bg-luxury-ivory rounded-full flex items-center justify-center mx-auto mb-10 text-slate-300">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-400 text-sm italic max-w-xs mx-auto mb-12">
              Begin your journey by exploring our curated masterpieces.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-gold-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Explore Store <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
