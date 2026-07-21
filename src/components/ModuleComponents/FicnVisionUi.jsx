import { useState } from "react";
import { fetchWithAuth } from "../../utils/api";

export default function FicnVisionUi() {
  const [files, setFiles] = useState({
    front_flat: null,
    back_flat: null,
    front_tilted: null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e, key) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleAnalyze = async () => {
    // Validation: Enforce the 3 required views for the Agentic pipeline
    if (Object.values(files).some((file) => file === null)) {
      setError("Please upload all 3 required views before analyzing.");
      return;
    }

    // Duplicate Trap: Ensure all 3 uploaded files are distinct
    const fileSignatures = new Set(
      Object.values(files).map((file) => `${file.name}-${file.size}`)
    );
    if (fileSignatures.size < 3) {
      setError("Duplicate files detected! Please upload distinct images for the Front, Back, and Tilted views.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    Object.keys(files).forEach((key) => {
      formData.append(key, files[key]);
    });

    try {
      const response = await fetchWithAuth("http://127.0.0.1:8001/analyze/session", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Agentic FICN Engine returned an error");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const INPUT_VIEWS = [
    { key: "front_flat", label: "Front (Flat View)" },
    { key: "back_flat", label: "Back (Flat View)" },
    { key: "front_tilted", label: "Front (Tilted View)" },
  ];

  // UI styling map based on the intelligence threat context
  const getThreatBadgeStyle = (level) => {
    if (level === "CRITICAL") return "bg-red-500/20 text-red-400 border border-red-500/30";
    if (level === "WARNING") return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  };

  const getVerdictTextColor = (level) => {
    if (level === "CRITICAL") return "text-red-400";
    if (level === "WARNING") return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="w-full mt-12 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Workspace Header */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Live Workspace: Note Verification</h3>
          <p className="text-sm text-zinc-500">Upload 3 targeted macro-captures for multimodal analysis.</p>
        </div>
        <span className="self-start sm:self-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded border border-emerald-200 whitespace-nowrap">
          Agent Online (Port 8001)
        </span>
      </div>

      <div className="p-6">
        {/* Responsive Upload Grid (Optimized for 3 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {INPUT_VIEWS.map((view) => (
            <div key={view.key} className="relative group">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <svg className="w-6 h-6 mb-2 text-zinc-400 group-hover:text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <p className="text-xs font-bold text-zinc-700">{view.label}</p>
                  <p className="text-[11px] mt-1">
                    {files[view.key] ? (
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block max-w-[180px] truncate">
                        {files[view.key].name}
                      </span>
                    ) : (
                      <span className="text-zinc-400">Tap to browse file</span>
                    )}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, view.key)} />
              </label>
            </div>
          ))}
        </div>

        {/* Runtime System Error Notification */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg">
            {error}
          </div>
        )}

        {/* Execution Pipeline Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-zinc-900"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Multimodal Agentic Forensic Analysis...
            </>
          ) : (
            "Analyze Authenticity"
          )}
        </button>

        {/* Intelligence Report Output */}
        {result && result.payload && (
          <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-6 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-white font-bold text-lg">Intelligence Threat Assessment</h4>
                <p className="text-zinc-400 text-xs font-mono mt-1">
                  Source: {result.source_service} | Metric Model: Gemini Core
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${getThreatBadgeStyle(result.threat_level)}`}>
                {result.threat_level}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">AI Agent Verdict</p>
                  <p className={`text-2xl font-extrabold tracking-tight ${getVerdictTextColor(result.threat_level)}`}>
                    {result.payload.status_verdict}
                  </p>
                  {result.payload.forensic_reasoning && (
                    <div className="mt-4 p-3 bg-zinc-800/40 border border-zinc-700/50 rounded-lg">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Forensic Details</p>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {result.payload.forensic_reasoning}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">OCR Extracted Serial</p>
                  <p className="text-emerald-400 font-mono text-lg bg-black/50 inline-block px-4 py-1.5 rounded border border-zinc-800">
                    {result.payload.detected_serial}
                  </p>
                </div>
              </div>

              {/* Guardrails Checklist Container */}
              <div className="bg-black/40 p-5 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">Verification Layer Checks</p>
                <div className="space-y-3 text-sm font-medium">
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-400">Image Clarity & Quality</span>
                    <span className={result.payload.checks.image_quality === "PASS" ? "text-emerald-400" : "text-amber-400"}>
                      {result.payload.checks.image_quality}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-400">Structural Homography Alignment</span>
                    <span className={result.payload.checks.alignment_homography === "SUCCESS" ? "text-emerald-400" : "text-red-400"}>
                      {result.payload.checks.alignment_homography}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-400">Optically Variable Ink (OVI) Shift</span>
                    <span className={result.payload.checks.color_consistency === "PASS" ? "text-emerald-400" : "text-red-400 font-semibold"}>
                      {result.payload.checks.color_consistency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-400">System Confidence Score</span>
                    <span className="text-white font-mono bg-zinc-800/50 px-2 py-0.5 rounded text-xs">
                      {result.payload.overall_confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}