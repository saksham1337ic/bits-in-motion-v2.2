import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import CameraCoach from "@/pages/CameraCoach";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Fuel from "@/pages/Fuel";
import Terms from "@/pages/Terms";
import AuthCallback from "@/pages/AuthCallback";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

function FullLoader() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#00f3ff]" />
    </div>
  );
}

function Protected({ children, requireProfile = true }) {
  const { ready, mode, profile } = useApp();
  if (!ready) return <FullLoader />;
  if (!mode) return <Navigate to="/" replace />;
  if (requireProfile && !profile) return <Navigate to="/onboarding" replace />;
  return <Layout>{children}</Layout>;
}

function Routed() {
  const location = useLocation();
  const { ready, mode } = useApp();

  // Auth callback: session_id arrives in the URL fragment. Handle before anything else.
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/onboarding"
        element={!ready ? <FullLoader /> : !mode ? <Navigate to="/" replace /> : <Onboarding />}
      />
      <Route path="/app" element={<Protected><Dashboard /></Protected>} />
      <Route path="/coach/:exerciseId" element={<Protected><CameraCoach /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
      <Route path="/fuel" element={<Protected><Fuel /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="App dark">
      <AppProvider>
        <BrowserRouter>
          <Routed />
        </BrowserRouter>
        <Toaster position="top-center" theme="dark" richColors />
      </AppProvider>
    </div>
  );
}

export default App;
