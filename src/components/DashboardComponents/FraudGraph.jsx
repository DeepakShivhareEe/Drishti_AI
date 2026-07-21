import { useState, useEffect, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";

const API_BASE = "http://localhost:8000/api/v1/fraud-graph";

const NODE_COLORS = {
  scammer: "#ef4444",
  mule: "#3b82f6",
  victim: "#a855f7",
  voip: "#f97316",
  crypto: "#eab308",
  device: "#6b7280",
  bank: "#06b6d4",
};

const NODE_EMOJIS = {
  scammer: "🏢",
  mule: "💰",
  victim: "👤",
  voip: "📞",
  crypto: "🪙",
  device: "📱",
  bank: "🏦",
};

// Static fallback data for when backend is offline
const DEMO_GRAPH = {
  nodes: [
    { id: 1, label: "Scam Compound", nodeType: "scammer", val: 8 },
    { id: 2, label: "VOIP Hub", nodeType: "voip", val: 6 },
    { id: 3, label: "Script Controller", nodeType: "scammer", val: 7 },
    { id: 4, label: "Victim — Priya", nodeType: "victim", val: 3 },
    { id: 5, label: "Victim — Rajesh", nodeType: "victim", val: 3 },
    { id: 6, label: "Mule A (HDFC)", nodeType: "mule", val: 5 },
    { id: 7, label: "Mule B (ICICI)", nodeType: "mule", val: 5 },
    { id: 8, label: "Crypto Exchange", nodeType: "crypto", val: 6 },
  ],
  links: [
    { source: 1, target: 2, edgeType: "call" },
    { source: 2, target: 3, edgeType: "call" },
    { source: 3, target: 4, edgeType: "call" },
    { source: 3, target: 5, edgeType: "call" },
    { source: 4, target: 6, edgeType: "transaction" },
    { source: 5, target: 7, edgeType: "transaction" },
    { source: 6, target: 8, edgeType: "fund_relay" },
    { source: 7, target: 8, edgeType: "fund_relay" },
  ],
};

const DEMO_STATS = {
  total_networks: 3,
  total_nodes: 29,
  total_edges: 34,
  total_fraud_amount_inr: 7150000,
  max_risk_score: 92.5,
  critical_networks: 1,
};

function formatCurrency(amount) {
  if (!amount) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount}`;
}

export default function FraudGraph() {
  const [graphData, setGraphData] = useState(DEMO_GRAPH);
  const [stats, setStats] = useState(DEMO_STATS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const graphRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [networksRes, statsRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/networks`),
          fetchWithAuth(`${API_BASE}/stats`),
        ]);

        if (networksRes.ok) {
          const networks = await networksRes.json();
          // Use highest-risk network for the mini preview
          if (networks.length > 0) {
            const top = networks[0];
            const nodes = (top.nodes || []).map((n) => ({
              id: n.id,
              label: n.label,
              nodeType: n.node_type,
              val: Math.max(3, (n.risk_score || 50) / 12),
            }));
            const links = (top.edges || []).map((e) => ({
              source: e.source_node_id,
              target: e.target_node_id,
              edgeType: e.edge_type,
            }));
            if (nodes.length > 0) {
              setGraphData({ nodes, links });
              setIsLive(true);
            }
          }
        }

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        // Use demo data
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const color = NODE_COLORS[node.nodeType] || "#6b7280";
    const size = Math.max(5, node.val * 1.2);

    // Glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
    ctx.fillStyle = color + "20";
    ctx.fill();

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.nodeType === "victim" ? "#18181b" : color;
    ctx.fill();
    if (node.nodeType === "victim") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Emoji
    ctx.font = `${size * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(NODE_EMOJIS[node.nodeType] || "📌", node.x, node.y);

    // Label
    if (globalScale > 0.8) {
      const fontSize = Math.max(8, 10 / globalScale);
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const label = node.label.length > 16 ? node.label.slice(0, 14) + "…" : node.label;
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(label, node.x, node.y + size + 3);
    }
  }, []);

  return (
    <div className="w-full h-[700px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative flex flex-col">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-start z-10 bg-gradient-to-b from-zinc-950/90 to-transparent pointer-events-none">
        <div>
          <h2 className="text-lg font-bold text-white">Fraud Graph Intelligence</h2>
          <p className="text-xs text-zinc-400 font-medium">
            {isLoading ? "Fetching network data..." : `${isLive ? "Live" : "Demo"} Preview • Highest-risk network`}
          </p>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            to="/workspace/fraud-graph"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-xs font-bold rounded-lg border border-violet-500/30 transition-colors"
          >
            Open Full Workspace →
          </Link>
          <span className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-400 font-bold uppercase tracking-wider">
            AI Graph
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg space-y-8 animate-pulse p-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-zinc-800/80 border border-zinc-700/50 relative">
                <div className="absolute top-1/2 -left-20 w-16 h-0.5 bg-zinc-800/80"></div>
                <div className="absolute top-1/2 -right-20 w-16 h-0.5 bg-zinc-800/80"></div>
                <div className="absolute -bottom-12 left-1/2 w-0.5 h-10 bg-zinc-800/80"></div>
              </div>
            </div>
            <div className="flex justify-between px-10">
              <div className="w-16 h-16 rounded-full bg-zinc-800/60 border border-zinc-700/50"></div>
              <div className="w-20 h-20 rounded-full bg-zinc-800/60 border border-zinc-700/50"></div>
            </div>
            <div className="flex justify-center mt-10">
              <div className="h-4 w-48 bg-zinc-800 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 w-full px-5 py-3 bg-gradient-to-t from-zinc-950/90 to-transparent z-10 flex items-center gap-6 text-[11px] text-zinc-500 font-medium pointer-events-none">
        <span>Networks: <span className="text-zinc-300 font-mono">{stats.total_networks}</span></span>
        <span>Nodes: <span className="text-zinc-300 font-mono">{stats.total_nodes}</span></span>
        <span>Edges: <span className="text-zinc-300 font-mono">{stats.total_edges}</span></span>
        <span>Peak Risk: <span className="text-red-400 font-mono">{stats.max_risk_score}</span></span>
        <span>Total Fraud: <span className="text-amber-400 font-mono">{formatCurrency(stats.total_fraud_amount_inr)}</span></span>
      </div>

      {/* Force Graph */}
      <div className="flex-1">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodeRelSize={6}
          linkColor={(link) => {
            if (link.edgeType === "transaction" || link.edgeType === "fund_relay") return "#ef444460";
            if (link.edgeType === "call") return "#a855f740";
            return "#52525b40";
          }}
          linkWidth={(link) => (link.edgeType === "transaction" ? 2 : 1)}
          linkLineDash={(link) => (link.edgeType === "call" || link.edgeType === "device_link" ? [4, 4] : [])}
          linkDirectionalParticles={(link) =>
            link.edgeType === "transaction" || link.edgeType === "fund_relay" ? 2 : 0
          }
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "#ef4444"}
          linkDirectionalParticleSpeed={0.004}
          backgroundColor="#09090b"
          cooldownTicks={60}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.35}
          enableNodeDrag={true}
          enableZoomInteraction={true}
        />
      </div>
    </div>
  );
}