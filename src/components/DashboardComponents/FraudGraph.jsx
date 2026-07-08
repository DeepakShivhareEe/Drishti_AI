export default function FraudGraph() {
  return (
    <div className="w-full h-[700px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative flex items-center justify-center">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-start z-10">
        <div>
          <h2 className="text-lg font-bold text-white">Fraud Graph Intelligence</h2>
          <p className="text-xs text-zinc-400 font-medium">Cluster ID: #FN-104 (Cross-Border Digital Arrest)</p>
        </div>
        <span className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-400 font-bold uppercase tracking-wider">
          AI Graph Generated
        </span>
      </div>

      {/* SVG Connections (Lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="50%" y1="30%" x2="50%" y2="50%" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="35%" y2="70%" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="65%" y2="70%" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="65%" y1="70%" x2="80%" y2="55%" stroke="#ef4444" strokeWidth="2" />
      </svg>

      {/* Node 1: Origin (Top) */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-14 h-14 bg-zinc-900 border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        </div>
        <span className="mt-2 text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Scam Call Center</span>
        <span className="text-[10px] text-zinc-500 mt-1">IP: 45.22.19.11</span>
      </div>

      {/* Node 2: The Caller (Center) */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-16 h-16 bg-zinc-900 border-2 border-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] z-10">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
        </div>
        <span className="mt-2 text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Spoofed Number</span>
        <span className="text-[10px] text-zinc-500 mt-1">+91 98XXX XXXXX</span>
      </div>

      {/* Node 3: Mule Account A (Bottom Left) */}
      <div className="absolute top-[70%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-14 h-14 bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <span className="mt-2 text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Mule A (HDFC)</span>
        <span className="text-[10px] text-zinc-500 mt-1">₹4.2L Transferred</span>
      </div>

      {/* Node 4: Mule Account B (Bottom Right) */}
      <div className="absolute top-[70%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-14 h-14 bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <span className="mt-2 text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Mule B (ICICI)</span>
        <span className="text-[10px] text-zinc-500 mt-1">₹1.8L Transferred</span>
      </div>

      {/* Node 5: The Ultimate Target / Cash out (Far Right) */}
      <div className="absolute top-[55%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-12 h-12 bg-red-500/10 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
        </div>
        <span className="mt-2 text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Crypto Exchange</span>
      </div>

    </div>
  );
}