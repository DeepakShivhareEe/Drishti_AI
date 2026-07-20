import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MODULE_DATA = [
  {
    id: "ficn-vision",
    name: "FICN Vision Agent",
    tagline: "Point-of-Contact Currency Verification",
    description: "Deployable computer vision architecture designed for mobile devices, bank counting machines, and POS terminals. It instantly identifies high-denomination counterfeit notes (like Rs 500 fakes) by simulating UV features and analyzing microprints.",
    capabilities: ["Microprint Verification", "Security Thread Analysis", "Sub-second Processing"],
    status: "Active Prototype",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    id: "fraud-graph",
    name: "Fraud Graph Intelligence",
    tagline: "Cross-Jurisdictional Network Mapping",
    description: "An advanced Graph AI agent that clusters victim reports, scammer infrastructure, and money mule networks. It maps coordinated fraud campaigns across India to generate court-admissible intelligence packages.",
    capabilities: ["Transaction Clustering", "Device Fingerprinting", "Geospatial Linkages"],
    status: "Active Prototype",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  {
    id: "citizen-shield",
    name: "Citizen Fraud Shield",
    tagline: "Omnichannel Public Risk Assessment",
    description: "A conversational AI interface accessible via WhatsApp, IVR, and Web. It walks citizens through real-time fraud risk assessments for suspicious calls or payment requests, offering guidance in 12 regional languages.",
    capabilities: ["Multilingual LLM", "Instant Risk Verdicts", "NCRB Portal Integration"],
    status: "Active Prototype",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  {
    id: "phishing-scanner",
    name: "Phishing & SMS Scanner",
    tagline: "Instant Pattern-Based Link & Text Analysis",
    description: "A fast, offline-capable AI engine that analyzes URLs and SMS messages for typosquatting, brand impersonation, and psychological manipulation. It checks for urgency tactics, malicious redirects, and credential harvesting forms.",
    capabilities: ["URL Structure Verification", "NLP Threat Detection", "Homoglyph Analysis"],
    status: "Active Prototype",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  }
];

export default function ModuleDetail() {
  const { id } = useParams();
  const [isImageOpen, setIsImageOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const currentModule = MODULE_DATA.find((m) => m.id === id);

  if (!currentModule) {
    return <Navigate to="/" />;
  }

  const otherModules = MODULE_DATA.filter((m) => m.id !== id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white pt-32 pb-24"
    >
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-8">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-900">Modules</span>
          <span>/</span>
          <span className="text-zinc-900">{currentModule.name}</span>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-zinc-200 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full ${currentModule.bgColor} ${currentModule.color} text-xs font-bold uppercase tracking-wide border ${currentModule.borderColor}`}>
              {currentModule.status}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            {currentModule.name}
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-2xl">
            {currentModule.tagline}
          </p>
        </div>

        {/* Action Link to the Dedicated Working Tool View */}
        <div className="mb-12 p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Ready to test the interface?</h3>
            <p className="text-sm text-zinc-500">Launch the active testing terminal connected to our Python backend engines.</p>
          </div>
          <Link
            to={currentModule.id === "phishing-scanner" ? "/dashboard/phishing" : `/workspace/${currentModule.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            Launch Live Workspace Console →
          </Link>
        </div>

        {/* Main Content */}
        <div className="prose prose-zinc prose-lg max-w-none mb-20">
          <p className="text-zinc-700 leading-relaxed font-medium">
            {currentModule.description}
          </p>
          
          <h3 className="text-xl font-bold text-zinc-900 mt-12 mb-4">Core Capabilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {currentModule.capabilities.map((cap, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-center">
                <span className="text-zinc-800 font-semibold text-sm">{cap}</span>
              </div>
            ))}
          </div>

          {/* Architecture Diagram */}
          {currentModule.id === "phishing-scanner" ? (
            <>
              <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden mb-12">
                <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                  <h4 className="text-zinc-900 font-bold">System Architecture Flow</h4>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg uppercase tracking-wider">v1.0 Engine</span>
                </div>
                <div className="bg-zinc-50/50 flex justify-center overflow-hidden">
                  <div className="relative group cursor-zoom-in w-full flex" onClick={() => setIsImageOpen(true)}>
                    <img 
                      src="/phishing-architecture.svg" 
                      alt="Phishing Scanner Architecture Diagram" 
                      className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 bg-white/95 text-zinc-900 text-sm font-bold rounded-lg shadow-sm backdrop-blur-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
                        Click to Zoom
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Lightbox Modal */}
              {isImageOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8" onClick={() => setIsImageOpen(false)}>
                  <button 
                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-50"
                    onClick={(e) => { e.stopPropagation(); setIsImageOpen(false); }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="w-full h-full flex items-center justify-center overflow-auto" onClick={(e) => e.stopPropagation()}>
                    <img 
                      src="/phishing-architecture.svg" 
                      alt="Phishing Scanner Architecture Diagram (Full)" 
                      className="max-w-none w-auto h-auto min-w-[800px] max-h-[95vh] object-contain rounded-xl bg-white shadow-2xl cursor-zoom-out"
                      onClick={() => setIsImageOpen(false)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center py-24 text-center">
              <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h4 className="text-zinc-900 font-bold mb-1">Architecture Diagram Placeholder</h4>
              <p className="text-zinc-500 text-sm max-w-sm">
                Insert your detailed architecture diagram or code flow for {currentModule.name} here.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Explore Other Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherModules.map((mod) => (
              <Link 
                key={mod.id} 
                to={`/module/${mod.id}`}
                className="flex flex-col p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all duration-300 group"
              >
                <span className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors mb-1">
                  {mod.name}
                </span>
                <span className="text-xs text-zinc-500 line-clamp-2">
                  {mod.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}