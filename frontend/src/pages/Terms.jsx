import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Footer } from "@/components/Footer";

const sections = [
  { h: "1. Fitness aid, not medical advice", p: "BITS in Motion is a fitness and motivation tool. It does not provide medical, health, or professional coaching advice. Always consult a qualified professional before starting any exercise program, especially if you have injuries or health conditions. Stop immediately if you feel pain or discomfort. You use the app at your own risk." },
  { h: "2. Camera & privacy", p: "The AI Camera Coach processes your webcam feed entirely on your device using an in-browser pose model. Video frames are never uploaded, recorded, or transmitted to any server. Rep counting and form feedback happen locally in your browser." },
  { h: "3. How your data is stored", p: "Guests: your profile, settings, workout history and meal preferences are stored only in your current browser's local storage. Clearing browser data erases them, and they are not accessible on other devices. Google-signed-in users: the same data is synced to your account in the cloud so it follows you across devices. Signing in as a guest first and then with Google performs a one-time merge of your local data into your account." },
  { h: "4. AI meal suggestions", p: "The Fuel guide generates general meal ideas using AI based on the inputs you provide. Suggestions are approximate, may be inaccurate, and are not dietary, nutritional, or medical advice. Verify ingredients against your own allergies and needs before eating anything." },
  { h: "5. Acceptable use", p: "Use the app for personal, lawful fitness purposes. Do not attempt to misuse, reverse-engineer, or disrupt the service. The app is provided \"as is\" without warranties of any kind, and accuracy of rep counting depends on lighting, camera framing and positioning." },
  { h: "6. Changes", p: "These terms may be updated over time. Continued use of the app constitutes acceptance of the current version. This page is informational and tailored to this app; it is not legal advice." },
];

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid-bg text-slate-100 flex flex-col">
      <div className="radial-glow flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <button onClick={() => navigate(-1)} data-testid="terms-back"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#00f3ff] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-[#00f3ff]" />
            <h1 className="text-4xl font-black uppercase tracking-tight">Terms &amp; Conditions</h1>
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Informational — no acceptance required</p>

          <div className="mt-8 space-y-6" data-testid="terms-content">
            {sections.map((s) => (
              <section key={s.h} className="hud-card p-5">
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-200">{s.h}</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
