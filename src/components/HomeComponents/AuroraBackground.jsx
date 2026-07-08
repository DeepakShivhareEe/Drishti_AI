import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-[140vh] z-[-10] overflow-hidden bg-slate-50 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
      
      {/* ── 1. Sweeping Aurora (Soft Blue) ── */}
      <motion.div
        initial={{ x: "-50%", y: "-10%", opacity: 0.5 }}
        animate={{ x: "60%", y: "10%", opacity: [0.4, 0.8, 0.4] }}
        transition={{
          duration: 16, // Slowed down slightly for better performance
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse"
        }}
        // ADDED: will-change-transform to force GPU acceleration, removed mix-blend-multiply
        className="absolute top-[5%] left-0 w-[60vw] h-[50vh] bg-blue-300/40 blur-[120px] rounded-full will-change-transform"
      />

      {/* ── 2. Core Breathing Aurora (Soft Violet) ── */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        // ADDED: will-change-transform
        className="absolute top-[-10%] left-[30%] w-[50vw] h-[60vh] bg-violet-300/40 blur-[130px] rounded-full will-change-transform"
      />

      {/* ── 3. The Professional Grid Overlay (Dark Lines) ── */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"
      ></div>
      
    </div>
  );
}