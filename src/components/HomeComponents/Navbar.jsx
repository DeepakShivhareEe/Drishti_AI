import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png"; // Adjust path as needed

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const location = useLocation();
  const profileRef = useRef(null);
  const lastScrollY = useRef(0);

  /* ── OPTIMIZED Scroll listener ── */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 20);

          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            setIsVisible(false);
            setProfileOpen(false); 
          } else {
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close profile dropdown on outside click ── */
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // CHANGED: Renamed 'hash' to 'path' to make the routing logic cleaner
  const navLinks = [
    { label: "Dashboard", to: "/dashboard", enabled: true },
    { 
      label: "Modules", 
      to: "#",
      enabled: true,
      dropdown: [
        { label: "Digital Arrest Shield", path: "/module/digital-arrest-shield" },
        { label: "FICN Vision Agent", path: "/module/ficn-vision" },
        { label: "Fraud Graph Intelligence", path: "/module/fraud-graph" },
        { label: "Citizen Fraud Shield", path: "/module/citizen-shield" },
      ]
    },
    { label: "Analytics", to: "#", enabled: false },
    { label: "Reports", to: "#", enabled: false },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "h-16 bg-white border-b border-zinc-200 shadow-sm"
          : "h-16 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        
        {/* ── Left Side: Logo ── */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <img
            src={logo}
            alt="DRISHTI Logo"
            className="h-20 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          />
          <span className="text-xl font-bold tracking-wide text-zinc-900 group-hover:text-black transition-colors duration-300">
            DRISHTI
          </span>
        </Link>

        {/* ── Center: Minimalist Navigation Links ── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.to) && link.to !== "#";

            // 1. Render Disabled Links (Soon Badge)
            if (!link.enabled) {
              return (
                <div
                  key={link.label}
                  className="relative flex items-center gap-2 text-[14px] font-medium text-black cursor-not-allowed select-none tracking-wide"
                >
                  {link.label}
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-zinc-500">
                    Soon
                  </span>
                </div>
              );
            }

            // 2. Render Links WITH Dropdowns (The Modules Tab)
            if (link.dropdown) {
              return (
                <div key={link.label} className="relative group h-full">
                  <Link
                    to={link.to}
                    className={`relative flex items-center gap-1.5 text-[14px] font-medium tracking-wide transition-colors duration-300 py-6 ${
                      isActive
                        ? "text-black font-semibold"
                        : "text-black hover:text-zinc-600"
                    }`}
                  >
                    {link.label}
                    <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-800 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </Link>

                  {/* The Dropdown Menu Box */}
                  <div className="absolute left-0 top-[85%] mt-0 w-60 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                    <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-xl ring-1 ring-black/5 flex flex-col">
                      {link.dropdown.map((subLink) => (
                        <Link
                          key={subLink.label}
                          to={subLink.path} // CHANGED: Now just points directly to the correct path!
                          className="w-full text-left px-3 py-2.5 text-[13px] text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Render Standard Links (Dashboard)
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-[14px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-black hover:text-zinc-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right Side: Utility Actions ── */}
        <div className="flex items-center gap-5">
          <button
            className="cursor-pointer text-zinc-600 hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-zinc-50 hover:scale-105 active:scale-95 border border-zinc-200 text-[11px] font-bold text-zinc-900 transition-all duration-300 focus:outline-none shadow-sm"
              aria-expanded={profileOpen}
              aria-label="User profile menu"
            >
              OP
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="cursor-pointer w-full text-left px-3 py-2 text-sm text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors">
                  Profile
                </button>
                <button className="cursor-pointer w-full text-left px-3 py-2 text-sm text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors">
                  Settings
                </button>
                <div className="my-1 border-t border-zinc-100" />
                <button className="cursor-pointer w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}