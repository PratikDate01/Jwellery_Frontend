import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullPage = true }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-24 h-24">
        {/* Animated outer ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[3px] border-gold-200 border-t-gold-500 rounded-full"
        />
        
        {/* Inner static ring for luxury look */}
        <div className="absolute inset-2 border border-gold-100 rounded-full opacity-40"></div>
        
        {/* Animated central gold piece */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-8 gold-gradient rounded-full shadow-lg shadow-gold-500/20"
        />
      </div>
      
      <div className="text-center space-y-2">
        <motion.h2 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gold-600 font-serif text-xl tracking-[0.2em] font-medium"
        >
          MAISON LUXE
        </motion.h2>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-gold-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (!fullPage) return loaderContent;

  return (
    <div className="fixed inset-0 z-[1000] bg-white/90 backdrop-blur-md flex items-center justify-center">
      {loaderContent}
    </div>
  );
};

export default Loader;
