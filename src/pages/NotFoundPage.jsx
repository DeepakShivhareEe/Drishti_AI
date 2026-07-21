import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="max-w-md">
        {/* Large 404 */}
        <h1 className="text-8xl font-extrabold text-zinc-200 tracking-tight mb-4 select-none">
          404
        </h1>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-600 text-xs font-bold uppercase tracking-wider">
            Route Not Found
          </span>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">
          This sector is uncharted
        </h2>
        <p className="text-zinc-500 text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist in the DRISHTI command network. 
          It may have been moved or decommissioned.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            to="/" 
            className="px-6 py-3 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Return to Base
          </Link>
          <Link 
            to="/dashboard" 
            className="px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-bold rounded-xl transition-colors border border-zinc-200 shadow-sm"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
