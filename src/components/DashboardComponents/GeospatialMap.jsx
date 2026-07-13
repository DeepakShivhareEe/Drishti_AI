import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";

// ── Backend API base URL ──
const API_BASE = "http://localhost:8000/api/v1/geospatial";

// ── Threat level → visual styling mapping ──
const THREAT_STYLES = {
  Critical: { color: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
  High:     { color: "#f97316", glow: "rgba(249, 115, 22, 0.4)" },
  Medium:   { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
};

// Helper: transform a DB row into a map-ready node object
function transformNode(row) {
  const style = THREAT_STYLES[row.threat_level] || THREAT_STYLES.Medium;
  return {
    id: row.id,
    coords: [row.latitude, row.longitude],
    city: row.city,
    type: row.category,
    threat: row.threat_level,
    ip: row.ip_address || "N/A",
    status: row.status,
    details: row.details || "",
    color: style.color,
    glow: style.glow,
  };
}

// Custom function to create glowing HTML markers
const createCyberIcon = (color, glow, isActive) => {
  return L.divIcon({
    className: "bg-transparent",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <div style="position: absolute; width: 100%; height: 100%; background-color: ${glow}; border-radius: 50%;" class="animate-ping"></div>
        <div style="width: 14px; height: 14px; background-color: ${color}; border-radius: 50%; border: 2px solid #18181b; box-shadow: 0 0 10px ${color};" class="${isActive ? 'ring-2 ring-white/80 scale-125' : ''} transition-all duration-300"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function GeospatialMap({ variant = "compact" }) {
  const [nodes, setNodes] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── 1. Fetch live nodes from backend on mount ──
  useEffect(() => {
    fetch(`${API_BASE}/nodes`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(transformNode);
        setNodes(mapped);
        if (mapped.length > 0) setActiveNode(mapped[0]);
      })
      .catch(() => toast.error("Failed to load geospatial nodes. Is the backend running?"))
      .finally(() => setIsLoading(false));
  }, []);

  // ── 2. Real-time SSE listener for live updates ──
  useEffect(() => {
    const sse = new EventSource(`${API_BASE}/stream`);

    // EVENT 1: A new threat node was created by an AI module
    sse.addEventListener("new_threat", (event) => {
      const raw = JSON.parse(event.data);
      const newNode = transformNode(raw);
      setNodes(prev => [newNode, ...prev]);
      toast(`🚨 New threat at ${raw.city}!`, { icon: "📍" });
    });

    // EVENT 2: A node was dispatched by a commander (possibly another client)
    sse.addEventListener("node_dispatched", (event) => {
      const { node_id } = JSON.parse(event.data);
      setNodes(prev => prev.filter(n => n.id !== node_id));
      setActiveNode(prev => (prev?.id === node_id ? null : prev));
      toast.success(`Node ${node_id} dispatched by command center.`, { duration: 3000 });
    });

    return () => sse.close();
  }, []);

  // ── 3. Dispatch Action Plan → calls real backend API ──
  const handleDispatch = async () => {
    if (isDispatching || !activeNode) return;
    setIsDispatching(true);

    const loadingToast = toast.loading(
      `Initiating threat neutralization at ${activeNode.city}...`
    );

    try {
      const res = await fetch(`${API_BASE}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: activeNode.id }),
      });

      if (res.ok) {
        toast.success(`Action Plan Dispatched for ${activeNode.city}!`, {
          id: loadingToast,
          duration: 4000,
        });
        // Remove dispatched node from local state
        const remaining = nodes.filter(n => n.id !== activeNode.id);
        setNodes(remaining);
        setActiveNode(remaining.length > 0 ? remaining[0] : null);
      } else {
        throw new Error("Server error");
      }
    } catch {
      toast.error("Dispatch failed. Is the backend running?", { id: loadingToast });
    } finally {
      setIsDispatching(false);
    }
  };

  // Adjust height based on whether it is in the overview or its own dedicated tab
  const heightClass = variant === "full" ? "h-[700px]" : "h-[500px]";

  return (
    <div className={`lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative flex flex-col ${heightClass}`}>
      
      {/* ── UI OVERLAYS (Z-Index must be high to sit over Leaflet) ── */}
      
      {/* Map Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-5 bg-gradient-to-b from-zinc-950/90 to-transparent z-[1000] flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-lg font-bold text-white">Geospatial Intelligence</h2>
          <p className="text-xs text-zinc-400 font-medium">
            {isLoading ? "Connecting to backend..." : `Live Node Tracking • ${nodes.length} active`}
          </p>
        </div>
      </div>
      
      {/* Floating Info Panel for Active Node */}
      {activeNode && (
        <div className="absolute bottom-5 right-5 w-72 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-4 z-[1000] pointer-events-auto transition-all duration-300">
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
          <button 
            onClick={handleDispatch}
            disabled={isDispatching}
            className={`w-full mt-4 py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
              isDispatching 
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" 
                : "bg-white text-zinc-900 hover:bg-zinc-200"
            }`}
          >
            {isDispatching ? "Dispatching..." : "Dispatch Action Plan"}
          </button>
        </div>
      )}

      {/* ── THE INTERACTIVE MAP CANVAS ── */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[22.5937, 78.9629]}
          zoom={4.5} 
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#0e0e0e' }}
        >
          {/* Free CartoDB Dark Matter Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Connective Graph Lines between nodes */}
          {nodes.length >= 2 && (
            <>
              {nodes.slice(1).map((node) => (
                <Polyline
                  key={`line-${nodes[0].id}-${node.id}`}
                  positions={[nodes[0].coords, node.coords]}
                  pathOptions={{ 
                    color: node.threat === 'Critical' ? '#ef4444' : '#3b82f6', 
                    weight: 2, 
                    dashArray: '5, 8',
                    opacity: 0.4
                  }}
                />
              ))}
            </>
          )}

          {/* Render Interactive Nodes */}
          {nodes.map((node) => (
            <Marker
              key={node.id}
              position={node.coords}
              icon={createCyberIcon(node.color, node.glow, activeNode?.id === node.id)}
              eventHandlers={{
                click: () => setActiveNode(node),
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}