import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import logo from "../assets/logo.png"; // Ensure this path matches where your logo is!

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle redirect result when user comes back after signInWithRedirect
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          navigate(-1);
        }
      })
      .catch((err) => {
        console.error("Redirect Auth Error:", err);
        setError(err.message);
      });
  }, [navigate]);

  const handleFirebaseGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try popup first
      await signInWithPopup(auth, googleProvider);
      navigate(-1);
    } catch (err) {
      // If popup is blocked, fall back to redirect
      if (err.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          // Page will redirect, so no further action needed here
          return;
        } catch (redirectErr) {
          console.error("Redirect Auth Error:", redirectErr);
          setError(redirectErr.message);
        }
      } else {
        console.error("Firebase Auth Error:", err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      
      {/* ── LEFT SIDE: Branding & Logo (Hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-400 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Grid Pattern for cyber aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="DRISHTI Logo" className="h-27 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            <span className="text-3xl font-extrabold tracking-widest text-white">
              DRISHTI
            </span>
          </Link>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 max-w-lg mb-20">
          <h1 className="text-4xl font-black text-white mb-10 leading-tight">
            Centralized Threat <br/> Intelligence Gateway.
          </h1>
          <p className="text-lg text-zinc-600 font-medium">
            Access real-time cybercrime telemetry, predictive hostage intervention modules, and cross-jurisdictional fraud mapping.
          </p>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 flex items-center gap-3 text-zinc-500 text-sm font-semibold">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Restricted Government Access Node
        </div>
      </div>

      {/* ── RIGHT SIDE: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-zinc-50 relative">
        
        {/* Mobile Logo (Only shows on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <img src={logo} alt="DRISHTI Logo" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold tracking-widest text-zinc-900">
            DRISHTI
          </span>
        </div>

        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl">
          
          {/* Centered Logo above title */}
          <div className="flex justify-center mt- mb-0">
            <img src={logo} alt="DRISHTI Logo" className="h-24 w-auto object-contain" />
          </div>

          <div className="mb-2 text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-10">
              {isSignUp ? "Create clearance profile" : "Welcome to DRISHTI"}
              <p className="text-sm mb-7 font-semibold text-zinc-400">
                Digital Risk Intelligence & Safety Hub
              </p>
            </h2>
            
            <p className="text-sm text-zinc-500">
              Sign in securely to access the AI-powered Threat Detection Command Center.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            
            {/* Main Google Action */}
            <button
              onClick={handleFirebaseGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>{isSignUp ? "Sign up with Google" : "Sign in with Google"}</span>
            </button>
          </div>

          <div className="mt-4 pt-0  border-t border-zinc-200  text-center">
            <p className="text-sm pt-5 text-zinc-500">
              {isSignUp ? "Already cleared for access?" : "Need administrative clearance?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                {isSignUp ? "Sign In" : "Request Access"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}