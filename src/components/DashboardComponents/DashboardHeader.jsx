export default function DashboardHeader({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">DRISHTI Command Center</h1>
      </div>
      
      <div className="flex bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
        {["Overview", "Geospatial Map", "Graph Network"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === tab.toLowerCase()
                ? "bg-[#1A3FA0] text-white shadow-md border border-[#1A3FA0]"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}