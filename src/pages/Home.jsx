import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Home = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-preview'],
    queryFn: async () => {
      const res = await api.get('categories/');
      return res.data.slice(0, 3);
    },
    refetchInterval: 10000,
  });
  return (
    <div className="bg-luxury-ivory text-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#FBF9F6]">
        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-gold-500"></div>
              <span className="text-gold-600 font-bold uppercase tracking-[0.3em] text-[10px]">
                Since 1995 • Pune, India
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 text-slate-900 leading-[1.1]">
              Timeless Elegance <br /> 
              <span className="text-gold-500 italic">For Every Story.</span>
            </h1>
            <p className="text-slate-500 text-lg mb-12 font-light leading-relaxed max-w-lg">
              Discover our handcrafted collection of BIS Hallmarked 22K gold 
              and GIA certified diamond jewellery.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                to="/shop" 
                className="bg-slate-900 text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
              >
                Shop Collection
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="border border-slate-200 text-slate-900 px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all text-center"
              >
                The Artistry
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-t-[200px] border-[12px] border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop" 
                alt="Luxury Jewellery" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold-50 rounded-full -z-10 animate-pulse"></div>
            <div className="absolute top-1/4 -right-8 p-6 bg-white shadow-xl rounded-lg border border-gold-100 backdrop-blur-sm z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                  <Award size={20} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">Certified</p>
                  <p className="text-xs font-bold text-slate-900">GIA & IGI Verified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: ShieldCheck, title: "BIS Hallmarked", desc: "100% Purity Guaranteed" },
              { icon: Truck, title: "Insured Delivery", desc: "Across 20,000+ Pincodes" },
              { icon: RefreshCw, title: "Life-Time Exchange", desc: "Best value for your gold" },
              { icon: Star, title: "Luxe Rewards", desc: "Exclusive Member Benefits" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full bg-luxury-soft flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-all duration-500">
                  <badge.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">{badge.title}</h3>
                <p className="text-[10px] text-slate-400 uppercase leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-gold-600 font-bold uppercase tracking-[0.3em] text-[10px] block mb-4">Curated Pieces</span>
              <h2 className="text-4xl font-serif text-slate-900">Exquisite Collections</h2>
            </div>
            <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-gold-400 pb-1 hover:text-gold-600 hover:border-gold-600 transition-all">
              View All Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.length > 0 ? (
              categories.map((cat, i) => (
                <Link key={i} to={`/shop?category=${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-slate-100">
                  <img 
                    src={cat.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070"} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <h3 className="text-2xl font-serif mb-2">{cat.name}</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-400 group-hover:text-gold-300">Discover Piece</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                <p className="text-slate-400 italic">Our curated collections are being updated...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
