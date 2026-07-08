import { useState } from "react";

const MAP_NODES = [
  { id: 1, top: "35%", left: "30%", city: "New Delhi, DL", type: "Scam Compound", threat: "Critical", ip: "192.168.1.44", color: "bg-red-500", shadow: "shadow-red-500/50" },
  { id: 2, top: "65%", left: "35%", city: "Mumbai, MH", type: "FICN Drop Point", threat: "High", ip: "N/A (Physical)", color: "bg-orange-500", shadow: "shadow-orange-500/50" },
  { id: 3, top: "75%", left: "45%", city: "Bengaluru, KA", type: "Mule Accounts", threat: "Medium", ip: "10.4.22.1", color: "bg-blue-500", shadow: "shadow-blue-500/50" },
  { id: 4, top: "50%", left: "70%", city: "Kolkata, WB", type: "Cross-border VOIP", threat: "Critical", ip: "45.22.19.11", color: "bg-red-500", shadow: "shadow-red-500/50" }
];

export default function GeospatialMap({ variant = "compact" }) {
  const [activeNode, setActiveNode] = useState(MAP_NODES[0]);

  // Adjust height based on whether it is in the overview or its own dedicated tab
  const heightClass = variant === "full" ? "h-[700px]" : "h-[500px]";

  return (
    <div className={`lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative flex flex-col ${heightClass}`}>
      
      {/* Map Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-5 bg-gradient-to-b from-zinc-950/90 to-transparent z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-lg font-bold text-white">Geospatial Intelligence</h2>
          <p className="text-xs text-zinc-400 font-medium">Live Node Tracking</p>
        </div>
      </div>
      
      {/* The Map Canvas */}
      <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 relative overflow-hidden">
        {/* Radar Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Connective Graph Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="30%" y1="35%" x2="45%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="30%" y1="35%" x2="70%" y2="50%" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Render Interactive Nodes */}
        {MAP_NODES.map((node) => (
          <button
            key={node.id}
            onClick={() => setActiveNode(node)}
            className="absolute group z-20 focus:outline-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-125"
            style={{ top: node.top, left: node.left }}
          >
            <div className={`w-16 h-16 rounded-full absolute -top-6 -left-6 blur-xl opacity-20 group-hover:opacity-60 transition-opacity ${node.color}`}></div>
            <div className={`w-4 h-4 rounded-full border-2 border-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${node.color} ${node.shadow} ${activeNode.id === node.id ? 'ring-4 ring-white/20' : ''}`}></div>
            
            {/* Tiny Label on Map */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {node.city}
            </div>
          </button>
        ))}
      </div>

      {/* Floating Info Panel for Active Node */}
      <div className="absolute bottom-5 right-5 w-72 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-4 z-30">
        <div className="flex justify-between items-start mb-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-white font-bold text-sm">{activeNode.city}</h3>
            <p className="text-zinc-400 text-xs">{activeNode.type}</p>
          </div>
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
            activeNode.threat === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            activeNode.threat === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {activeNode.threat}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-500 text-xs font-medium">Traced IP:</span>
            <span className="text-zinc-300 text-xs font-mono">{activeNode.ip}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 text-xs font-medium">Status:</span>
            <span className="text-emerald-400 text-xs font-medium">Active Monitoring</span>
          </div>
        </div>
        <button className="w-full mt-4 py-2 bg-white text-zinc-900 text-xs font-bold rounded hover:bg-zinc-200 transition-colors">
          Dispatch Action Plan
        </button>
      </div>

    </div>
  );
}