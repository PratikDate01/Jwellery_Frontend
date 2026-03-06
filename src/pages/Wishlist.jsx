import React from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Wishlist = () => {
  const queryClient = useQueryClient();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('wishlist/');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`wishlist/remove/${id}/`);
    },
    onSuccess: () => {
      toast.success('Removed from your collection');
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  const moveToCartMutation = useMutation({
    mutationFn: async (id) => {
      await api.post('cart/add_item/', { product_id: id, quantity: 1 });
      await api.delete(`wishlist/remove/${id}/`);
    },
    onSuccess: () => {
      toast.success('Moved to your collection');
      queryClient.invalidateQueries(['wishlist']);
      queryClient.invalidateQueries(['cart']);
    },
    onError: () => {
      toast.error('Failed to move to cart');
    }
  });

  const items = wishlistData?.products || [];

  const removeFromWishlist = (id) => {
    removeFromWishlistMutation.mutate(id);
  };

  const moveToCart = (id) => {
    moveToCartMutation.mutate(id);
  };

  if (isLoading && !wishlistData) return <Loader />;

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-12">
          <BackButton />
        </div>
        <header className="mb-20">
          <span className="text-gold-600 font-bold uppercase tracking-[0.4em] text-[10px] block mb-6">Personal Collection</span>
          <h1 className="text-5xl font-serif text-slate-900 leading-tight">Your Favourites</h1>
        </header>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative"
                >
                  <div className="aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden mb-6 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl transition-all">
                    <img 
                      src={item.images?.[0]?.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070"} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-12 h-12 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{item.category_name}</p>
                    <h3 className="text-lg font-serif text-slate-900 mb-2">{item.name}</h3>
                    <p className="text-lg font-light text-slate-900 mb-6">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    
                    <button 
                      onClick={() => moveToCart(item.id)}
                      className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold-600 transition-all"
                    >
                      <ShoppingBag size={16} /> Add to Collection
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-40 bg-luxury-ivory/30 rounded-[60px] border border-slate-100">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
              <Heart size={40} />
            </div>
            <h2 className="text-3xl font-serif text-slate-900 mb-4 text-center mx-auto">Your heart is empty</h2>
            <p className="text-slate-400 text-sm italic max-w-xs mx-auto mb-12 text-center">
              Add pieces that call to you, and we'll keep them safe here for your consideration.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-gold-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Discover Collections <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
