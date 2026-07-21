import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CoreModules() {
  const modules = [
    {
      id: "ficn-vision",
      title: "FICN Vision Agent",
      tagline: "Point-of-Contact Currency Verification",
      description: "Deployable computer vision architecture designed for mobile devices, bank counting machines, and POS terminals to instantly identify high-denomination counterfeit notes.",
      features: [
        "Microprint & security thread verification",
        "Serial number pattern validation",
        "UV feature simulation algorithms"
      ],
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      tech: ["Computer Vision", "Edge AI"],
    },
    {
      id: "fraud-graph",
      title: "Fraud Graph Intelligence",
      tagline: "Cross-Jurisdictional Network Mapping",
      description: "An advanced Graph AI agent that clusters victim reports, scammer infrastructure, and money mule networks to map coordinated fraud campaigns across India.",
      features: [
        "Transaction metadata & account linkage analysis",
        "Device fingerprint clustering",
        "Court-admissible intelligence package generation"
      ],
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-100",
      tech: ["Graph AI", "Data Fusion", "Geospatial"],
    },
    {
      id: "citizen-shield",
      title: "Citizen Fraud Shield",
      tagline: "Omnichannel Public Risk Assessment",
      description: "A conversational AI interface accessible via WhatsApp, IVR, and Web that walks citizens through real-time fraud risk assessments for suspicious calls or payment requests.",
      features: [
        "Instant risk verdicts & guidance",
        "Automated NCRB portal reporting integration",
        "Advisory support in 12 regional languages"
      ],
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      tech: ["LLMs", "Agentic AI", "Omnichannel"],
    },
    {
      id: "phishing-scanner",
      title: "Phishing & SMS Scanner",
      tagline: "Instant Pattern-Based Link & Text Analysis",
      description: "A fast, offline-capable AI engine that analyzes URLs and SMS messages for typosquatting, brand impersonation, and psychological manipulation.",
      features: [
        "Real-time URL structure & DNS verification",
        "NLP-based urgency and threat detection",
        "Brand impersonation & homoglyph analysis"
      ],
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      tech: ["Heuristics", "NLP", "Offline Engine"],
    },
  ];

  return (
    <section id="core-modules" className="w-full bg-white relative z-10 pt-16 pb-24 border-t border-zinc-200/60">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Core Intelligence Modules
          </h2>
          <p className="text-zinc-500 mt-4 text-base leading-relaxed font-medium">
            A unified suite designed to shift law enforcement from reactive investigation to predictive threat neutralisation. Select a module to explore the architecture.
          </p>
        </motion.div>

        {/* Stacked Layout */}
        <div className="flex flex-col gap-12 md:gap-16">
          {modules.map((mod, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              key={i} 
              className={`flex flex-col md:flex-row gap-8 md:gap-16 pb-12 md:pb-16 ${
                i !== modules.length - 1 ? "border-b border-zinc-200/80" : ""
              }`}
            >
              {/* Left Side: Icon, Title & Tech */}
              <div className="md:w-[40%] flex flex-col items-start">
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${mod.bgColor} ${mod.color} ${mod.borderColor} border mb-6 shadow-sm`}>
                  {mod.icon}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">{mod.title}</h3>
                <p className={`text-sm font-bold uppercase tracking-wider mb-6 ${mod.color}`}>
                  {mod.tagline}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {mod.tech.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded border border-zinc-200 bg-zinc-50 text-zinc-600 text-[11px] font-bold uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side: Description, Bullet Points & CTA */}
              <div className="md:w-[60%] flex flex-col justify-center">
                <p className="text-zinc-600 text-base leading-relaxed mb-6 font-medium">
                  {mod.description}
                </p>
                
                {/* Deep-dive details list */}
                <ul className="flex flex-col gap-3 mb-8">
                  {mod.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn More Interactive Link */}
                <div className="mt-auto">
                  <Link 
                    to={`/module/${mod.id}`} 
                    className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    Learn more about {mod.title.split(" ")[0]}
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}