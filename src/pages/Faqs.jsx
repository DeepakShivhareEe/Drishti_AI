import React from 'react';
import { motion } from 'framer-motion';

export default function Faqs() {
  const faqsList = [
    { q: "How do I request a clearance level upgrade?", a: "Clearance upgrades must be initiated by your department head and approved by the central nodal agency. Navigate to your Profile settings to download the requisition form." },
    { q: "What is the FICN Vision Agent?", a: "It's an automated AI agent that scans reported currency notes to trace the origins of Fake Indian Currency Notes (FICN) circulation rings." },
    { q: "Is the Citizen Fraud Shield data real-time?", a: "Yes, reports submitted by citizens via the public app are synced to the DRISHTI platform in near real-time, passing through an initial AI verification layer." }
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
          Frequently Asked Questions
        </motion.h1>
        
        <div className="space-y-4 mt-8">
          {faqsList.map((faq, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
              key={i}
              className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-slate-600 text-sm">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
