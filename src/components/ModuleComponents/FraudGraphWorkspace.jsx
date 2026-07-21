import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import useFraudGraph from "../../hooks/useFraudGraph";

// ── Node type → visual config ──
const NODE_STYLES = {
  scammer: { color: "#ef4444", emoji: "🏢", label: "Scammer" },
  mule:    { color: "#3b82f6", emoji: "💰", label: "Mule Account" },
  victim:  { color: "#a855f7", emoji: "👤", label: "Victim" },
  voip:    { color: "#f97316", emoji: "📞", label: "VOIP Hub" },
  crypto:  { color: "#eab308", emoji: "🪙", label: "Crypto" },
  device:  { color: "#6b7280", emoji: "📱", label: "Device" },
  bank:    { color: "#06b6d4", emoji: "🏦", label: "Bank" },
};

const EDGE_COLORS = {
  transaction: "#ef4444",
  fund_relay: "#f97316",
  call: "#a855f7",
  device_link: "#6b7280",
  account_link: "#3b82f6",
};

function formatCurrency(amount) {
  if (!amount) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default function FraudGraphWorkspace() {
  const graphRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hiddenNodeTypes, setHiddenNodeTypes] = useState(new Set());
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const {
    networks,
    activeNetwork,
    graphData,
    stats,
    selectedNode,
    isLoading,
    error,
    isLiveData,
    analysisResult,
    isAnalyzing,
    selectNetwork,
    selectNode,
    analyzeNetwork,
    downloadEvidence,
  } = useFraudGraph();

  // Resize observer for the flex container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    // Initial measurement
    updateDimensions();

    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute node type counts for the legend
  const nodeCounts = useMemo(() => {
    const counts = {};
    if (graphData?.nodes) {
      graphData.nodes.forEach(n => {
        counts[n.nodeType] = (counts[n.nodeType] || 0) + 1;
      });
    }
    return counts;
  }, [graphData]);

  // Filter graph data based on hidden node types (and clone to prevent physics engine corruption)
  const filteredGraphData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };
    
    let nodes = graphData.nodes
      .filter(n => !hiddenNodeTypes.has(n.nodeType))
      .map(n => ({ ...n })); // Clone node
      
    const nodeIds = new Set(nodes.map(n => n.id));
    
    let links = graphData.links
      .filter(l => {
        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
        const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
        return nodeIds.has(srcId) && nodeIds.has(tgtId);
      })
      .map(l => ({
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target
      })); // Clone link and reset to primitive IDs

    return { nodes, links };
  }, [graphData, hiddenNodeTypes]);

  // ForceGraph mutates objects in place, so we MUST give it a stable, cloned set of data
  // and we coerce IDs to strings to prevent D3 force layout type mismatches.
  const safeGraphData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };
    
    // Deep clone nodes and ensure string IDs
    const nodes = graphData.nodes.map(n => ({ ...n, id: String(n.id) }));
    
    // Deep clone links and ensure string IDs for source/target
    const links = graphData.links.map(l => ({
      ...l,
      source: String(typeof l.source === 'object' ? l.source.id : l.source),
      target: String(typeof l.target === 'object' ? l.target.id : l.target)
    }));

    return { nodes, links };
  }, [graphData]);

  useEffect(() => {
    window.debugGraphData = filteredGraphData;
    console.log("Filtered graph data:", filteredGraphData);
  }, [filteredGraphData]);

  // ── Auto-zoom to fit when data changes ──
  useEffect(() => {
    if (graphRef.current && safeGraphData.nodes.length > 0) {
      // Safely wait for simulation to stabilize before zooming
      const timer = setTimeout(() => {
        if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
          try {
            graphRef.current.zoomToFit(400, 50);
          } catch (err) {
            console.error("ZoomToFit failed:", err);
          }
        }
      }, 1500); // Increased delay to ensure physics has settled
      return () => clearTimeout(timer);
    }
  }, [safeGraphData]);

  // Click-to-expand highlighting logic
  useEffect(() => {
    if (selectedNode) {
      const newHighlightNodes = new Set([String(selectedNode.id)]);
      const newHighlightLinks = new Set();
      
      safeGraphData.links.forEach(link => {
        const srcId = String(typeof link.source === 'object' ? link.source.id : link.source);
        const tgtId = String(typeof link.target === 'object' ? link.target.id : link.target);
        const selId = String(selectedNode.id);
        
        if (srcId === selId || tgtId === selId) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(srcId === selId ? tgtId : srcId);
        }
      });
      
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [selectedNode, safeGraphData]);


  const toggleNodeType = (type) => {
    const newSet = new Set(hiddenNodeTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setHiddenNodeTypes(newSet);
  };

  // ── Custom node rendering on Canvas ──
  const paintNode = useCallback((node, ctx, globalScale) => {
    if (!window.hasLoggedNodeCoords) {
      console.log("PAINT NODE TICK 1:", { id: node.id, x: node.x, y: node.y, width: dimensions.width });
      window.hasLoggedNodeCoords = true;
    }
    if (!node || typeof node.x !== 'number' || typeof node.y !== 'number' || isNaN(node.x) || isNaN(node.y)) {
      if (!window.lastDebugLogFail || Date.now() - window.lastDebugLogFail > 2000) {
        console.log("paintNode early return for node:", node?.id, "x:", node?.x, "y:", node?.y);
        window.lastDebugLogFail = Date.now();
      }
      return;
    }

    if (!window.lastDebugLog || Date.now() - window.lastDebugLog > 2000) {
      console.log("paintNode rendering node:", node.id, "x:", node.x, "y:", node.y, "scale:", globalScale);
      window.lastDebugLog = Date.now();
    }

    try {
      const style = NODE_STYLES[node.nodeType] || NODE_STYLES.device;
      const size = node.riskScore ? Math.max(6, node.riskScore / 6) : Math.max(6, (node.val || 1) * 1.5);
      const isSelected = selectedNode && String(selectedNode.id) === String(node.id);
      const isHovered = hoveredNode && String(hoveredNode) === String(node.id);
      
      const labelStr = node.label || "";
      const matchesSearch = searchQuery && labelStr.toLowerCase().includes(searchQuery.toLowerCase());
      const isHighlighted = (highlightNodes.size === 0 || highlightNodes.has(node.id)) && (!searchQuery || matchesSearch);

      // Dim nodes if not highlighted
      ctx.globalAlpha = isHighlighted ? 1 : 0.2;

      // Make font size fixed in canvas units, relative to node size so it scales naturally with zoom
      const fontSize = 4.5;

      // High risk pulsing ring
      if (node.riskScore >= 90) {
        const pulseRadius = size + 2 + Math.abs(Math.sin(Date.now() / 300)) * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)"; // Red pulse
        ctx.fill();
      }

      // Glow effect
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
        ctx.fillStyle = style.color + "30";
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#ffffff" : style.color + "60";
      ctx.fill();

      // Main circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = node.nodeType === "victim" ? "#18181b" : style.color;
      ctx.fill();
      if (node.nodeType === "victim") {
        ctx.strokeStyle = style.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Inner icon (emoji)
      if (style.emoji) {
        ctx.font = `${size * 0.8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = node.nodeType === "victim" ? style.color : "#000000";
        ctx.fillText(style.emoji, node.x, node.y);
      }

      // Label below (only show if zoomed in, or explicitly hovered/searched to reduce clutter)
      if (globalScale > 1.2 || isSelected || isHovered || matchesSearch) {
        ctx.font = `${isSelected || matchesSearch ? "bold " : ""}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Label background
        const labelText = labelStr.length > 20 ? labelStr.slice(0, 18) + "…" : labelStr;
        const textWidth = ctx.measureText(labelText).width;
        const padding = 2;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(
          node.x - textWidth / 2 - padding,
          node.y + size + 3,
          textWidth + padding * 2,
          fontSize + padding * 1.5
        );

        ctx.fillStyle = isSelected || matchesSearch ? "#ffffff" : "#d4d4d8";
        ctx.fillText(labelText, node.x, node.y + size + 4);
      }
    } catch (e) {
      console.error("paintNode error", e);
    } finally {
      ctx.globalAlpha = 1; // reset
    }
  }, [selectedNode, hoveredNode, highlightNodes, searchQuery]);

  // ── Custom link rendering ──
  const paintLink = useCallback((link, ctx) => {
    if (!link.source || typeof link.source !== 'object' || typeof link.source.x !== 'number') return;
    if (!link.target || typeof link.target !== 'object' || typeof link.target.x !== 'number') return;

    try {
      const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link);
      ctx.globalAlpha = isHighlighted ? 1 : 0.15;

      const color = EDGE_COLORS[link.edgeType] || "#52525b";
      const width = Math.max(0.5, Math.min((link.weight || 1) * 0.4, 3));

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);

      if (link.edgeType === "call" || link.edgeType === "device_link") {
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -Date.now() / 50; 
      } else {
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = color + "80";
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const angle = Math.atan2(dy, dx);
      const arrowLen = 6;
      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowLen * Math.cos(angle - Math.PI / 6),
        midY - arrowLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowLen * Math.cos(angle + Math.PI / 6),
        midY - arrowLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } catch (e) {
      console.error("paintLink error", e);
    } finally {
      ctx.globalAlpha = 1; // reset
    }
  }, [highlightLinks]);

  if (isLoading) {
    return (
      <div className="w-full h-[750px] bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-400 text-sm font-medium">Loading fraud intelligence networks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-zinc-950 overflow-hidden m-0 p-0">

      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Fraud Graph Intelligence</h2>
            <p className="text-zinc-500 text-[11px] font-medium">
              {isLiveData ? "Live" : "Demo"} • {activeNetwork?.name || "No network selected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => analyzeNetwork()}
            disabled={isAnalyzing}
            className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-lg border border-violet-400/50 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          >
            {isAnalyzing ? "Analyzing..." : "✨ AI Analysis"}
          </button>
          <button
            onClick={() => downloadEvidence()}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            📄 Evidence Package
          </button>
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
            isLiveData
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}>
            {isLiveData ? "● Live" : "◌ Demo"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden w-full">

        {/* ── LEFT SIDEBAR — Network Selector ── */}
        <div className="w-[240px] bg-zinc-900/50 border-r border-zinc-800 overflow-y-auto shrink-0">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Networks</p>
          </div>
          <div className="p-2 space-y-1">
            {networks.map((net) => (
              <button
                key={net.id}
                onClick={() => selectNetwork(net.id)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  activeNetwork?.id === net.id
                    ? "bg-violet-500/15 border border-violet-500/30"
                    : "bg-transparent hover:bg-zinc-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-white text-xs font-bold leading-tight pr-2">
                    {net.name}
                  </p>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    net.risk_score >= 85
                      ? "bg-red-500/20 text-red-400"
                      : net.risk_score >= 70
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {net.risk_score}
                  </span>
                </div>
                <p className="text-zinc-500 text-[10px] font-medium line-clamp-2">
                  {net.jurisdiction || "Pan-India"}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-600">
                  <span>{net.nodes?.length || 0} nodes</span>
                  <span>•</span>
                  <span>{net.edges?.length || 0} edges</span>
                  <span>•</span>
                  <span>{formatCurrency(net.total_amount_inr)}</span>
                </div>
                {net.risk_score >= 90 && (
                  <div className="mt-2 text-[9px] text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    Updated just now
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-zinc-800 mt-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
              Legend
              <span className="text-[9px] text-zinc-600 font-normal normal-case">Click to filter</span>
            </p>
            <div className="space-y-1">
              {Object.entries(NODE_STYLES).map(([key, style]) => {
                const count = nodeCounts[key] || 0;
                const isHidden = hiddenNodeTypes.has(key);
                return (
                  <button 
                    key={key} 
                    onClick={() => toggleNodeType(key)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer ${isHidden ? 'opacity-40 grayscale' : 'opacity-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: style.color }} />
                      <span className="text-zinc-300 text-[11px] font-medium">{style.emoji} {style.label}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CENTER — Force Graph Canvas ── */}
        <div className="flex-1 w-full h-full relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-zinc-950 to-zinc-950 overflow-hidden" ref={containerRef}>
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

          {/* Top Search Bar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search nodes by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-[11px] rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-violet-500 w-56 shadow-lg backdrop-blur-sm"
              />
              <svg className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-700 shadow-lg backdrop-blur-sm">
            <button onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-300 cursor-pointer" title="Zoom In">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            <button onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-300 cursor-pointer" title="Zoom Out">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <button onClick={() => graphRef.current?.zoomToFit(400)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-300 cursor-pointer" title="Fit to Screen">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          </div>

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-medium">
              {error}
            </div>
          )}

          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width || 800}
            height={dimensions.height || 600}
            graphData={safeGraphData}
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            nodeRelSize={6}
            nodeLabel={(node) => `
              <div style="background: #18181b; border: 1px solid #3f3f46; padding: 8px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); font-family: Inter, system-ui, sans-serif; font-size: 12px; color: #d4d4d8;">
                <div style="font-weight: 600; color: #ffffff; margin-bottom: 2px;">${node.label}</div>
                <div style="color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${node.nodeType}</div>
                <div style="display: flex; gap: 12px; font-size: 11px;">
                  <div>Risk: <span style="color: ${node.riskScore > 80 ? '#ef4444' : '#eab308'}; font-weight: 600;">${node.riskScore || 'N/A'}</span></div>
                  <div>Role: <span style="color: #ffffff;">${node.metadata?.role || node.metadata?.method || 'Unknown'}</span></div>
                </div>
              </div>
            `}
            linkDirectionalParticles={(link) =>
              link.edgeType === "transaction" || link.edgeType === "fund_relay" ? 3 : 0
            }
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={(link) => EDGE_COLORS[link.edgeType] || "#52525b"}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={(node) => selectNode(node)}
            onNodeHover={(node) => setHoveredNode(node?.id || null)}
            backgroundColor="rgba(0,0,0,0)"
            cooldownTicks={80}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        </div>

        {/* ── RIGHT SIDEBAR — Intelligence Panel ── */}
        <div className="w-[280px] bg-zinc-900/50 border-l border-zinc-800 overflow-y-auto shrink-0">
          {selectedNode ? (
            <div className="p-4">
              {/* Node Header */}
              <div className="mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{NODE_STYLES[selectedNode.nodeType]?.emoji || "📌"}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{selectedNode.label}</p>
                    <p className="text-zinc-500 text-[10px]">{NODE_STYLES[selectedNode.nodeType]?.label || selectedNode.nodeType}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedNode.riskScore >= 70
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : selectedNode.riskScore >= 40
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  Risk: {selectedNode.riskScore}/100
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                {selectedNode.city && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-xs">Location</span>
                    <span className="text-zinc-300 text-xs font-medium">{selectedNode.city}</span>
                  </div>
                )}
                {selectedNode.metadata && Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-zinc-500 text-xs capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-zinc-300 text-xs font-mono max-w-[140px] truncate text-right">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Connected Edges */}
              <div className="mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Connections</p>
                <div className="space-y-1.5">
                  {graphData.links
                    .filter((l) => {
                      const srcId = typeof l.source === "object" ? l.source.id : l.source;
                      const tgtId = typeof l.target === "object" ? l.target.id : l.target;
                      return srcId === selectedNode.id || tgtId === selectedNode.id;
                    })
                    .map((l, i) => (
                      <div key={i} className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EDGE_COLORS[l.edgeType] || "#52525b" }} />
                          <span className="text-zinc-400 text-[10px] capitalize">{l.edgeType?.replace(/_/g, " ")}</span>
                          <span className="text-zinc-600 text-[10px]">w: {l.weight}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 transition-colors cursor-pointer">
                🚩 Flag for Investigation
              </button>
            </div>
          ) : analysisResult ? (
            /* AI Analysis Results */
            <div className="p-4">
              <div className="mb-4 pb-3 border-b border-zinc-800">
                <p className="text-white font-bold text-sm mb-1">🧠 AI Pattern Analysis</p>
                <p className="text-zinc-500 text-[10px]">{analysisResult.network_name}</p>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Overall Risk</span>
                  <span className={`text-xs font-bold ${
                    analysisResult.overall_risk >= 80 ? "text-red-400" : "text-orange-400"
                  }`}>{analysisResult.overall_risk}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Total Nodes</span>
                  <span className="text-zinc-300 text-xs font-mono">{analysisResult.total_nodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Total Edges</span>
                  <span className="text-zinc-300 text-xs font-mono">{analysisResult.total_edges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Est. Amount</span>
                  <span className="text-zinc-300 text-xs font-mono">{formatCurrency(analysisResult.estimated_total_amount)}</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Detected Patterns</p>
                <div className="space-y-2">
                  {analysisResult.detected_patterns?.map((p, i) => (
                    <div key={i} className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-800">
                      <p className="text-zinc-300 text-[11px] leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-violet-400 text-[11px] font-bold mb-1">Recommendation</p>
                <p className="text-zinc-300 text-[11px]">{analysisResult.recommendation}</p>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="p-4 flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
              </div>
              <p className="text-zinc-500 text-xs font-medium mb-1">Select a Node</p>
              <p className="text-zinc-600 text-[10px] max-w-[180px]">
                Click any node on the graph to view its intelligence details, or run AI Analysis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ── */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-zinc-900/90 border-t border-zinc-800 gap-y-2 gap-x-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">Nodes: <span className="text-zinc-300 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{graphData.nodes.length}</span></span>
          <span className="flex items-center gap-1.5">Edges: <span className="text-zinc-300 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{graphData.links.length}</span></span>
          {activeNetwork && (
            <>
              <span className="flex items-center gap-1.5">Risk: <span className={`font-mono px-1.5 py-0.5 rounded bg-zinc-800 ${
                activeNetwork.risk_score >= 80 ? "text-red-400" : "text-orange-400"
              }`}>{activeNetwork.risk_score}</span></span>
              <span className="flex items-center gap-1.5">Amount: <span className="text-emerald-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{formatCurrency(activeNetwork.total_amount_inr)}</span></span>
            </>
          )}
        </div>
        {stats && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-600">
            <span>Total Networks: {stats.total_networks}</span>
            <span>Critical: <span className="text-red-400 font-medium">{stats.critical_networks}</span></span>
            <span>Total Fraud: <span className="text-amber-400 font-medium">{formatCurrency(stats.total_fraud_amount_inr)}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
