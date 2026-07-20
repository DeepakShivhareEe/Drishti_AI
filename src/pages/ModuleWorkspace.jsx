import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import FicnVisionUi from "../components/ModuleComponents/FicnVisionUi";
import FraudGraphWorkspace from "../components/ModuleComponents/FraudGraphWorkspace";
import CitizenShieldWorkspace from "../components/ModuleComponents/CitizenShieldWorkspace";

const WORKSPACE_TITLES = {
  "ficn-vision": "FICN Vision Verification Workspace",
  "fraud-graph": "Fraud Graph Intelligence Graph View",
  "citizen-shield": "Citizen Fraud Shield Control Panel",
};

export default function ModuleWorkspace() {
  const { id } = useParams();

  // Redirect home if an invalid workspace URL parameter is supplied
  if (!WORKSPACE_TITLES[id]) {
    return <Navigate to="/" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Dynamic Interactive Component Ingestion */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {id === "ficn-vision" ? (
            <FicnVisionUi />
          ) : id === "fraud-graph" ? (
            <FraudGraphWorkspace />
          ) : id === "citizen-shield" ? (
            <CitizenShieldWorkspace />
          ) : (
            /* Fallback sleek terminal viewcards for tools currently mid-build */
            <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 1113.5 17.25l-5.83-5.83m5.83 5.83a2.67 2.67 0 11-3.75-3.75l5.83-5.83m0 0l-5.83-5.83m5.83 5.83L17.25 3m-9.75 9.75a2.67 2.67 0 01-3.75-3.75l5.83-5.83m-5.83 5.83l5.83-5.83M3.75 21l5.83-5.83" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Terminal Initializing</h3>
              <p className="text-sm text-zinc-500 max-w-md">
                The layout shell for this workspace is configured. The application backend hooks are matching specs.
              </p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}