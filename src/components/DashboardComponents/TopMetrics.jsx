import React, { useState, useEffect } from 'react';

function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const target = parseFloat(value);
    
    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(target * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(animation);
  }, [value, duration]);

  const displayValue = count.toFixed(decimals);
  return <>{prefix}{displayValue}{suffix}</>;
}

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-[#1A3FA0]/5 p-6 rounded-2xl border border-[#1A3FA0]/20 shadow-md flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Active Scams Prevented</p>
          <p className="text-3xl font-extrabold text-zinc-900">
            <AnimatedCounter value={142} />
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white text-[#1A3FA0] flex items-center justify-center border border-[#1A3FA0]/20 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
      <div className="bg-[#0F9D78]/5 p-6 rounded-2xl border border-[#0F9D78]/20 shadow-md flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Counterfeit Value Intercepted</p>
          <p className="text-3xl font-extrabold text-zinc-900">
            <AnimatedCounter value={8.4} prefix="₹" suffix="L" decimals={1} />
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white text-[#0F9D78] flex items-center justify-center border border-[#0F9D78]/20 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border-2 border-[#E5484D]/40 shadow-md flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[#E5484D]/10 animate-pulse pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-[#E5484D] uppercase tracking-wider mb-1">High-Risk Hostage Alerts</p>
          <p className="text-3xl font-extrabold text-red-600">
            <AnimatedCounter value={3} />
          </p>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-full bg-red-50 text-[#E5484D] flex items-center justify-center border border-red-200 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
      </div>
    </div>
  );
}