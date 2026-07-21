import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWithAuth, createEventSourceWithAuth } from "../utils/api";
const API_BASE = "http://localhost:8000/api/v1/fraud-graph";

// ── Hardcoded demo data (fallback when backend is offline) ──
const DEMO_NETWORKS = [
  {
    id: 1,
    name: "Cross-Border Digital Arrest Ring",
    description: "Organised syndicate impersonating CBI/ED officers via VOIP calls.",
    risk_score: 92.5,
    status: "Active",
    jurisdiction: "Pan-India (Delhi, Mumbai, Bengaluru)",
    total_amount_inr: 1760000,
    nodes: [
      { id: 101, network_id: 1, node_type: "scammer", label: "Scam Compound (Myanmar)", risk_score: 95, city: "Myawaddy, Myanmar", metadata: { ip: "45.22.19.11", agents: 15 } },
      { id: 102, network_id: 1, node_type: "voip", label: "VOIP Spoofing Hub", risk_score: 88, city: "Kolkata, WB", metadata: { numbers_used: 47 } },
      { id: 103, network_id: 1, node_type: "scammer", label: "Script Controller", risk_score: 90, city: "New Delhi, DL", metadata: { scripts: ["CBI warrant", "ED investigation"] } },
      { id: 104, network_id: 1, node_type: "victim", label: "Victim — Priya S.", risk_score: 10, city: "Mumbai, MH", metadata: { amount_lost: 420000 } },
      { id: 105, network_id: 1, node_type: "victim", label: "Victim — Rajesh K.", risk_score: 10, city: "Bengaluru, KA", metadata: { amount_lost: 680000 } },
      { id: 106, network_id: 1, node_type: "mule", label: "Mule A (HDFC)", risk_score: 75, city: "Mumbai, MH", metadata: { bank: "HDFC", turnover: 420000 } },
      { id: 107, network_id: 1, node_type: "mule", label: "Mule B (ICICI)", risk_score: 72, city: "Bengaluru, KA", metadata: { bank: "ICICI", turnover: 680000 } },
      { id: 108, network_id: 1, node_type: "crypto", label: "Crypto Exchange", risk_score: 85, city: "Mumbai, MH", metadata: { platform: "WazirX" } },
      { id: 109, network_id: 1, node_type: "device", label: "Device #4A2F", risk_score: 45, city: "New Delhi, DL", metadata: { model: "Redmi Note 12" } },
    ],
    edges: [
      { id: 201, source_node_id: 101, target_node_id: 102, edge_type: "call", weight: 5.0, metadata: { calls: 234 } },
      { id: 202, source_node_id: 102, target_node_id: 103, edge_type: "call", weight: 4.0, metadata: {} },
      { id: 203, source_node_id: 103, target_node_id: 104, edge_type: "call", weight: 3.0, metadata: { impersonation: "CBI" } },
      { id: 204, source_node_id: 103, target_node_id: 105, edge_type: "call", weight: 3.0, metadata: { impersonation: "ED" } },
      { id: 205, source_node_id: 104, target_node_id: 106, edge_type: "transaction", weight: 4.2, metadata: { amount: 420000 } },
      { id: 206, source_node_id: 105, target_node_id: 107, edge_type: "transaction", weight: 6.8, metadata: { amount: 680000 } },
      { id: 207, source_node_id: 106, target_node_id: 108, edge_type: "fund_relay", weight: 8.0, metadata: {} },
      { id: 208, source_node_id: 107, target_node_id: 108, edge_type: "fund_relay", weight: 5.0, metadata: {} },
      { id: 209, source_node_id: 109, target_node_id: 103, edge_type: "device_link", weight: 2.0, metadata: {} },
    ],
  },
];

const DEMO_STATS = {
  total_networks: 1,
  total_nodes: 9,
  total_edges: 9,
  total_fraud_amount_inr: 1760000,
  max_risk_score: 92.5,
  critical_networks: 1,
  unique_entity_types: 5,
};


/**
 * Transform backend network data into the { nodes, links } format
 * expected by react-force-graph-2d.
 */
function toGraphData(network) {
  if (!network || !network.nodes || !network.edges) {
    return { nodes: [], links: [] };
  }

  const nodes = network.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    nodeType: n.node_type,
    riskScore: n.risk_score || 0,
    city: n.city || "",
    metadata: n.metadata || {},
    // Force graph physics
    val: Math.max(2, (n.risk_score || 50) / 10), // Node size
  }));

  const links = network.edges.map((e) => ({
    id: e.id,
    source: e.source_node_id,
    target: e.target_node_id,
    edgeType: e.edge_type,
    weight: e.weight || 1,
    metadata: e.metadata || {},
  }));

  return { nodes, links };
}


export default function useFraudGraph() {
  const [networks, setNetworks] = useState([]);
  const [activeNetwork, setActiveNetwork] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [stats, setStats] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveData, setIsLiveData] = useState(false);
  const [connectionState, setConnectionState] = useState("DISCONNECTED");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sseRef = useRef(null);

  // ── Fetch all networks on mount ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [networksRes, statsRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/networks`),
          fetchWithAuth(`${API_BASE}/stats`),
        ]);

        if (!networksRes.ok) throw new Error("Networks fetch failed");

        const networksData = await networksRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : DEMO_STATS;

        if (networksData.length > 0) {
          setNetworks(networksData);
          setActiveNetwork(networksData[0]);
          setGraphData(toGraphData(networksData[0]));
          setIsLiveData(true);
        } else {
          setNetworks(DEMO_NETWORKS);
          setActiveNetwork(DEMO_NETWORKS[0]);
          setGraphData(toGraphData(DEMO_NETWORKS[0]));
        }

        setStats(statsData);
      } catch {
        // Backend offline → use demo data
        setNetworks(DEMO_NETWORKS);
        setActiveNetwork(DEMO_NETWORKS[0]);
        setGraphData(toGraphData(DEMO_NETWORKS[0]));
        setStats(DEMO_STATS);
        setError("Using demo data — backend offline");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── SSE listener for live graph updates (Upgrade #4) ──
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
        sseRef.current = sse;
        setConnectionState("CONNECTED");

    sse.addEventListener("new_fraud_node", (event) => {
      try {
        const data = JSON.parse(event.data);
        // Inject as a temporary node into the current graph
        setGraphData((prev) => ({
          nodes: [
            ...prev.nodes,
            {
              id: `live-${data.node_id}`,
              label: `${data.category} (${data.city})`,
              nodeType: "scammer",
              riskScore: data.threat_level === "Critical" ? 90 : data.threat_level === "High" ? 70 : 50,
              city: data.city,
              metadata: { live: true, threat_level: data.threat_level },
              val: 5,
            },
          ],
          links: prev.links,
        }));
        setIsLiveData(true);
      } catch {
        // Ignore parse errors
      }
    });

    sse.onerror = () => {
      setConnectionState("ERROR");
      setIsLiveData(false);
      if (sse) sse.close();
    };

    } catch (err) {
      setConnectionState("ERROR");
    }
    };
    connectSSE();

    return () => {
      isMounted = false;
      if (sse) sse.close();
      sseRef.current = null;
    };
  }, []);

  // ── Select a network ──
  const selectNetwork = useCallback(
    (networkId) => {
      const net = networks.find((n) => n.id === networkId);
      if (net) {
        setActiveNetwork(net);
        setGraphData(toGraphData(net));
        setSelectedNode(null);
        setAnalysisResult(null);
      }
    },
    [networks]
  );

  // ── Select a node ──
  const selectNode = useCallback((node) => {
    setSelectedNode(node || null);
  }, []);

  // ── AI Analysis ──
  const analyzeNetwork = useCallback(
    async (networkId) => {
      setIsAnalyzing(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ network_id: networkId || activeNetwork?.id }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const result = await res.json();
        setAnalysisResult(result);
        return result;
      } catch (err) {
        setError("AI Analysis failed — is backend running?");
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activeNetwork]
  );

  // ── Download evidence package ──
  const downloadEvidence = useCallback(
    async (networkId) => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE}/evidence/${networkId || activeNetwork?.id}`
        );
        if (!res.ok) throw new Error("Evidence generation failed");
        const data = await res.json();

        // Trigger JSON file download
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DRISHTI_Evidence_${data.case_reference?.replace(/\//g, "-") || "package"}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError("Evidence download failed — is backend running?");
      }
    },
    [activeNetwork]
  );

  return {
    networks,
    activeNetwork,
    graphData,
    stats,
    selectedNode,
    isLoading,
    error,
    isLiveData,
    connectionState,
    analysisResult,
    isAnalyzing,
    selectNetwork,
    selectNode,
    analyzeNetwork,
    downloadEvidence,
  };
}
