import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setBackendError('');
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      
      let targetPath = `/dashboard/${user.role.toLowerCase()}`;
      if (user.role === 'CUSTOMER') targetPath = '/';
      
      const from = location.state?.from?.pathname || targetPath;
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login Error Details:", error.response?.data || error.message);
      
      let message = 'Invalid email or password. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'The server is taking a while to wake up. Please try again in a few moments.';
      } else {
        const errorData = error.response?.data;
        if (errorData) {
          if (errorData.message) {
            message = errorData.message;
          } else if (errorData.detail) {
            message = errorData.detail;
          } else if (typeof errorData === 'object') {
            const messages = Object.values(errorData).flat();
            if (messages.length > 0 && typeof messages[0] === 'string') {
              message = messages[0];
            }
          }
        }
      }
      
      setBackendError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#FBF9F6] font-sans">
      <div className="mb-8 w-full max-w-md">
        <BackButton />
      </div>
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-slate-100 shadow-2xl p-8 md:p-12 rounded-[40px]"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm italic">Please sign in to your luxury account</p>
        </div>

        {backendError && (
          <Motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-[11px] font-medium leading-relaxed">{backendError}</p>
          </Motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' }
                })}
                className={`w-full bg-slate-50 border ${errors.email ? 'border-red-200' : 'border-slate-100'} focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all`}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-gold-600 hover:text-gold-700 uppercase tracking-widest">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
              <input
                id="password"
                {...register('password', { required: 'Password is required' })}
                type="password"
                autoComplete="current-password"
                className={`w-full bg-slate-50 border ${errors.password ? 'border-red-200' : 'border-slate-100'} focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all`}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.password.message}</p>}
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-5 text-[11px] uppercase tracking-[0.2em] hover:bg-gold-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 rounded-2xl shadow-xl shadow-slate-900/10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[11px] uppercase tracking-widest">
            New here?{' '}
            <Link to="/register" className="text-gold-600 font-bold hover:text-gold-700 ml-1">
              Create an Account
            </Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;
