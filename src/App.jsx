import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/HomeComponents/Navbar";
import Footer from "./components/HomeComponents/Footer";
import Background from "./components/HomeComponents/Background";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleWorkspace from "./pages/ModuleWorkspace";
import AuthPage from "./pages/AuthPage";
import ClearanceProfile from "./pages/ClearanceProfile";
import CommandSettings from "./pages/CommandSettings";
import ProtectedRoute from "./components/ProtectedRoute";


const FOOTER_HIDDEN_ROUTES = ["/dashboard", "/login"];
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
      
      {/* 3. Removed the paddingTop style! The Hero component already handles its own padding. */}
      <main className="flex-1 w-full">

      <ScrollToTop /> 
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }
        }} 
      />

      

        <Routes>
          {/* ── Public Routes ───────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<AuthPage />} />

          {/* ── Protected Routes ────────────────────────────── */}
          <Route path="/module/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><ModuleWorkspace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ClearanceProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CommandSettings /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;