import React from 'react';
import { motion } from 'framer-motion';

export default function TrainingManuals() {
  const manuals = [
    { title: "Module 1: Getting Started with DRISHTI", desc: "Learn the basics of navigation, profile setup, and clearance levels." },
    { title: "Module 2: Advanced Graph Intelligence", desc: "Deep dive into identifying complex fraud rings using the Fraud Graph feature." },
    { title: "Module 3: Citizen Shield Ops", desc: "Protocols for handling community-reported threats and intelligence." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold text-slate-900 mb-6 tracking-tight"
        >
          Training Manuals
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-600 mb-8 text-lg"
        >
          Access comprehensive guides and manuals to understand and utilize the DRISHTI platform effectively.
        </motion.p>
        <div className="space-y-6">
          {manuals.map((mod, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
              key={i}
              className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{mod.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{mod.desc}</p>
              <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 rounded-lg text-sm transition-colors border border-emerald-500/20">Download PDF</button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
