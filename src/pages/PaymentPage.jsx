import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`orders/${orderId}/`);
        setOrder(res.data);
        if (res.data.payment_status === 'PAID') {
          setPaymentSuccess(true);
        }
      } catch (error) {
        toast.error("Failed to fetch order details");
        navigate('/dashboard/customer');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      const res = await api.post('payments/process_payment/', {
        order_id: orderId,
        payment_method: selectedMethod,
        payment_details: {
          timestamp: new Date().toISOString(),
          simulated: true
        }
      });
      
      setTransactionId(res.data.transaction_id);
      setPaymentSuccess(true);
      toast.success("Payment successful!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader />;

  if (paymentSuccess) return (
    <div className="min-h-screen pt-32 bg-[#FBF9F6] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-[60px] p-12 text-center shadow-2xl border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 text-green-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-serif text-slate-900 mb-6">Payment Secured</h1>
        <p className="text-slate-500 mb-4 leading-relaxed uppercase tracking-widest text-[10px]">
          Order #{orderId} • Transaction {transactionId}
        </p>
        <p className="text-slate-600 mb-10 text-sm">
          Thank you for your investment. Your masterpiece is now being prepared for delivery.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/dashboard/customer')}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold-600 transition-all shadow-xl shadow-slate-900/10"
          >
            View Order Status
          </button>
          <button 
            onClick={() => navigate('/shop')}
            className="w-full border border-slate-200 text-slate-900 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
          >
            Return to Collection
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-8">
              <BackButton />
            </div>
            <h1 className="text-5xl font-serif text-slate-900 leading-tight">Secure Settlement</h1>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl px-8 py-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">Total Investment</span>
            <span className="text-3xl font-serif text-gold-600">₹{parseFloat(order?.net_amount).toLocaleString('en-IN')}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Methods Section */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
              <h2 className="text-xl font-serif text-slate-900 mb-8 pb-4 border-b border-slate-50 flex items-center gap-3">
                <ShieldCheck className="text-gold-500" size={24} /> 
                Preferred Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { id: 'CARD', icon: CreditCard, label: 'Card' },
                  { id: 'UPI', icon: Smartphone, label: 'UPI' },
                  { id: 'NET_BANKING', icon: Building2, label: 'Banking' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 ${
                      selectedMethod === method.id 
                        ? 'border-gold-500 bg-gold-50/50 text-gold-700 shadow-lg shadow-gold-500/10' 
                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <method.icon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedMethod === 'CARD' && (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handlePayment}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Card Number</label>
                      <div className="relative">
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all pr-12" 
                          placeholder="0000 0000 0000 0000"
                        />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Expiry Date</label>
                        <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Security Code (CVV)</label>
                        <div className="relative">
                          <input required type="password" maxLength="3" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="•••" />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={processing}
                      className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                    >
                      {processing ? 'Authorising...' : `Pay ₹${parseFloat(order?.net_amount).toLocaleString('en-IN')}`}
                    </button>
                  </motion.form>
                )}

                {selectedMethod === 'UPI' && (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handlePayment}
                    className="space-y-6 text-center"
                  >
                    <div className="bg-slate-50 rounded-[30px] p-8 border border-slate-100 mb-8 inline-block mx-auto">
                       {/* Placeholder for QR Code */}
                       <div className="w-48 h-48 bg-white border-8 border-white rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />
                          <Smartphone size={64} className="text-slate-100" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Simulated QR</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">UPI ID (VPA)</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all" placeholder="user@upi" />
                    </div>
                    <button 
                      type="submit"
                      disabled={processing}
                      className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                    >
                      {processing ? 'Verifying UPI...' : 'Verify & Pay'}
                    </button>
                  </motion.form>
                )}

                {selectedMethod === 'NET_BANKING' && (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handlePayment}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                         <button type="button" key={bank} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-gold-200 transition-all">
                           {bank}
                         </button>
                       ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Other Bank</label>
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-gold-400 outline-none transition-all appearance-none">
                        <option>Choose from all banks...</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      disabled={processing}
                      className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                    >
                      {processing ? 'Redirecting...' : 'Proceed to Bank Page'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </section>

            <div className="flex items-center gap-4 text-slate-400 px-4">
              <Lock size={14} className="text-gold-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                Your transaction is protected by bank-level 256-bit AES encryption and secure vault protocols.
              </span>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-[40px] p-10 md:p-12 shadow-2xl sticky top-32 border border-slate-800">
              <h2 className="text-2xl font-serif mb-10 pb-6 border-b border-white/10">Order Summary</h2>
              
              <div className="space-y-6 mb-10">
                {order?.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white line-clamp-1">{item.product_name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-serif text-gold-400">₹{parseFloat(item.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Valuation Subtotal</span>
                    <span className="text-white">₹{parseFloat(order?.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>GST (3%)</span>
                    <span className="text-white">₹{parseFloat(order?.tax_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gold-400">
                    <span>Shipping & Insurance</span>
                    <span>Complimentary</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">Total Payable</span>
                  <p className="text-3xl font-serif text-gold-400">₹{parseFloat(order?.net_amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <div className="flex gap-4 items-start">
                   <div className="p-2 bg-gold-500/10 rounded-xl">
                      <AlertCircle className="text-gold-500" size={18} />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2">Authenticity Guaranteed</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        Every masterpiece in this order includes a GIA/BIS certificate of authenticity and hallmarking.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
