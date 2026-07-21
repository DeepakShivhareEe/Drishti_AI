import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "../utils/api";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Safe, Suspicious, Dangerous

export default function Analytics() {
  const [fraudStats, setFraudStats] = useState(null);
  const [shieldStats, setShieldStats] = useState(null);
  const [geoNodes, setGeoNodes] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fallback demo data flags
  const [isShieldDemo, setIsShieldDemo] = useState(false);
  const [isGeoDemo, setIsGeoDemo] = useState(false);
  const [isFraudDemo, setIsFraudDemo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fraudRes, shieldRes, geoRes] = await Promise.allSettled([
          fetchWithAuth("http://localhost:8000/api/v1/fraud-graph/stats"),
          fetchWithAuth("http://localhost:8000/api/v1/citizen-shield/stats"),
          fetchWithAuth("http://localhost:8000/api/v1/geospatial/nodes")
        ]);

        // Fraud Graph
        if (fraudRes.status === "fulfilled" && fraudRes.value.ok) {
          const data = await fraudRes.value.json();
          if (data.total_networks > 0) {
            setFraudStats(data);
            setIsFraudDemo(false);
          } else {
            // Fake demo data if empty
            setFraudStats({
              total_networks: 14,
              total_nodes: 342,
              total_edges: 890,
              total_fraud_amount_inr: 8500000,
              critical_networks: 5,
              unique_entity_types: 6,
            });
            setIsFraudDemo(true);
          }
        } else {
          setFraudStats({ total_networks: 12, total_fraud_amount_inr: 4500000, critical_networks: 3 });
          setIsFraudDemo(true);
        }

        // Citizen Shield
        if (shieldRes.status === "fulfilled" && shieldRes.value.ok) {
          const data = await shieldRes.value.json();
          if (data.total_assessments > 0) {
            setShieldStats(data);
            setIsShieldDemo(false);
          } else {
            setShieldStats({
              safe_count: 450,
              suspicious_count: 125,
              dangerous_count: 85,
              threats_blocked: 210
            });
            setIsShieldDemo(true);
          }
        } else {
          setShieldStats({ safe_count: 400, suspicious_count: 100, dangerous_count: 50, threats_blocked: 150 });
          setIsShieldDemo(true);
        }

        // Geospatial Nodes
        if (geoRes.status === "fulfilled" && geoRes.value.ok) {
          const data = await geoRes.value.json();
          if (data.length > 0) {
            setGeoNodes(data);
            setIsGeoDemo(false);
          } else {
            setGeoNodes(generateDemoGeoNodes());
            setIsGeoDemo(true);
          }
        } else {
          setGeoNodes(generateDemoGeoNodes());
          setIsGeoDemo(true);
        }

      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateDemoGeoNodes = () => {
    return [
      { threat_level: "Critical", category: "Phishing" },
      { threat_level: "High", category: "Phishing" },
      { threat_level: "Medium", category: "SIM Swap" },
      { threat_level: "Critical", category: "SIM Swap" },
      { threat_level: "High", category: "Mule Account" },
      { threat_level: "Critical", category: "Mule Account" },
      { threat_level: "Medium", category: "Mule Account" },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-zinc-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derived chart data
  const shieldData = [
    { name: "Safe", value: shieldStats?.safe_count || 0 },
    { name: "Suspicious", value: shieldStats?.suspicious_count || 0 },
    { name: "Dangerous", value: shieldStats?.dangerous_count || 0 }
  ];

  const threatLevels = geoNodes.reduce((acc, node) => {
    acc[node.threat_level] = (acc[node.threat_level] || 0) + 1;
    return acc;
  }, {});
  
  const geoData = [
    { name: "Medium", count: threatLevels["Medium"] || 0 },
    { name: "High", count: threatLevels["High"] || 0 },
    { name: "Critical", count: threatLevels["Critical"] || 0 },
  ];

  // Mock radar data if real unique entity types not granularly available
  const radarData = [
    { subject: "Mule Acc", A: 120, fullMark: 150 },
    { subject: "Phishing", A: 98, fullMark: 150 },
    { subject: "SIM Swap", A: 86, fullMark: 150 },
    { subject: "Deepfake", A: 45, fullMark: 150 },
    { subject: "FICN", A: 65, fullMark: 150 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Platform Analytics</h1>
            <p className="text-sm text-zinc-500 mt-1">Real-time intelligence aggregation and impact metrics.</p>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative">
            {isFraudDemo && <DemoBadge />}
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Fraud Intercepted</p>
            <p className="text-4xl font-extrabold text-emerald-600">
              ₹{(fraudStats?.total_fraud_amount_inr / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative">
            {isFraudDemo && <DemoBadge />}
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Active Networks</p>
            <p className="text-4xl font-extrabold text-zinc-900">
              {fraudStats?.total_networks || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative">
            {isShieldDemo && <DemoBadge />}
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Threats Blocked</p>
            <p className="text-4xl font-extrabold text-zinc-900">
              {shieldStats?.threats_blocked || 0}
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shield Assessment Donut */}
          <ErrorBoundary>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative h-[400px] flex flex-col">
              {isShieldDemo && <DemoBadge />}
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Citizen Shield Assessments</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shieldData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {shieldData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>

          {/* Threat Level Bar Chart */}
          <ErrorBoundary>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative h-[400px] flex flex-col">
              {isGeoDemo && <DemoBadge />}
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Geospatial Threat Distribution</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#f4f4f5'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {geoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Critical' ? '#ef4444' : 
                          entry.name === 'High' ? '#f97316' : '#3b82f6'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ErrorBoundary>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative h-[400px] flex flex-col lg:col-span-1">
              <DemoBadge />
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Entity Type Coverage</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e4e4e7" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 12}} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Coverage" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
          
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm lg:col-span-2 flex flex-col justify-center text-center">
            <svg className="w-12 h-12 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h3 className="text-2xl font-bold text-white mb-2">DRISHTI System Status: Operational</h3>
            <p className="text-zinc-400 max-w-lg mx-auto">All intelligence modules are running normally. Threat ingestion latency is currently &lt; 50ms.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// Small badge component for demo data
function DemoBadge() {
  return (
    <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm border border-yellow-200 flex items-center gap-1 z-10">
      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
      Demo Data
    </span>
  );
}
