import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/HomeComponents/Navbar";
import Footer from "./components/HomeComponents/Footer";
import Background from "./components/HomeComponents/Background";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleWorkspace from "./pages/ModuleWorkspace";

const FOOTER_HIDDEN_ROUTES = ["/dashboard"];

function AppContent() {
  const location = useLocation();
  const showFooter = !FOOTER_HIDDEN_ROUTES.includes(location.pathname);

  return (
    // 1. Removed inline styles. Kept it relative so the background sits inside properly.
    <div className="relative min-h-screen flex flex-col">
      
      {/* 2. Added the Aurora Background so it covers the entire app */}
      <Background />

      <Navbar />
      
      {/* 3. Removed the paddingTop style! The Hero component already handles its own padding. */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Route for descriptive documentation details */}
          <Route path="/module/:id" element={<ModuleDetail />} />
      
          {/* Route for isolated live console operations workspace */}
          <Route path="/workspace/:id" element={<ModuleWorkspace />} />
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