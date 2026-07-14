import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

/**
 * ProtectedRoute — Guards child routes behind Firebase Auth.
 *
 * 1. While Firebase is initializing, shows a cyber-themed loading screen
 *    so a page refresh doesn't falsely redirect authenticated users.
 * 2. Once resolved, renders children if authenticated, or redirects to /login.
 */
export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Loading / Initializing State ──────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
        {/* Subtle radial glow behind the spinner */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_65%)]" />

        {/* Pulsing ring spinner */}
        <div className="relative mb-8">
          <div className="h-16 w-16 rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
        </div>

        {/* Status text */}
        <p className="relative text-sm font-semibold tracking-[0.25em] uppercase text-cyan-400/90 animate-pulse">
          Verifying Security Clearance
        </p>
        <p className="relative mt-2 text-xs tracking-widest text-zinc-500">
          Please standby…
        </p>
      </div>
    );
  }

  // ── Not Authenticated ─────────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated — render protected content ──────────────────────────
  return children;
}
