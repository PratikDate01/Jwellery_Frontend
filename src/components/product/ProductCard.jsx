import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { normalizeImageUrl } from '../../utils/helpers';
import { useQueryClient } from '@tanstack/react-query';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const primaryImage = product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await api.post('cart/add_item/', { product_id: product.id, quantity: 1 });
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

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white border border-slate-100 overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/10"
    >
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={normalizeImageUrl(primaryImage)} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Badges */}
        {product.is_featured && (
          <div className="absolute top-4 left-4 bg-gold-500 text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 shadow-lg">
            Essential
          </div>
        )}
      </Link>

      {/* Wishlist Button */}
      <button 
        onClick={handleAddToWishlist}
        className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-gold-500 transition-colors rounded-full z-10 shadow-sm"
      >
        <Heart size={16} strokeWidth={2} />
      </button>

      {/* Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[9px] text-gold-600 font-bold uppercase tracking-[0.2em]">{product.category_name || 'Jewellery'}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{product.purity}</p>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-serif mb-4 text-slate-900 group-hover:text-gold-600 transition-colors tracking-wide h-10 overflow-hidden line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold text-base">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="p-2 text-slate-900 hover:text-gold-500 transition-all transform hover:scale-110"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
