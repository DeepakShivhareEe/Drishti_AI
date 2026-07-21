import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png"; // Adjust path as needed

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative flex flex-col items-center text-center px-6 pt-28 pb-20 max-w-5xl mx-auto overflow-hidden"
    >
      
      {/* ── Logo & Headline ── */}
      <motion.div variants={itemVariants} className="flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 to-zinc-600 drop-shadow-sm">
          Digital Risk Intelligence<br />&  <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">
            Security Holistic Threat Interceptor
          </span>
        </h1>
      </motion.div>

      {/* ── Subtitle ── */}
      <motion.p variants={itemVariants} className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-3xl leading-relaxed font-medium">
        DRISHTI is an AI-powered platform that uses digital intelligence and security technologies to comprehensively identify, analyze, and help prevent a wide range of public safety threats, including counterfeiting, fraud, and digital scams.
      </motion.p>

      {/* ── Capabilities Tags ── */}
      <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-3">
        {["Agentic AI Fusion", "Geospatial Intelligence", "Graph AI Networks", "Computer Vision"].map((tech) => (
          <span key={tech} className="px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-700 text-sm font-semibold shadow-sm hover:scale-105 transition-transform duration-300">
            {tech}
          </span>
        ))}
      </motion.div>

      {/* ── CTAs ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
        <Link 
          to="/dashboard" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20 hover:scale-105"
        >
          Open Command Center
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <a 
          href="#core-modules"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('core-modules')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-zinc-300 text-zinc-800 font-bold hover:bg-zinc-50 transition-all shadow-sm hover:scale-105 cursor-pointer"
        >
          View Architecture
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </a>
      </motion.div>

      <motion.p variants={itemVariants} className="mt-8 text-sm text-zinc-500 font-medium">
        Deployable for <span className="text-zinc-900 font-bold">MHA Agencies</span>, <span className="text-zinc-900 font-bold">RBI Affiliates</span>, and <span className="text-zinc-900 font-bold">Telecom Providers</span>
      </motion.p>
    </motion.section>
  );
}