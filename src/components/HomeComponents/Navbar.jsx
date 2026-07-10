import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { toast } from "react-hot-toast";

// --- FIREBASE IMPORTS ---
import { auth } from "../../firebase"; // Adjust path if your firebase.js is somewhere else
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  
  const location = useLocation();
  const profileRef = useRef(null);
  const lastScrollY = useRef(0);

  /* ── Listen for Firebase Login Status ── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /* ── Logout Function ── */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      
      // Fire the beautiful success popup!
      toast.success("Clearance revoked. Logged out successfully.");
      
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out cleanly.");
    }
  };

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


  const navLinks = [
    { label: "Dashboard", to: "/", enabled: true },
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
            const isActive = location.pathname === link.to;

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
                          to={subLink.path}
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

        {/* ── Right Side: Utility Actions & Dynamic Auth ── */}
        <div className="flex items-center gap-5">
          
          <button
            className="cursor-pointer text-zinc-600 hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {/* If User is Logged In -> Show Profile Avatar & Menu */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-teal-600 hover:scale-105 active:scale-95 border-2 border-white ring-1 ring-zinc-200 transition-all duration-300 focus:outline-none shadow-sm overflow-hidden"
                aria-expanded={profileOpen}
                aria-label="User profile menu"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                    {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                  </span>
                )}
              </button>

              {/* Enhanced Enterprise-Grade User Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* User Info Header Block */}
                  <div className="px-3 py-3 mb-1 bg-zinc-50/80 rounded-xl border border-zinc-100 flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-inner">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">
                        {user.displayName || "Officer"}
                      </p>
                      <p className="text-[11px] font-medium text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Menu Items with Icons */}
                  {/* Replace the <button> tags with <Link> tags */}
                  <Link to="/profile" className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors group">
                    <svg className="w-4 h-4 mr-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Clearance Profile
                  </Link>

                  <Link to="/settings" className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors group">
                    <svg className="w-4 h-4 mr-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93..." />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Command Settings
                  </Link>
                  
                  {/* Firebase Logout Action */}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors group cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Log out
                  </button>

                </div>
              )}
            </div>
          ) : (
            /* If User is Logged Out -> Show Command Login Button */
            <Link
              to="/login"
              className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              Command Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}