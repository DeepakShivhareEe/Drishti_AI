import { useState } from "react";
import DashboardHeader from "../components/DashboardComponents/DashboardHeader";
import TopMetrics from "../components/DashboardComponents/TopMetrics";
import LiveThreatFeed from "../components/DashboardComponents/LiveThreatFeed";
import GeospatialMap from "../components/DashboardComponents/GeospatialMap";
import FICNTable from "../components/DashboardComponents/FICNTable";
import FraudGraph from "../components/DashboardComponents/FraudGraph"; // Import the new Graph!

export default function Dashboard() {
  // Now defaulting to our cleaner ID
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* VIEW 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in duration-500">
            <TopMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LiveThreatFeed />
              <GeospatialMap variant="compact" />
            </div>
            <FICNTable />
          </div>
        )}

        {/* VIEW 2: FULL GEOSPATIAL MAP */}
        {activeTab === "map" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GeospatialMap variant="full" />
          </div>
        )}

        {/* VIEW 3: FRAUD GRAPH NETWORK */}
        {activeTab === "graph" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FraudGraph />
          </div>
        )}

      </div>
    </div>
  );
}