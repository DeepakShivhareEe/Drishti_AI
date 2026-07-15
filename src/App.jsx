import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

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

// Old Pages to keep
import ScamDetectorPage from './pages/ScamDetectorPage';
import CurrencyPage from './pages/CurrencyPage';
import PhishingPage from './pages/PhishingPage';

// New Components
import Navbar from "./components/HomeComponents/Navbar";
import Footer from "./components/HomeComponents/Footer";
import Background from "./components/HomeComponents/Background";

// Import App CSS
import './App.css';

const FOOTER_HIDDEN_ROUTES = ["/dashboard", "/dashboard/scam-detector", "/dashboard/currency", "/login"];
const NAVBAR_HIDDEN_ROUTES = ["/login"];

function AppContent() {
  const location = useLocation();
  const showFooter = !FOOTER_HIDDEN_ROUTES.includes(location.pathname);
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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/scam-detector" element={<ScamDetectorPage />} />
          <Route path="/dashboard/currency" element={<CurrencyPage />} />
          <Route path="/dashboard/phishing" element={<PhishingPage />} />
          <Route path="/module/:id" element={<ModuleDetail />} />
          <Route path="/workspace/:id" element={<ModuleWorkspace />} />
          <Route path="/profile" element={<ClearanceProfile />} />
          <Route path="/settings" element={<CommandSettings />} />
        </Routes>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
