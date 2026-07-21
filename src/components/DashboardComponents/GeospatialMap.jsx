import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { fetchWithAuth, createEventSourceWithAuth } from "../../utils/api";

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

// ── Client-side demo nodes (fallback when backend is unreachable) ──
const DEMO_NODES = [
  { id: "demo-1",  category: "Scam Compound",       latitude: 28.6139, longitude: 77.2090, city: "New Delhi, DL",   threat_level: "Critical", ip_address: "192.168.1.44",  status: "Active", details: "Voice match: Fake CBI Script" },
  { id: "demo-2",  category: "FICN Drop Point",      latitude: 19.0760, longitude: 72.8777, city: "Mumbai, MH",     threat_level: "High",     ip_address: null,            status: "Active", details: "Rs 500 counterfeits intercepted" },
  { id: "demo-3",  category: "Mule Accounts",        latitude: 12.9716, longitude: 77.5946, city: "Bengaluru, KA",  threat_level: "Medium",   ip_address: "10.4.22.1",     status: "Active", details: "3 linked bank accounts flagged" },
  { id: "demo-4",  category: "Cross-border VOIP",    latitude: 22.5726, longitude: 88.3639, city: "Kolkata, WB",    threat_level: "Critical", ip_address: "45.22.19.11",   status: "Active", details: "Spoofed TRAI caller ID traced" },
  { id: "demo-5",  category: "Deep Fake Ops",        latitude: 26.9124, longitude: 75.7873, city: "Jaipur, RJ",     threat_level: "Critical", ip_address: "103.14.55.9",   status: "Active", details: "AI-generated impersonation of IPS officer" },
  { id: "demo-6",  category: "FICN Print Lab",       latitude: 13.0827, longitude: 80.2707, city: "Chennai, TN",    threat_level: "High",     ip_address: "172.16.8.22",   status: "Active", details: "Rs 2000 Super-fake plates recovered" },
  { id: "demo-7",  category: "Dark Web Laundering",  latitude: 23.0225, longitude: 72.5714, city: "Ahmedabad, GJ",  threat_level: "Critical", ip_address: "91.203.44.7",   status: "Active", details: "Crypto-to-INR mixer linked to 14 accounts" },
  { id: "demo-8",  category: "SIM Swap Ring",        latitude: 17.3850, longitude: 78.4867, city: "Hyderabad, TS",  threat_level: "High",     ip_address: "49.37.12.88",   status: "Active", details: "12 SIM swap fraud cases in 48hrs" },
  { id: "demo-9",  category: "Hawala Transfer Hub",  latitude: 26.8467, longitude: 80.9462, city: "Lucknow, UP",    threat_level: "Medium",   ip_address: null,            status: "Active", details: "Cross-border hawala pipeline identified" },
  { id: "demo-10", category: "Phishing Call Center",  latitude: 21.1702, longitude: 72.8311, city: "Surat, GJ",      threat_level: "High",     ip_address: "157.43.20.6",   status: "Active", details: "Fake KYC update scripts intercepted" },
  { id: "demo-11", category: "Mule Network Relay",   latitude: 25.5941, longitude: 85.1376, city: "Patna, BR",      threat_level: "Medium",   ip_address: "10.22.9.4",     status: "Active", details: "Fund relay chain across 8 accounts" },
  { id: "demo-12", category: "Counterfeit Passport",  latitude: 30.7333, longitude: 76.7794, city: "Chandigarh, PB", threat_level: "Critical", ip_address: "62.18.77.3",    status: "Active", details: "Forged passport documents traced to syndicate" },
].map(transformNode);

export default function GeospatialMap({ variant = "compact" }) {
  const [nodes, setNodes] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [connectionState, setConnectionState] = useState("DISCONNECTED");

  // ── 1. Fetch live nodes from backend, fall back to demo nodes ──
  useEffect(() => {
    fetchWithAuth(`${API_BASE}/nodes`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(transformNode);
        if (mapped.length > 0) {
          setNodes(mapped);
          setActiveNode(mapped[0]);
          setIsLiveData(true);
        } else {
          setNodes(DEMO_NODES);
          setActiveNode(DEMO_NODES[0]);
        }
      })
      .catch(() => {
        setNodes(DEMO_NODES);
        setActiveNode(DEMO_NODES[0]);
        toast("Using demo data — backend offline", { icon: "📡", duration: 3000 });
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── 2. Real-time SSE listener for live updates ──
  useEffect(() => {
    let sse;
    let isMounted = true;
    const connectSSE = async () => {
      setConnectionState("CONNECTING");
      try {
        const stream = await createEventSourceWithAuth(`${API_BASE}/stream`);
        if (!isMounted) {
          stream.close();
          return;
        }
        sse = stream;
        setConnectionState("CONNECTED");
        
        // EVENT 1: A new threat node was spawned (by simulation engine or AI module)
        sse.addEventListener("new_threat", (event) => {
          const raw = JSON.parse(event.data);
          const newNode = transformNode(raw);
          setNodes(prev => [newNode, ...prev]);
          setIsLiveData(true);
          toast(
            `🚨 Incoming: ${raw.category} at ${raw.city}`,
            { icon: "📍", duration: 4000 }
          );
        });

        // EVENT 2: A node was neutralized by a commander
        sse.addEventListener("node_neutralized", (event) => {
          const { node_id, city, category } = JSON.parse(event.data);
          setNodes(prev => prev.filter(n => n.id !== node_id));
          setActiveNode(prev => (prev?.id === node_id ? null : prev));
          setIsDispatching(false);
          toast.success(
            `✅ ${category} at ${city} neutralized`,
            { duration: 4000 }
          );
        });

        sse.onerror = (error) => {
          setConnectionState("ERROR");
          setIsLiveData(false);
          if (sse) sse.close();
        };
      } catch (error) {
        setConnectionState("ERROR");
      }
    };
    connectSSE();
    return () => { 
      isMounted = false;
      if (sse) sse.close(); 
    };
  }, []);

  // ── 3. Dispatch Action Plan → calls real backend API ──
  const handleDispatch = async () => {
    if (isDispatching || !activeNode) return;
    setIsDispatching(true);

    const targetCity = activeNode.city;

    try {
      const res = await fetchWithAuth(`${API_BASE}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: activeNode.id }),
      });

      if (!res.ok) throw new Error("Server error");
      // Node removal is handled by the SSE 'node_neutralized' event listener above.
      // No local state mutation here — keeps all clients in sync.
    } catch {
      toast.error(`Dispatch to ${targetCity} failed. Is the backend running?`);
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Geospatial Intelligence
            {connectionState === "CONNECTING" && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>}
            {connectionState === "CONNECTED" && <span className="flex h-2 w-2 relative"><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
            {connectionState === "ERROR" && <span className="flex h-2 w-2 relative"><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            {connectionState === "CONNECTING" ? "Connecting to stream..." : `${isLiveData ? "Live" : "Demo"} Node Tracking • ${nodes.length} active`}
          </p>
        </div>
      </div>
      
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-[2000] bg-zinc-950 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-500 font-bold tracking-widest uppercase animate-pulse">Initializing Map Engine...</p>
        </div>
      )}
      
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
            {isDispatching ? "Deploying Response Team..." : "Dispatch Action Plan"}
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