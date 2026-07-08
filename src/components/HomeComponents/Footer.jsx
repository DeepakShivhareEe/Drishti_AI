import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-14 px-6 lg:px-10" style={{ background: "#050508" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="DRISHTI" className="w-14 h-14 rounded-lg object-contain" />
              <span className="text-base font-bold tracking-widest text-zinc-200">
                DRISHTI
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              AI-powered digital risk intelligence platform for real-time
              threat detection and predictive fraud prevention.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Platform
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard</Link>
              <span className="text-sm text-zinc-600 cursor-default">Modules</span>
              <span className="text-sm text-zinc-600 cursor-default">Analytics</span>
              <span className="text-sm text-zinc-600 cursor-default">Reports</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Resources
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">NCRB Portal</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Training Manuals</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">API Documentation</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Help Center</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © 2026 DRISHTI. National Digital Public Safety Platform.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-500/80 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}