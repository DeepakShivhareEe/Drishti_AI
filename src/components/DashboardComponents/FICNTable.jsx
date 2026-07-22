const RECENT_SCANS = [
  { serial: "8AC 493021", denomination: "₹500", source: "POS Terminal #4", location: "Delhi", result: "Counterfeit", confidence: "99.8%" },
  { serial: "9KF 110943", denomination: "₹500", source: "Bank ATM #21", location: "Pune", result: "Genuine", confidence: "98.2%" },
  { serial: "2BA 993411", denomination: "₹500", source: "Mobile App Scan", location: "Surat", result: "Counterfeit", confidence: "94.5%" },
];

export default function FICNTable() {
  return (
    <div className="mt-6 bg-white border border-zinc-200 rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900">Recent Currency Scans (FICN Vision)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <th className="p-4">Serial Number</th>
              <th className="p-4">Denom.</th>
              <th className="p-4">Scan Source</th>
              <th className="p-4">Location</th>
              <th className="p-4">Result</th>
              <th className="p-4">AI Confidence</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-zinc-700">
            {RECENT_SCANS.map((scan, i) => (
              <tr key={i} className="border-b border-zinc-50 even:bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors last:border-0">
                <td className="p-4 font-mono text-zinc-900">{scan.serial}</td>
                <td className="p-4">{scan.denomination}</td>
                <td className="p-4">{scan.source}</td>
                <td className="p-4">{scan.location}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold ${
                    scan.result === "Counterfeit" ? "bg-red-50 text-[#E5484D] border border-[#E5484D]/30" : "bg-emerald-50 text-[#0F9D78] border border-[#0F9D78]/30"
                  }`}>
                    {scan.result}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <span className="text-xs font-bold text-zinc-700">{scan.confidence}</span>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${scan.result === "Counterfeit" ? "bg-[#E5484D]" : "bg-[#0F9D78]"}`} 
                        style={{ width: scan.confidence }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}