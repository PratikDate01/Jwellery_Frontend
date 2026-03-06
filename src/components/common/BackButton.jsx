import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = ({ className = '', text = 'Back' }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ x: -4 }}
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-gold-600 transition-colors ${className}`}
    >
      <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-gold-200 bg-white shadow-sm transition-all">
        <ChevronLeft size={14} />
      </div>
      {text}
    </motion.button>
  );
};

export default BackButton;
