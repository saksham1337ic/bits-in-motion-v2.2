import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AuthCallback() {
  const { completeAuth } = useApp();
  const navigate = useNavigate();
  const processed = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    if (!sessionId) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        await completeAuth(sessionId);
        window.history.replaceState(null, "", "/app");
        navigate("/app", { replace: true });
      } catch {
        setError(true);
      }
    })();
  }, [completeAuth, navigate]);

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center text-center px-6">
      {error ? (
        <div className="hud-card p-8 max-w-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-[#ff3b30]" />
          <p className="mt-3 font-semibold text-slate-200">Sign-in couldn't be completed</p>
          <p className="mt-1 text-sm text-slate-500">Please head back and try again.</p>
          <button onClick={() => navigate("/")} className="mt-5 rounded-md bg-[#00f3ff] px-5 py-2.5 font-bold text-black hover:bg-[#00f3ff]/85">
            Back to home
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-[#00f3ff]" />
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-[#00f3ff]">Signing you in…</p>
        </div>
      )}
    </div>
  );
}
