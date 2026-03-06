import React from 'react';
import { motion } from 'framer-motion';
import { Award, History, Users, ShieldCheck } from 'lucide-react';
import BackButton from '../components/common/BackButton';

const About = () => {
  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-12">
          <BackButton />
        </div>
        <header className="max-w-3xl mb-24">
          <span className="text-gold-600 font-bold uppercase tracking-[0.4em] text-[10px] block mb-6">Our Legacy</span>
          <h1 className="text-6xl font-serif text-slate-900 leading-tight mb-8">Crafting Timeless <span className="italic text-gold-500">Masterpieces</span> Since 1995.</h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed">
            From a small boutique in Pune to a leading luxury marketplace, our journey has always been about one thing: The pursuit of absolute perfection in every piece we create.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
          {[
            { icon: Award, title: "Exquisite Artistry", desc: "Every piece is handcrafted by master artisans with decades of experience." },
            { icon: ShieldCheck, title: "Absolute Purity", desc: "100% BIS Hallmarked gold and GIA/IGI certified diamonds for total peace of mind." },
            { icon: History, title: "Heritage & Trust", desc: "A legacy of trust built over three decades of serving thousands of happy families." },
            { icon: Users, title: "Customer First", desc: "Personalized service that treats every client like a member of our own family." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                <item.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed uppercase">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
          <div className="relative aspect-square rounded-[60px] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1573408302382-903e55a2d0c7?q=80&w=2000" 
              alt="Craftsmanship" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-10">
            <h2 className="text-4xl font-serif text-slate-900 leading-tight">Meticulously Handcrafted <br/> For Your Most <span className="text-gold-500 italic">Precious Moments.</span></h2>
            <div className="space-y-8">
              <p className="text-slate-500 leading-relaxed">
                We believe that jewellery is more than just an accessory; it's a vessel for memories, an heirloom to be passed down through generations, and a statement of your unique story.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Our design philosophy blends traditional Indian craftsmanship with modern aesthetics, ensuring that every piece remains as relevant and beautiful tomorrow as it is today.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
