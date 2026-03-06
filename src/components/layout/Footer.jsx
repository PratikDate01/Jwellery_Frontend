import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-900 border-t border-slate-100 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-serif tracking-[0.15em] text-slate-900">LUXE JEWELS</span>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs uppercase tracking-widest font-medium">
              Crafting timeless elegance in Pune since 1995. Our commitment to purity and artistry defines our legacy.
            </p>
            <div className="flex space-x-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-slate-400 hover:text-gold-500 transition-colors">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-8">The Collection</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li><Link to="/shop" className="hover:text-gold-500 transition-colors">All Jewellery</Link></li>
              <li><Link to="/shop?category=gold" className="hover:text-gold-500 transition-colors">Gold Collection</Link></li>
              <li><Link to="/shop?category=diamond" className="hover:text-gold-500 transition-colors">Diamond Selection</Link></li>
              <li><Link to="/shop?category=bridal" className="hover:text-gold-500 transition-colors">Bridal Couture</Link></li>
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-8">Assistance</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">Returns & Exchange</Link></li>
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">Client FAQ</Link></li>
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">Jewellery Care</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-8">Visit Us</h4>
            <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-start gap-4">
                <MapPin size={16} className="text-gold-500 shrink-0" />
                <span className="leading-relaxed">MG Road, Camp, Pune, <br /> Maharashtra 411001</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={16} className="text-gold-500 shrink-0" />
                <span>+91 20 2613 4567</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={16} className="text-gold-500 shrink-0" />
                <span>concierge@luxejewels.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            © 2026 Luxe Jewels Private Limited. Pune, India.
          </p>
          <div className="flex items-center gap-8 grayscale opacity-40">
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-4" />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-4" />
            <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" className="h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
