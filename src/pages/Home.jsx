import Hero from "../components/HomeComponents/Hero";
import StatsPanel from "../components/HomeComponents/StatsPanel";
import CoreModules from "../components/HomeComponents/CoreModules";
import Background from "../components/HomeComponents/Background";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-var(--nav-height))] overflow-hidden">
      {/* ── Aurora Light Background ── */}
      <Background />

      {/* ── Content ── */}
      <div className="relative z-10">
        <Hero />
        <StatsPanel />
        <CoreModules />
      </div>
    </div>
  );
}