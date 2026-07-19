import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { auth } from "../firebase"; // Adjust path if your firebase.js is elsewhere
import { onAuthStateChanged } from "firebase/auth";

export default function ClearanceProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Live Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-sm font-bold text-zinc-400 uppercase tracking-widest">
          <svg className="animate-spin h-5 w-5 text-zinc-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Authenticating Node...
        </div>
      </div>
    );
  }

  // Security Redirect
  if (!user) return <Navigate to="/login" />;

  const securityNodeId = `NID-${user.uid.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Clearance Dossier</h1>
            <p className="text-sm font-mono text-zinc-500 mt-2 uppercase tracking-wider">
              System Authorization Level // Active
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200/50 uppercase tracking-widest shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Uplink Secured
          </div>
        </div>

        {/* ── SPLIT GRID LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── LEFT COLUMN: Cryptographic Identity ── */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden">
              {/* Top Security Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900"></div>
              
              <div className="flex flex-col items-center mt-4">
                
                {/* Enterprise Squircle Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-inner overflow-hidden mb-5 flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-zinc-400 uppercase font-mono">
                      {user.email.charAt(0)}
                    </span>
                  )}
                </div>
                
                {/* Core Identity */}
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight text-center">
                  {user.displayName || "Field Officer"}
                </h2>
                <p className="text-xs font-mono text-zinc-500 mb-6 text-center">{user.email}</p>
                
                {/* Hardened Data Tags */}
                <div className="w-full space-y-3">
                  <div className="w-full flex justify-between items-end border-b border-zinc-100 pb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Node ID</span>
                    <span className="text-xs font-mono font-bold text-zinc-800">{securityNodeId}</span>
                  </div>
                  
                  <div className="w-full flex justify-between items-end border-b border-zinc-100 pb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clearance</span>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 tracking-widest uppercase">
                      TIER-4: TS
                    </span>
                  </div>

                  <div className="w-full flex justify-between items-end pb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Affiliation</span>
                    <span className="text-xs font-bold text-zinc-800">NCRB Cyber Cell</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action */}
            <Link to="/settings" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm font-bold rounded-xl transition-all shadow-sm">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93... "/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Command Configuration
            </Link>

          </div>

          {/* ── RIGHT COLUMN: Data Panels ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Operational Telemetry (Stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Active Interventions</span>
                <span className="text-3xl font-mono font-bold text-zinc-900">14</span>
              </div>
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Threats Mitigated</span>
                <span className="text-3xl font-mono font-bold text-zinc-900">892</span>
              </div>
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Session Hours</span>
                <span className="text-3xl font-mono font-bold text-zinc-900">42<span className="text-sm font-sans text-zinc-400 ml-1 font-medium tracking-normal">hrs</span></span>
              </div>
            </div>

            {/* 2. Module Authorizations (Working Connections) */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Authorized Modules</h3>
                <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">EXP: 45 DAYS</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                

                {/* Active Enterprise Card */}
                <Link to="/module/ficn-vision" className="flex items-center justify-between p-4 rounded-lg bg-white border border-zinc-200 border-l-4 border-l-emerald-500 hover:border-zinc-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 mb-0.5">FICN Vision Agent</span>
                    <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Status: Active</span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </Link>

                {/* Pending Request */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 border border-zinc-200 border-l-4 border-l-amber-400 opacity-80 cursor-not-allowed">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-500 mb-0.5">Fraud Graph Intel</span>
                    <span className="text-[10px] font-mono text-amber-600 uppercase tracking-widest">Pending Review</span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>

            {/* 3. Immutable Audit Logs */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Security Audit Log</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timestamp</th>
                      <th className="pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Event Protocol</th>
                      <th className="pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Auth Vector</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 font-mono text-zinc-500 text-[11px]">
                        {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toISOString().replace('T', ' ').substring(0, 19) : '0000-00-00 00:00:00'}
                      </td>
                      <td className="py-2.5 font-medium text-zinc-800 text-xs">Secure Node Session Init</td>
                      <td className="py-2.5">
                        <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-zinc-200">OAUTH-V3</span>
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 font-mono text-zinc-500 text-[11px]">Previous Session Data</td>
                      <td className="py-2.5 font-medium text-zinc-800 text-xs">MFA Cryptographic Challenge</td>
                      <td className="py-2.5">
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-200">SUCCESS</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors opacity-50">
                      <td className="py-2.5 font-mono text-zinc-500 text-[11px]">System Genesis Record</td>
                      <td className="py-2.5 font-medium text-zinc-800 text-xs">Clearance Manifest Generated</td>
                      <td className="py-2.5">
                        <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-zinc-200">ADMIN-KEY</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}