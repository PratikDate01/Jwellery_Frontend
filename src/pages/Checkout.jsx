import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('cart/current/');
        const cartData = res.data;
        const items = Array.isArray(cartData.items) ? cartData.items : [];
        
        if (items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(cartData);
      } catch (err) {
        console.error("Error fetching cart", err);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      const response = await api.post('orders/', data);
      toast.success("Order registered. Proceeding to payment...");
      navigate(`/payment/${response.data.id}`); // Redirect to payment page
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Loader />;

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const subtotal = cart?.total_price || cartItems.reduce((acc, item) => acc + (parseFloat(item.product_details?.price || 0) * item.quantity), 0);

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">
        <header className="mb-16">
          <div className="mb-8">
            <BackButton />
          </div>
          <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
            <span className="text-slate-900">Checkout</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span>Shipping</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span>Secure Payment</span>
          </nav>
          <h1 className="text-5xl font-serif text-slate-900 leading-tight">Secure Finalisation</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col xl:flex-row gap-16">
          {/* Form Side */}
          <div className="flex-1 space-y-12">
            <section className="bg-white rounded-[40px] p-10 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-serif text-slate-900 mb-10 pb-6 border-b border-slate-50">Delivery Sanctuary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Legal Name</label>
                  <input {...register('full_name', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                  <input {...register('phone', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="+91 00000 00000" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Primary Residence / Address</label>
                  <input {...register('address_line_1', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="Suite, Street, Building" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">City</label>
                  <input {...register('city', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="Pune" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
                  <input {...register('pincode', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="000 000" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[40px] p-10 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-serif text-slate-900 mb-10 pb-6 border-b border-slate-50">Settlement Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="relative flex items-center gap-4 p-6 rounded-2xl border-2 border-gold-500 bg-gold-50/30 cursor-pointer transition-all">
                  <input type="radio" name="payment" checked readOnly className="w-4 h-4 text-gold-600 border-gold-300 focus:ring-gold-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Secure Vault Pay</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Credit/Debit Cards, UPI, Netbanking</p>
                  </div>
                </label>
                <div className="p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Cryptocurrency</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Side */}
          <aside className="xl:w-[450px]">
            <div className="bg-slate-900 text-white rounded-[40px] p-10 md:p-12 shadow-2xl shadow-slate-900/20 sticky top-32">
              <h2 className="text-2xl font-serif mb-10 pb-8 border-b border-white/10">Order Valuation</h2>
              
              <div className="space-y-6 mb-10">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium truncate max-w-[200px]">{item.product_details?.name} x {item.quantity}</span>
                    <span className="text-white font-serif">₹{(parseFloat(item.product_details?.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Valuation Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gold-400">
                    <span>Vault Logistics</span>
                    <span>Complimentary</span>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">Total Investment</span>
                    <p className="text-slate-500 text-[9px] mt-1">GIA Certified & Fully Insured</p>
                  </div>
                  <p className="text-3xl font-serif text-gold-400">₹{subtotal.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gold-600 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing Securely...' : 'Seal Your Order'} <Lock size={16} />
              </button>

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
        </form>
      </div>
    </div>
  );
};

export default Checkout;
