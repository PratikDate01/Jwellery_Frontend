import React, { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';
import { useQuery } from '@tanstack/react-query';

const Shop = () => {
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    ordering: '-created_at'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await api.get('products/', { params: filters });
      return res.data;
    },
    staleTime: 60000, // 1 minute
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('categories/');
      return res.data;
    },
    staleTime: 60000, // Categories don't change often
  });

  if (isProductsLoading && products.length === 0) return <Loader />;

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20">
      {/* Header Section */}
      <div className="bg-luxury-ivory/50 border-b border-slate-100 mb-12">
        <div className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="mb-10">
            <BackButton />
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                <a href="/" className="hover:text-gold-600 transition-colors">Home</a>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-slate-900">Collections</span>
              </nav>
              <h1 className="text-5xl font-serif text-slate-900 leading-tight">Curated Masterpieces</h1>
            </div>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed border-l border-gold-200 pl-6">
              Discover our exquisite collection of fine jewellery, handcrafted with precision and timeless elegance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-6 flex items-center gap-2">
                  <Filter size={14} className="text-gold-600" /> Categories
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setFilters({...filters, category: ''})}
                    className={`block w-full text-left text-sm py-1 transition-all ${!filters.category ? 'text-gold-600 font-medium translate-x-1' : 'text-slate-500 hover:text-slate-900 hover:translate-x-1'}`}
                  >
                    All Collections
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters({...filters, category: cat.slug})}
                      className={`block w-full text-left text-sm py-1 transition-all ${filters.category === cat.slug ? 'text-gold-600 font-medium translate-x-1' : 'text-slate-500 hover:text-slate-900 hover:translate-x-1'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-6">Price Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-gold-400 outline-none w-full"
                    value={filters.min_price}
                    onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-gold-400 outline-none w-full"
                    value={filters.max_price}
                    onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-6">Sort By</h3>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-gold-400 outline-none appearance-none cursor-pointer"
                  value={filters.ordering}
                  onChange={(e) => setFilters({...filters, ordering: e.target.value})}
                >
                  <option value="-created_at">New Arrivals</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Top Rated</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {products.length} Masterpieces
              </span>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                <SlidersHorizontal size={14} /> Filter
              </button>
            </div>

            {isProductsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="space-y-6">
                    <div className="aspect-[4/5] bg-slate-100 animate-pulse rounded-[32px]" />
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                      <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-10 hidden lg:flex">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Showing <span className="text-slate-900">{products.length}</span> signature pieces
                  </span>
                </div>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 border-2 border-dashed border-slate-100 rounded-[40px]">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <SlidersHorizontal size={32} />
                    </div>
                    <h3 className="text-xl font-serif text-slate-900 mb-2">No results found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
                      We couldn't find any pieces matching your current refinement.
                    </p>
                    <button 
                      onClick={() => setFilters({category: '', min_price: '', max_price: '', ordering: '-created_at'})}
                      className="text-gold-600 font-bold text-[10px] uppercase tracking-widest border-b-2 border-gold-200 pb-1"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white z-[101] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-xl font-serif text-slate-900">Refine Collection</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>
              
              {/* Reuse Filter Content for Mobile */}
              <div className="space-y-10">
                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Collections</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters({...filters, category: ''})}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!filters.category ? 'bg-gold-600 text-white' : 'bg-slate-50 text-slate-500'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setFilters({...filters, category: cat.slug})}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filters.category === cat.slug ? 'bg-gold-600 text-white' : 'bg-slate-50 text-slate-500'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Price Preference</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm w-full outline-none"
                      value={filters.min_price}
                      onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                    />
                    <div className="w-4 h-px bg-slate-200" />
                    <input
                      type="number"
                      placeholder="Max"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm w-full outline-none"
                      value={filters.max_price}
                      onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] mt-8"
                >
                  Apply Refinements
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
