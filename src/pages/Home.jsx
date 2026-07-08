import Hero from "../components/HomeComponents/Hero";
import StatsPanel from "../components/HomeComponents/StatsPanel";
import CoreModules from "../components/HomeComponents/CoreModules";
import AuroraBackground from "../components/HomeComponents/AuroraBackground";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-var(--nav-height))] overflow-hidden">
      {/* ── Aurora Light Background ── */}
      <AuroraBackground />

      {/* ── Content ── */}
      <div className="relative z-10">
        <Hero />
        <StatsPanel />
        <CoreModules />
      </div>
    </div>
  );
}