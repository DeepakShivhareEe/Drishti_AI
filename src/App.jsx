import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// Utilities
import ScrollToTop from "./components/ScrollToTop";

// New Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleWorkspace from "./pages/ModuleWorkspace";
import AuthPage from "./pages/AuthPage";
import ClearanceProfile from "./pages/ClearanceProfile";
import CommandSettings from "./pages/CommandSettings";
import ProtectedRoute from "./components/ProtectedRoute";

// Old Pages to keep
import PhishingPage from './pages/PhishingPage';

// New Components
import Navbar from "./components/HomeComponents/Navbar";
import Footer from "./components/HomeComponents/Footer";
import Background from "./components/HomeComponents/Background";

// Import App CSS
import './App.css';

const FOOTER_HIDDEN_ROUTES = ["/dashboard", "/dashboard/phishing", "/login"];
const NAVBAR_HIDDEN_ROUTES = ["/login"];

function AppContent() {
  const location = useLocation();
  const showFooter = !FOOTER_HIDDEN_ROUTES.includes(location.pathname) && !location.pathname.startsWith('/workspace');
  const showNavbar = !NAVBAR_HIDDEN_ROUTES.includes(location.pathname);
  const isLoginPage = location.pathname === "/login";

  return (
    <div className={`relative flex flex-col ${isLoginPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      
      {/* Aurora Background - hidden on login */}
      {!isLoginPage && <Background />}

      {showNavbar && <Navbar />}
      
      <main className="flex-1 w-full">
        <ScrollToTop />
        <Routes>
          {/* ── Public Routes ───────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ── Protected Routes ────────────────────────────── */}
          <Route path="/module/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><ModuleWorkspace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ClearanceProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CommandSettings /></ProtectedRoute>} />
          <Route path="/dashboard/phishing" element={<ProtectedRoute><PhishingPage /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
