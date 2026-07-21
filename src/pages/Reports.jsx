import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "../utils/api";
import ErrorBoundary from "../components/ErrorBoundary";

export default function Reports() {
  const [networks, setNetworks] = useState([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(true);
  
  const [selectedNetworkId, setSelectedNetworkId] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:8000/api/v1/fraud-graph/networks");
        if (res.ok) {
          const data = await res.json();
          setNetworks(data);
        }
      } catch (err) {
        console.error("Failed to fetch networks:", err);
      } finally {
        setIsLoadingNetworks(false);
      }
    };
    fetchNetworks();
  }, []);

  useEffect(() => {
    if (!selectedNetworkId) return;

    const fetchEvidence = async () => {
      setIsLoadingEvidence(true);
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/v1/fraud-graph/evidence/${selectedNetworkId}`);
        if (res.ok) {
          const data = await res.json();
          setEvidence(data);
        }
      } catch (err) {
        console.error("Failed to fetch evidence:", err);
      } finally {
        setIsLoadingEvidence(false);
      }
    };
    fetchEvidence();
  }, [selectedNetworkId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 print:bg-white print:pt-0 print:px-0"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] print:h-auto print:block">
        
        {/* Sidebar - List of Networks (Hidden when printing) */}
        <div className="w-full md:w-80 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden print:hidden">
          <div className="p-5 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Intelligence Packages</h2>
            <p className="text-xs text-zinc-500 mt-1">Court-admissible evidence exports.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingNetworks ? (
              <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                Loading networks...
              </div>
            ) : networks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                <svg className="w-10 h-10 text-zinc-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-sm font-medium">No active fraud networks yet.</p>
                <p className="text-xs mt-1 text-zinc-400">Reports will appear here once threats are detected.</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {networks.map(network => (
                  <li 
                    key={network.id}
                    onClick={() => setSelectedNetworkId(network.id)}
                    className={`p-4 cursor-pointer hover:bg-zinc-50 transition-colors ${selectedNetworkId === network.id ? 'bg-zinc-50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold text-zinc-500">FN-{network.id.toString().padStart(3, '0')}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        Score: {network.risk_score}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 truncate">{network.name}</p>
                    <p className="text-xs text-zinc-500 truncate mt-1">{network.jurisdiction}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content - Report Detail View */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden print:border-none print:shadow-none">
          {selectedNetworkId ? (
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
              
              {/* Toolbar (Hidden when printing) */}
              <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center print:hidden">
                <span className="text-sm font-medium text-zinc-600">Viewing Evidence Package</span>
                <button 
                  onClick={handlePrint}
                  disabled={isLoadingEvidence || !evidence}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Export to PDF
                </button>
              </div>

              {/* Printable Area */}
              <div className="flex-1 overflow-y-auto p-8 print:p-0">
                {isLoadingEvidence ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    Generating intelligence package...
                  </div>
                ) : evidence ? (
                  <div className="max-w-4xl mx-auto space-y-8 font-serif text-zinc-900 print:text-black">
                    
                    {/* Header */}
                    <div className="text-center border-b-2 border-zinc-900 pb-6 mb-8">
                      <h1 className="text-3xl font-extrabold uppercase tracking-widest mb-2">{evidence.document_type}</h1>
                      <div className="flex justify-center items-center gap-4 text-sm font-bold uppercase tracking-wider text-red-600">
                        <span>CLASSIFICATION: {evidence.classification}</span>
                        <span>•</span>
                        <span>VERSION: {evidence.version}</span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm border-b border-zinc-200 pb-8">
                      <div>
                        <p><span className="font-bold">CASE REFERENCE:</span> {evidence.case_reference}</p>
                        <p><span className="font-bold">GENERATED BY:</span> {evidence.generated_by}</p>
                      </div>
                      <div className="text-right">
                        <p><span className="font-bold">DATE GENERATED:</span> {new Date(evidence.generated_at).toLocaleString()}</p>
                        <p><span className="font-bold">JURISDICTION:</span> {evidence.network_summary.jurisdiction}</p>
                      </div>
                    </div>

                    {/* Summary section */}
                    <section>
                      <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-emerald-600 pl-3">Network Summary</h2>
                      <div className="bg-zinc-50 p-6 rounded border border-zinc-200 print:bg-transparent print:border-zinc-400">
                        <h3 className="text-lg font-bold mb-2">{evidence.network_summary.name}</h3>
                        <p className="text-zinc-700 print:text-black leading-relaxed mb-4">{evidence.network_summary.description}</p>
                        <div className="flex gap-8 text-sm font-medium">
                          <p>Risk Score: <span className="font-bold text-red-600">{evidence.network_summary.risk_assessment}/100</span></p>
                          <p>Status: <span className="font-bold">{evidence.network_summary.status}</span></p>
                          <p>Est. Value: <span className="font-bold">₹{evidence.network_summary.estimated_fraud_amount_inr?.toLocaleString() || 0}</span></p>
                        </div>
                      </div>
                    </section>

                    {/* Entities */}
                    <section className="print:break-inside-avoid">
                      <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-emerald-600 pl-3">Identified Entities</h2>
                      <table className="w-full text-left text-sm border-collapse border border-zinc-200">
                        <thead>
                          <tr className="bg-zinc-100 print:bg-zinc-200">
                            <th className="p-3 border border-zinc-200 font-bold uppercase">ID</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Type</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Label</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Location</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evidence.entities?.map(entity => (
                            <tr key={entity.entity_id} className="border-b border-zinc-200 last:border-0">
                              <td className="p-3 border border-zinc-200 font-mono text-xs">{entity.entity_id}</td>
                              <td className="p-3 border border-zinc-200 capitalize">{entity.type}</td>
                              <td className="p-3 border border-zinc-200 font-medium">{entity.label}</td>
                              <td className="p-3 border border-zinc-200">{entity.location.city || "Unknown"}</td>
                              <td className="p-3 border border-zinc-200 text-red-600 font-bold">{entity.risk_score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>

                    {/* Relationships */}
                    <section className="print:break-inside-avoid">
                      <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-emerald-600 pl-3">Confirmed Linkages</h2>
                      <table className="w-full text-left text-sm border-collapse border border-zinc-200">
                        <thead>
                          <tr className="bg-zinc-100 print:bg-zinc-200">
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Source</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Target</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Relation Type</th>
                            <th className="p-3 border border-zinc-200 font-bold uppercase">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evidence.relationships?.map(rel => (
                            <tr key={rel.relationship_id} className="border-b border-zinc-200 last:border-0">
                              <td className="p-3 border border-zinc-200 font-mono text-xs">{rel.source}</td>
                              <td className="p-3 border border-zinc-200 font-mono text-xs">{rel.target}</td>
                              <td className="p-3 border border-zinc-200 capitalize">{rel.type.replace('_', ' ')}</td>
                              <td className="p-3 border border-zinc-200">{rel.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>

                    {/* Legal Disclaimer */}
                    <section className="mt-16 pt-8 border-t-2 border-zinc-900 text-xs leading-relaxed text-zinc-600 print:text-black italic print:break-inside-avoid">
                      <p className="font-bold uppercase not-italic mb-2 text-zinc-900 print:text-black">Legal Disclaimer</p>
                      <p>{evidence.legal_disclaimer}</p>
                    </section>

                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 print:hidden">
              <svg className="w-16 h-16 mb-4 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-lg font-medium">Select a network to view its intelligence package</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
