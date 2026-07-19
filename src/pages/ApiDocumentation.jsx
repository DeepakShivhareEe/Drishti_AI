import React from 'react';

export default function ApiDocumentation() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">API Documentation</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Integrate DRISHTI's intelligence into your custom agency tools with our secure REST APIs.
        </p>
        
        <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-6 font-mono text-sm mb-8">
          <div className="text-slate-400 mb-4">// Base URL</div>
          <div className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg inline-block mb-6">
            https://api.drishti.gov.in/v1
          </div>
          
          <div className="text-slate-400 mb-2">// Authentication</div>
          <div className="text-slate-300 mb-6 leading-relaxed">
            All endpoints require a valid <span className="text-emerald-400">Bearer Token</span> provided in the Authorization header.<br/>
            Requests must be made over TLS 1.2 or higher.
          </div>

          <div className="text-slate-400 mb-2">// Example Request</div>
          <div className="bg-black/50 p-4 rounded-lg text-slate-300">
            curl -X GET \<br/>
            &nbsp;&nbsp;https://api.drishti.gov.in/v1/intelligence/graph/analyze \<br/>
            &nbsp;&nbsp;-H 'Authorization: Bearer YOUR_API_KEY'
          </div>
        </div>
      </div>
    </div>
  );
}
