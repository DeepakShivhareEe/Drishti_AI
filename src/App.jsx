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
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

// Dedicated Footer Pages
import TrainingManuals from "./pages/TrainingManuals";
import ApiDocumentation from "./pages/ApiDocumentation";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Faqs from "./pages/Faqs";

// Old Pages to keep
import PhishingPage from './pages/PhishingPage';
import NotFoundPage from './pages/NotFoundPage';

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
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          
          {/* ── Footer Pages ───────────────────────────────── */}
          <Route path="/training" element={<TrainingManuals />} />
          <Route path="/api-access" element={<ApiDocumentation />} />
          <Route path="/contact-us" element={<HelpCenter />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsOfService />} />
          <Route path="/faqs" element={<Faqs />} />

          {/* ── Protected Routes ────────────────────────────── */}
          <Route path="/module/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><ModuleWorkspace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ClearanceProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CommandSettings /></ProtectedRoute>} />
          <Route path="/dashboard/phishing" element={<ProtectedRoute><PhishingPage /></ProtectedRoute>} />

          {/* ── 404 Catch-All ────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
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
