import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CommandSettings() {
  const [loading, setLoading] = useState(true);
  
  // Fake settings state
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [strictMode, setStrictMode] = useState(true);

  // Simulate a secure connection boot-up
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-sm font-bold text-zinc-400 uppercase tracking-widest">
          <svg className="animate-spin h-5 w-5 text-zinc-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Fetching Command Protocols...
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAFAFA] pt-28 pb-24 font-sans"
    >
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Command Settings</h1>
            <p className="text-sm font-mono text-zinc-500 mt-2 uppercase tracking-wider">
              Terminal Preferences & Security Protocols
            </p>
          </div>
          <Link to="/profile" className="flex items-center gap-2 text-[11px] font-mono font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 px-3 py-2 rounded-md border border-zinc-200 uppercase tracking-widest shadow-sm transition-colors">
            ← Return to Dossier
          </Link>
        </div>

        <div className="space-y-8">
          
          {/* ── SECTION 1: ACCESS PROTOCOLS ── */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Access & Security Protocols</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Multi-Factor Authentication (MFA)</h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-wide">Require biometric or token approval for command access.</p>
                </div>
                <button 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none border ${mfaEnabled ? 'bg-emerald-500 border-emerald-600' : 'bg-zinc-200 border-zinc-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${mfaEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>

              <div className="border-t border-zinc-100"></div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Global Threat Telemetry</h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-wide">Share anonymized incident logs with the central NCRB database.</p>
                </div>
                <button 
                  onClick={() => setTelemetryEnabled(!telemetryEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none border ${telemetryEnabled ? 'bg-emerald-500 border-emerald-600' : 'bg-zinc-200 border-zinc-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${telemetryEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>

              <div className="border-t border-zinc-100"></div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Strict IP Enforcement</h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-wide">Block access attempts from non-government network ranges.</p>
                </div>
                <button 
                  onClick={() => setStrictMode(!strictMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none border ${strictMode ? 'bg-emerald-500 border-emerald-600' : 'bg-zinc-200 border-zinc-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${strictMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: API CONFIGURATIONS ── */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.872c0-.142.03-.281.088-.411l14.814-33.33a1.5 1.5 0 00-1.077-2.012l-5.636-1.503a1.5 1.5 0 00-1.84 1.076L.087 18.243a1.5 1.5 0 00.916 1.84l5.637 1.504c.123.033.252.05.38.05z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4.872c0-.142.03-.281.088-.411l14.814-33.33" /></svg>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">System API Keys</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Vision Model Endpoint Key</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="password" 
                      value="sk-live-drishti-892374982374982374" 
                      readOnly
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-mono text-zinc-500 focus:outline-none"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <button className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Regenerate
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono mt-2">
                  <span className="text-amber-600 font-bold">Warning:</span> Regenerating this key will disconnect all active remote surveillance agents.
                </p>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: DANGER ZONE ── */}
          <div className="bg-red-50/30 border border-red-200 rounded-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-red-200 bg-red-50/50 flex items-center gap-3">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Danger Zone</h3>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Revoke All Active Sessions</h4>
                <p className="text-[11px] font-mono text-zinc-500 mt-1">Instantly terminate all active logins associated with your Government ID across all devices.</p>
              </div>
              <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap shadow-sm">
                Terminate Sessions
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}