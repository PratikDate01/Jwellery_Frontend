import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      role: 'CUSTOMER'
    }
  });
  const navigate = useNavigate();

  const password = watch('password');
  const selectedRole = watch('role');

  const roles = [
    { id: 'CUSTOMER', label: 'Customer', description: 'Personal shopping', icon: '👤' },
    { id: 'WHOLESALER', label: 'Wholesaler', description: 'Bulk buying', icon: '📦' },
    { id: 'SUPPLIER', label: 'Supplier', description: 'Sell with us', icon: '🏪' },
  ];

  const onSubmit = async (data) => {
    try {
      await api.post('accounts/register/', {
        email: data.email,
        name: data.name,
        password: data.password,
        password_confirm: data.password_confirm,
        phone: data.phone,
        role: data.role
      });
      toast.success('Account created! You can now sign in.');
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      const errorData = error.response?.data;
      let errorMessage = 'Could not create account';
      
      if (typeof errorData === 'object' && errorData !== null) {
        const messages = Object.values(errorData).flat();
        if (messages.length > 0) {
          errorMessage = messages[0];
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#FBF9F6]">
      <div className="mb-8 w-full max-w-2xl">
        <BackButton />
      </div>
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white border border-slate-100 shadow-2xl p-8 md:p-12 rounded-[40px]"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm italic">Join our exclusive luxury marketplace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.name.message}</p>}
            </div>

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
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all"
                  placeholder="+91 00000 00000"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', { 
                    required: 'Password is required', 
                    minLength: { value: 8, message: 'Min 8 characters' } 
                  })}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirm" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input
                  id="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register('password_confirm', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-50 outline-none pl-14 pr-6 py-4 text-sm rounded-2xl transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password_confirm && <p className="text-red-500 text-[10px] font-medium ml-1">{errors.password_confirm.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Account Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <label 
                  key={role.id}
                  className={`
                    relative cursor-pointer p-6 rounded-2xl border-2 transition-all
                    ${selectedRole === role.id 
                      ? 'border-gold-500 bg-gold-50 shadow-lg shadow-gold-500/10' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
                  `}
                >
                  <input
                    type="radio"
                    {...register('role')}
                    value={role.id}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">{role.icon}</span>
                    <span className={`text-sm font-bold ${selectedRole === role.id ? 'text-gold-900' : 'text-slate-900'}`}>{role.label}</span>
                    <span className={`text-[10px] mt-1 ${selectedRole === role.id ? 'text-gold-600' : 'text-slate-400'}`}>{role.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-5 text-[11px] uppercase tracking-[0.2em] hover:bg-gold-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-2xl shadow-xl shadow-slate-900/10"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[11px] uppercase tracking-widest">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 font-bold hover:text-gold-700 ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Register;
