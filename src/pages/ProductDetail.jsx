import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';
import { normalizeImageUrl } from '../utils/helpers';

import { useQuery, useQueryClient } from '@tanstack/react-query';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading: loading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`products/${id}/`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const addToCart = async () => {
    try {
      await api.post('cart/add_item/', {
        product_id: product.id,
        quantity: 1
      });
      toast.success('Added to cart');
      queryClient.invalidateQueries(['cart']);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login first');
        navigate('/login');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await api.post('wishlist/add/', { product_id: product.id });
      toast.success('Saved to wishlist');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login first');
        navigate('/login');
      } else {
        toast.error('Already in wishlist');
      }
    }
  };

  if (loading) return <Loader />;

  if (!product) return (
    <div className="min-h-screen pt-32 bg-[#FBF9F6] flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <BackButton text="Back to Gallery" />
      </div>
      <h2 className="text-3xl font-serif text-slate-900 mb-2">Masterpiece not found</h2>
      <p className="text-slate-500 text-sm italic">The piece you're looking for might have been acquired by another collector.</p>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [{ image: product.image }];

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <BackButton />
          
          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <a href="/" className="hover:text-gold-600 transition-colors">Home</a>
            <ChevronRight size={10} className="text-slate-300" />
            <a href="/shop" className="hover:text-gold-600 transition-colors">Collections</a>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-slate-900">{product.category_name}</span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
          {/* Image Gallery */}
          <div className="flex-1 space-y-6">
            <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden group relative shadow-2xl shadow-slate-200/50">
              <motion.img
                key={activeImg}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={normalizeImageUrl(images[activeImg].image)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {product.stock <= 5 && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Limited Stock</span>
                )}
                <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Certified</span>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === idx ? 'border-gold-500 scale-95 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                >
                  <img src={normalizeImageUrl(img.image)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 max-w-xl">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-gold-600 text-[11px] font-bold uppercase tracking-[0.3em]">{product.category_name}</span>
                <div className="flex items-center gap-1 text-gold-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-slate-900 text-[11px] font-bold">4.9</span>
                  <span className="text-slate-400 text-[10px] ml-1">(124 Reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">{product.name}</h1>
              <p className="text-2xl font-light text-slate-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
                <span className="text-sm text-slate-400 ml-3 uppercase tracking-widest font-bold">Inclusive of taxes</span>
              </p>
            </div>

            <div className="prose prose-slate prose-sm max-w-none mb-10">
              <p className="text-slate-500 leading-relaxed text-base italic">
                "{product.description}"
              </p>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Metal Type</p>
                <p className="text-sm font-medium text-slate-900">18K Solid Gold</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hallmark</p>
                <p className="text-sm font-medium text-slate-900">BIS Certified</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={addToCart}
                className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={18} /> Add To Cart
              </button>
              <button 
                onClick={handleAddToWishlist}
                className="px-8 py-5 border border-slate-200 rounded-2xl text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <Heart size={18} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Lifetime</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Insured</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">14-Day</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
