import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// The starting data when the page loads
const INITIAL_ALERTS = [
  { id: "DA-892", type: "Digital Arrest", status: "Critical", location: "Noida, UP", time: "1m ago", details: "Voice match: Fake CBI Script" },
  { id: "FN-104", type: "Fraud Network", status: "Warning", location: "Cross-border", time: "2m ago", details: "3 new mule accounts linked" },
  { id: "DA-891", type: "Digital Arrest", status: "Critical", location: "Bengaluru, KA", time: "5m ago", details: "Skype call > 4hrs flagged" },
  { id: "FC-442", type: "FICN Detected", status: "Alert", location: "Mumbai, MH", time: "12m ago", details: "Rs 500 (Serial: 8AC...)" },
];

// A pool of fake alerts to randomly generate over time
const INCOMING_MOCK_DATA = [
  { type: "Digital Arrest", status: "Critical", location: "Delhi, DL", details: "Video metadata: Deepfake detected" },
  { type: "FICN Detected", status: "Alert", location: "Kolkata, WB", details: "Rs 500 (UV feature fail)" },
  { type: "Fraud Network", status: "Warning", location: "Hyderabad, TS", details: "Suspicious bulk transfer flagged" },
  { type: "Digital Arrest", status: "Critical", location: "Pune, MH", details: "Spoofed TRAI caller ID" },
  { type: "Citizen Shield", status: "Warning", location: "Chennai, TN", details: "High volume of scam SMS reported" },
];

export default function LiveThreatFeed() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [isLive, setIsLive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Simulate Real-Time Incoming Threats ──
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAlerts((prevAlerts) => {
        // Pick a random alert from our mock data pool
        const randomThreat = INCOMING_MOCK_DATA[Math.floor(Math.random() * INCOMING_MOCK_DATA.length)];
        
        const newAlert = {
          id: `NEW-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
          ...randomThreat,
          time: "Just now",
        };

        // Add the new alert to the top, and keep only the latest 50 for the full view
        return [newAlert, ...prevAlerts].slice(0, 50);
      });
    }, 6000); // Generates a new alert every 6 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col h-[500px]">
      
      {/* Feed Header */}
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-zinc-900">Live Threat Feed</h2>
          
          {/* Toggle Switch for Live Updates */}
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all hover:scale-110 cursor-pointer ${isLive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-zinc-300 hover:bg-zinc-400'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isLive ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-all active:scale-95 cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Feed List */}
      <div className="p-2 overflow-y-auto flex-1 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence initial={false}>
          {alerts.slice(0, 15).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 hover:bg-zinc-50 rounded-xl transition-colors border-b border-zinc-50 last:border-0 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  alert.status === "Critical" ? "bg-red-50 text-red-600 border-red-100" :
                  alert.status === "Warning" ? "bg-orange-50 text-orange-600 border-orange-100" :
                  "bg-blue-50 text-blue-600 border-blue-100"
                }`}>
                  {alert.status}
                </span>
                <span className={`text-xs font-semibold ${alert.time === "Just now" ? "text-emerald-500 animate-pulse" : "text-zinc-400"}`}>
                  {alert.time}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-900 mb-1">{alert.type} • <span className="text-zinc-500 font-medium">{alert.location}</span></p>
              <p className="text-xs text-zinc-600">{alert.details}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Full View Modal via React Portal to prevent z-index clipping */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-zinc-200"
              >
                {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Live Threat Feed (Full View)</h2>
                  <p className="text-sm text-zinc-500 mt-1">Comprehensive real-time monitoring of all network threats across regions.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Grid View */}
              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <AnimatePresence initial={false}>
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            alert.status === "Critical" ? "bg-red-50 text-red-600 border-red-100" :
                            alert.status === "Warning" ? "bg-orange-50 text-orange-600 border-orange-100" :
                            "bg-blue-50 text-blue-600 border-blue-100"
                          }`}>
                            {alert.status}
                          </span>
                          <span className={`text-xs font-semibold ${alert.time === "Just now" ? "text-emerald-500 animate-pulse" : "text-zinc-400"}`}>
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-zinc-900 mb-1 leading-tight">{alert.type}</p>
                        <p className="text-sm text-zinc-500 font-medium mb-4 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {alert.location}
                        </p>
                        <div className="p-3 bg-zinc-50 rounded-lg text-sm text-zinc-700 border border-zinc-100 font-medium">
                          {alert.details}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}