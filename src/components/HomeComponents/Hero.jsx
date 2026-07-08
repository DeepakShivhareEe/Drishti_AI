import { Link } from "react-router-dom";
import logo from "../../assets/logo.png"; // Adjust path as needed

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center text-center px-6 pt-28 pb-20 max-w-5xl mx-auto overflow-hidden">
      
     
      {/* ── Logo & Headline ── */}
      <div className="animate-fade-in-up-delay-1 flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 to-zinc-600 drop-shadow-sm">
          Digital Risk Intelligence & Security <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">
            for Holistic Threat Identification.
          </span>
        </h1>
      </div>

      {/* ── Subtitle ── */}
      <p className="animate-fade-in-up-delay-2 mt-6 text-lg sm:text-xl text-zinc-600 max-w-3xl leading-relaxed font-medium">
        DRISHTI is an AI-powered platform that uses digital intelligence and security technologies to comprehensively identify, analyze, and help prevent a wide range of public safety threats, including counterfeiting, fraud, and digital scams.
      </p>

      {/* ── Capabilities Tags ── */}
      <div className="animate-fade-in-up-delay-2 mt-8 flex flex-wrap justify-center gap-3">
        {["Agentic AI Fusion", "Geospatial Intelligence", "Graph AI Networks", "Computer Vision"].map((tech) => (
          <span key={tech} className="px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-700 text-sm font-semibold shadow-sm">
            {tech}
          </span>
        ))}
      </div>

      {/* ── CTAs ── */}
      <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
        <Link 
          to="/dashboard" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
        >
          Open Command Center
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-zinc-300 text-zinc-800 font-bold hover:bg-zinc-50 transition-colors shadow-sm">
          View Architecture
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </button>
      </div>

      <p className="mt-8 text-sm text-zinc-500 font-medium">
        Deployable for <span className="text-zinc-900 font-bold">MHA Agencies</span>, <span className="text-zinc-900 font-bold">RBI Affiliates</span>, and <span className="text-zinc-900 font-bold">Telecom Providers</span>
      </p>
    </section>
  );
}