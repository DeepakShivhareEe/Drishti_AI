import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-14 px-6 lg:px-10" style={{ background: "#050508" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="DRISHTI" className="w-14 h-14 rounded-lg object-contain" />
              <span className="text-base font-bold tracking-widest text-zinc-200">
                DRISHTI
              </span>
            </a>
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
              <Link to="/module/ficn-vision" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">FICN Vision Agent</Link>
              <Link to="/module/fraud-graph" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Fraud Graph Intelligence</Link>
              <Link to="/module/citizen-shield" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Citizen Fraud Shield</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Resources
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="https://ncrb.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">NCRB Portal</a>
              <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cyber Crime Portal</a>
              <Link to="/training" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Training Manuals</Link>
              <Link to="/api-access" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">API Documentation</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/contact-us" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Help Center</Link>
              <Link to="/privacy-policy" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</Link>
              <Link to="/faqs" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">FAQs</Link>
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