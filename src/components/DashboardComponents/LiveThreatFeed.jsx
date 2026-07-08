import { useState, useEffect } from "react";
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

  // ── Simulate Real-Time Incoming Threats ──
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAlerts((prevAlerts) => {
        // Pick a random alert from our mock data pool
        const randomThreat = INCOMING_MOCK_DATA[Math.floor(Math.random() * INCOMING_MOCK_DATA.length)];
        
        const newAlert = {
          id: `NEW-${Math.floor(Math.random() * 10000)}`,
          ...randomThreat,
          time: "Just now",
        };

        // Add the new alert to the top, and keep only the latest 15 to prevent lag
        return [newAlert, ...prevAlerts].slice(0, 15);
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
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isLive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isLive ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </div>
        
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
      </div>

      {/* Feed List */}
      <div className="p-2 overflow-y-auto flex-1 overflow-x-hidden">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
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
    </div>
  );
}