import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Camera, LayoutDashboard, Utensils, ShieldCheck, ArrowRight, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { Footer } from "@/components/Footer";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 2.9 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.7H12z" />
  </svg>
);

const features = [
  { icon: Camera, title: "AI Camera Coach", body: "Your webcam tracks your joints live and counts reps with real-time form cues — nothing leaves your device." },
  { icon: LayoutDashboard, title: "Command Center", body: "Glowing progress rings, streaks, weekly charts and personal bests in a tactical 3-column HUD." },
  { icon: Utensils, title: "AI Fuel Guide", body: "Hostel-friendly, budget meal plans tuned to your goal — generated on demand, no setup." },
  { icon: ShieldCheck, title: "Privacy-First", body: "Guests stay 100% local. Sign in with Google to sync history across devices. No passwords." },
];

export default function Landing() {
  const { enterGuest, signInGoogle, mode } = useApp();
  const navigate = useNavigate();

  const goGuest = () => { enterGuest(); navigate("/app"); };

  return (
    <div className="min-h-screen grid-bg text-slate-100 flex flex-col">
      <div className="radial-glow flex-1 flex flex-col">
        <header className="mx-auto w-full max-w-[1400px] px-5 h-16 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#00f3ff]/50 bg-[#00f3ff]/10 glow-cyan">
            <Activity className="h-5 w-5 text-[#00f3ff]" />
          </span>
          <span className="text-xl font-black uppercase tracking-tight text-glow" style={{ fontFamily: "Barlow Condensed" }}>
            BITS <span className="text-[#00f3ff]">in Motion</span>
          </span>
        </header>

        <section className="mx-auto w-full max-w-[1400px] px-5 pt-6 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center fade-up">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#00f3ff]">Privacy-first · On-device AI</span>
            <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.88] tracking-tight">
              Train harder.<br /><span className="text-[#00f3ff] text-glow">Count smarter.</span>
            </h1>
            <p className="mt-5 max-w-xl text-slate-400 leading-relaxed text-base sm:text-lg">
              The AI fitness coach built for a hostel room. Your webcam watches your form and counts every rep
              in real time — squats, push-ups, planks and more — all processed on your device.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={signInGoogle} data-testid="google-signin-btn"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-white px-6 py-3.5 font-bold text-slate-900 hover:bg-slate-100 transition-colors">
                <GoogleIcon /> Sign in with Google
              </button>
              <button onClick={goGuest} data-testid="continue-guest-btn"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#00f3ff]/50 bg-[#00f3ff]/10 px-6 py-3.5 font-bold uppercase tracking-wide text-[#00f3ff] hover:bg-[#00f3ff]/20 transition-colors glow-cyan">
                <UserPlus className="h-4 w-4" /> Continue as guest
              </button>
              {mode && (
                <button onClick={() => navigate("/app")} data-testid="enter-dashboard-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 font-bold uppercase tracking-wide text-slate-300 hover:text-[#00f3ff] transition-colors">
                  Enter Command Center <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Guest data lives only in this browser. Google sign-in syncs your history to the cloud.
            </p>
          </div>

          <div className="hud-card scanlines relative overflow-hidden p-8 flex items-center justify-center">
            <div className="h-64 w-64"><ExerciseDemo demo="squat" /></div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="hud-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#00f3ff]/40 bg-[#00f3ff]/10">
                <f.icon className="h-5 w-5 text-[#00f3ff]" />
              </span>
              <h3 className="mt-4 text-xl font-bold uppercase tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </div>
  );
}
