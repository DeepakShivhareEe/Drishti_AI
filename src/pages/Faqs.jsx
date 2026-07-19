import React from 'react';

export default function Faqs() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Frequently Asked Questions</h1>
        
        <div className="space-y-4 mt-8">
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">How do I request a clearance level upgrade?</h3>
            <p className="text-slate-600 text-sm">Clearance upgrades must be initiated by your department head and approved by the central nodal agency. Navigate to your Profile settings to download the requisition form.</p>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">What is the FICN Vision Agent?</h3>
            <p className="text-slate-600 text-sm">It's an automated AI agent that scans reported currency notes to trace the origins of Fake Indian Currency Notes (FICN) circulation rings.</p>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Is the Citizen Fraud Shield data real-time?</h3>
            <p className="text-slate-600 text-sm">Yes, reports submitted by citizens via the public app are synced to the DRISHTI platform in near real-time, passing through an initial AI verification layer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
