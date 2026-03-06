import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-gold',
    outline: 'btn-outline-gold',
    dark: 'bg-black text-white hover:bg-gray-900',
  };

  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
