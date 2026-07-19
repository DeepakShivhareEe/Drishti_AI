import { motion } from "framer-motion";

const stats = [
  {
    value: "1.14M+",
    label: "Cybercrime Complaints",
    description: "Registered in India during 2023, marking a steep 60% YoY trajectory.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    value: "₹1,776 Cr",
    label: "Lost to Digital Arrests",
    description: "Defrauded in just 9 months via psychological hostage scenarios.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "< 1 Sec",
    label: "Counterfeit Detection",
    description: "Computer vision verifies microprints & UV features on high-denomination notes.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-100",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
      </svg>
    ),
  },
  {
    value: "12",
    label: "Regional Languages",
    description: "Citizen Fraud Shield accessible via WhatsApp & IVR for pan-India reach.",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
  },
];

export default function StatsPanel() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 pb-24 pt-8">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center md:text-left"
      >
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">The Threat Landscape</h2>
        <p className="text-zinc-500 mt-2 text-sm font-medium">Addressing critical vulnerabilities highlighted by MHA & RBI reports.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            key={i} 
            className="relative flex flex-col p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl overflow-hidden group"
          >
            {/* Background Glow Effect (Adapted for Light Mode) */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 ${stat.bgColor} group-hover:opacity-70 transition-opacity duration-500`}></div>
            
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} ${stat.borderColor} border mb-5 shadow-sm`}>
              {stat.icon}
            </div>
            
            <p className="relative text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stat.value}
            </p>
            
            <p className={`relative text-sm font-bold mt-2 ${stat.color}`}>
              {stat.label}
            </p>
            
            <p className="relative text-sm text-zinc-600 mt-2 leading-relaxed">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}