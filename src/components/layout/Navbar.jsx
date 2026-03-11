import React, { useState } from 'react';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, Search, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const res = await api.get('cart/current/');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard/customer';
    return `/dashboard/${user.role.toLowerCase()}`;
  };

  return (
    <nav className="bg-white text-slate-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center group">
            <span className="text-2xl md:text-3xl font-serif tracking-[0.15em] text-slate-900 group-hover:text-gold-600 transition-colors">
              LUXE JEWELS
            </span>
            <div className="flex items-center gap-2 w-full">
              <div className="h-[1px] flex-grow bg-gold-200"></div>
              <span className="text-[8px] tracking-[0.4em] text-gold-600 uppercase font-bold">Pune</span>
              <div className="h-[1px] flex-grow bg-gold-200"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {['Home', 'Shop', 'Collections', 'About'].map((item) => (
              <Link 
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-gold-600 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="text-slate-500 hover:text-gold-600 transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="text-slate-500 hover:text-gold-600 transition-colors">
                  <Heart size={20} strokeWidth={1.5} />
                </Link>
                <Link to="/cart" className="text-slate-500 hover:text-gold-600 transition-colors relative">
                  <ShoppingCart size={20} strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full border-2 border-slate-200 hover:border-gold-400 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                    <User size={16} className="text-gold-600" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{user?.email}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full inline-block mt-2 ${
                          user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          user?.role === 'SUPPLIER' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                      
                      <div className="p-2">
                        <Link 
                          to={getDashboardPath()}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-900 hover:bg-gold-50 rounded-xl transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        <Link 
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-900 hover:bg-gold-50 rounded-xl transition-colors"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2 border-t border-slate-100"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white bg-slate-900 px-6 py-3 hover:bg-gold-600 transition-all rounded-xl shadow-md hover:shadow-lg">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl"
          >
            <div className="px-6 py-10 flex flex-col space-y-6">
              {['Home', 'Shop', 'Collections', 'About'].map((item) => (
                <Link 
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-bold uppercase tracking-widest text-slate-900"
                >
                  {item}
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="flex gap-3">
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <Heart size={20} className="inline" />
                  </Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 relative">
                    <ShoppingCart size={20} className="inline" />
                    {cartCount > 0 && (
                      <span className="absolute top-2 right-4 bg-gold-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link 
                      to={getDashboardPath()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-900 bg-slate-50 hover:bg-gold-50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-900 bg-slate-50 hover:bg-gold-50 rounded-xl transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center text-[11px] font-bold uppercase tracking-[0.15em] text-white bg-slate-900 px-6 py-3 hover:bg-gold-600 transition-all rounded-xl"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
