import React from 'react';

export default function TrainingManuals() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Training Manuals</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Access comprehensive guides and manuals to understand and utilize the DRISHTI platform effectively.
        </p>
        <div className="space-y-6">
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Module 1: Getting Started with DRISHTI</h3>
            <p className="text-sm text-slate-500 mb-4">Learn the basics of navigation, profile setup, and clearance levels.</p>
            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 rounded-lg text-sm transition-colors border border-emerald-500/20">Download PDF</button>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Module 2: Advanced Graph Intelligence</h3>
            <p className="text-sm text-slate-500 mb-4">Deep dive into identifying complex fraud rings using the Fraud Graph feature.</p>
            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 rounded-lg text-sm transition-colors border border-emerald-500/20">Download PDF</button>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Module 3: Citizen Shield Ops</h3>
            <p className="text-sm text-slate-500 mb-4">Protocols for handling community-reported threats and intelligence.</p>
            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 rounded-lg text-sm transition-colors border border-emerald-500/20">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
