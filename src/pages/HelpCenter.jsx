import React from 'react';

export default function HelpCenter() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Help Center & Support</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Get 24/7 technical and operational support for the DRISHTI platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl">
            <h3 className="text-xl font-semibold text-emerald-600 mb-3">Priority Escalation</h3>
            <p className="text-slate-600 text-sm mb-4">For active, high-threat cyber incidents requiring immediate platform intervention.</p>
            <div className="text-slate-800 font-medium">1-800-DRISHTI-SOS</div>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">General Support</h3>
            <p className="text-slate-600 text-sm mb-4">For account issues, clearance upgrades, and platform bugs.</p>
            <div className="text-slate-800 font-medium">support@drishti.gov.in</div>
          </div>
        </div>
      </div>
    </div>
  );
}
