import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
        <div className="text-slate-600 space-y-6">
          <p className="text-sm font-medium text-slate-400">Last Updated: October 2026</p>
          <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">1. Data Collection</h2>
            <p>DRISHTI acts as a secure platform for law enforcement and intelligence agencies. All data processed through this portal is classified and strictly governed by national data protection frameworks.</p>
          </motion.section>
          <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">2. Use of Information</h2>
            <p>Information uploaded, including logs, citizen reports, and transaction data, is utilized solely for predictive fraud prevention and threat intelligence graph generation.</p>
          </motion.section>
          <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">3. Confidentiality</h2>
            <p>Platform access is strictly monitored. Audit logs are maintained for every query executed by agency personnel. Unauthorized data exfiltration will result in immediate suspension and penal action.</p>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
}
