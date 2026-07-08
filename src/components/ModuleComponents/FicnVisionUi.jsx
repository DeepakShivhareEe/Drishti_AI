import { useState } from "react";

export default function FicnVisionUi() {
  const [files, setFiles] = useState({
    front_0: null, front_20: null, front_45: null,
    back_0: null, back_20: null, back_45: null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e, key) => {
    setFiles({ ...files, [key]: e.target.files[0] });
  };

  const handleAnalyze = async () => {
    // Validation: Check if all 6 files are uploaded
    if (Object.values(files).some((file) => file === null)) {
      setError("Please upload all 6 required angles before analyzing.");
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
      const response = await fetch("http://127.0.0.1:8001/analyze/session", {
        method: "POST",
        body: formData, // Browser automatically sets multipart/form-data headers
      });

      if (!response.ok) throw new Error("Failed to connect to FICN Vision Engine");
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ANGLES = [
    { key: "front_0", label: "Front (0° Flat)" },
    { key: "front_20", label: "Front (20° Tilt)" },
    { key: "front_45", label: "Front (45° Tilt)" },
    { key: "back_0", label: "Back (0° Flat)" },
    { key: "back_20", label: "Back (20° Tilt)" },
    { key: "back_45", label: "Back (45° Tilt)" },
  ];

  return (
    <div className="w-full mt-12 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Live Workspace: Note Verification</h3>
          <p className="text-sm text-zinc-500">Upload 6 captures to run the multi-view tensor fusion.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded border border-emerald-200">
          Engine Online (Port 8001)
        </span>
      </div>

      <div className="p-6">
        {/* Upload Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {ANGLES.map((angle) => (
            <div key={angle.key} className="relative group">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                  <svg className="w-6 h-6 mb-2 text-zinc-400 group-hover:text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                  <p className="text-xs font-bold text-zinc-700">{angle.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {files[angle.key] ? <span className="text-emerald-600 font-medium">Uploaded</span> : "Click to attach"}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, angle.key)} />
              </label>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Running Deep Learning Inference...
            </>
          ) : (
            "Analyze Authenticity"
          )}
        </button>

        {/* Intelligence Report Output */}
        {result && result.payload && (
          <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800 shadow-inner">
            <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-white font-bold text-lg">Intelligence Report</h4>
                <p className="text-zinc-400 text-xs font-mono mt-1">ID: #{Math.floor(Math.random() * 1000000)} | Source: {result.source_service}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                result.threat_level === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {result.threat_level}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">AI Verdict</p>
                <p className={`text-2xl font-extrabold ${result.threat_level === "CRITICAL" ? "text-red-400" : "text-emerald-400"}`}>
                  {result.payload.status_verdict}
                </p>
                
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-4 mb-1">OCR Extracted Serial</p>
                <p className="text-white font-mono bg-black/50 inline-block px-3 py-1 rounded border border-zinc-800">
                  {result.payload.detected_serial}
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">System Checks</p>
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Image Quality</span>
                    <span className={result.payload.checks.image_quality === "PASS" ? "text-emerald-400" : "text-orange-400"}>{result.payload.checks.image_quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Homography Alignment</span>
                    <span className="text-emerald-400">{result.payload.checks.alignment_homography}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Model Confidence</span>
                    <span className="text-white">{result.payload.overall_confidence}%</span>
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