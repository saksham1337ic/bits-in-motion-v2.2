import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import CameraCoach from "@/pages/CameraCoach";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import { Toaster } from "@/components/ui/sonner";

function Protected({ children }) {
  const { profile } = useApp();
  const location = useLocation();
  if (!profile) return <Navigate to="/onboarding" replace state={{ from: location }} />;
  return <Layout>{children}</Layout>;
}

function Routed() {
  const { profile } = useApp();
  return (
    <Routes>
      <Route path="/onboarding" element={profile ? <Navigate to="/" replace /> : <Onboarding />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/coach/:exerciseId" element={<Protected><CameraCoach /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
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
