import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-2xl p-8 md:p-12"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
        <div className="text-slate-600 space-y-6">
          <p className="font-medium">By accessing the DRISHTI Platform, you agree to the following terms:</p>
          <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Authorized Use Only</h2>
            <p>Access is restricted to verified law enforcement officers, nodal officers, and authorized banking partners. Attempting to bypass security controls is a federal offense.</p>
          </motion.section>
          <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Data Accuracy</h2>
            <p>While the AI-powered graph intelligence provides high-confidence predictive scores, physical verification protocols must be followed before executing an arrest or blocking accounts permanently.</p>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
}
