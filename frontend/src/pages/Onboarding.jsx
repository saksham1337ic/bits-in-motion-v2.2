import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GOALS, EQUIPMENT } from "@/lib/exercises";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ExerciseDemo } from "@/components/ExerciseDemo";

export default function Onboarding() {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  const [age, setAge] = useState(profile?.age || 20);
  const [goal, setGoal] = useState(profile?.goal || "strength");
  const [equipment, setEquipment] = useState(profile?.equipment || "none");
  const [lowImpact, setLowImpact] = useState(profile?.lowImpact || false);

  const submit = () => {
    setProfile({ age: Number(age) || 20, goal, equipment, lowImpact });
    navigate("/app");
  };

  return (
    <div className="min-h-screen grid-bg">
      <div className="radial-glow min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-6 fade-up">
          {/* Left: brand / demo */}
          <div className="hud-card scanlines relative overflow-hidden p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#00f3ff]/50 bg-[#00f3ff]/10 glow-cyan">
                  <Activity className="h-5 w-5 text-[#00f3ff]" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#00f3ff]">
                  Privacy-first · On-device AI
                </span>
              </div>
              <h1 className="mt-6 text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight">
                BITS<br />
                <span className="text-[#00f3ff] text-glow">in Motion</span>
              </h1>
              <p className="mt-4 max-w-sm text-slate-400 leading-relaxed">
                Your webcam becomes an AI form coach. It counts reps live, watches your joint
                angles and never sends a single frame off your device.
              </p>
              <div className="mt-6 flex flex-col gap-2 text-sm text-slate-400">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10b981]" /> 100% client-side — no sign-in, no server</span>
                <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#ffb020]" /> Built for a hostel room & bodyweight</span>
              </div>
            </div>
            <div className="mt-6 h-40 self-center w-40">
              <ExerciseDemo demo="squat" />
            </div>
          </div>

          {/* Right: questionnaire */}
          <div className="hud-card p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#00f3ff]">Athlete Profile</p>
            <h2 className="mt-1 text-3xl font-extrabold uppercase tracking-tight">Quick Setup</h2>
            <p className="mt-1 text-sm text-slate-500">Takes 20 seconds. Editable anytime in Settings.</p>

            <div className="mt-6 space-y-6">
              <div>
                <Label className="text-slate-300">Age</Label>
                <Input
                  type="number" min="10" max="99" value={age}
                  onChange={(e) => setAge(e.target.value)}
                  data-testid="onboarding-age-input"
                  className="mt-2 bg-[#101014] border-white/10 focus-visible:ring-[#00f3ff]"
                />
              </div>

              <div>
                <Label className="text-slate-300">Primary Objective</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      data-testid={`onboarding-goal-${g.id}`}
                      className={`rounded-md border px-3 py-2.5 text-left transition-all ${
                        goal === g.id
                          ? "border-[#00f3ff]/60 bg-[#00f3ff]/10 glow-cyan"
                          : "border-white/10 bg-[#101014] hover:border-white/25"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{g.short}</span>
                      <span className="block text-[11px] text-slate-500 leading-tight">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Available Gear</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {EQUIPMENT.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEquipment(e.id)}
                      data-testid={`onboarding-equipment-${e.id}`}
                      className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-all ${
                        equipment === e.id
                          ? "border-[#00f3ff]/60 bg-[#00f3ff]/10 glow-cyan"
                          : "border-white/10 bg-[#101014] hover:border-white/25"
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#101014] p-4">
                <div>
                  <p className="font-semibold text-slate-200">Low-Impact Quiet Mode</p>
                  <p className="text-[12px] text-slate-500 max-w-[16rem]">
                    Swaps jumps for quiet variants — no floor thuds for your roomie.
                  </p>
                </div>
                <Switch
                  checked={lowImpact}
                  onCheckedChange={setLowImpact}
                  data-testid="onboarding-lowimpact-toggle"
                  className="data-[state=checked]:bg-[#00f3ff]"
                />
              </div>

              <Button
                onClick={submit}
                data-testid="onboarding-submit"
                className="w-full h-12 bg-[#00f3ff] text-black font-bold uppercase tracking-wide hover:bg-[#00f3ff]/85 glow-cyan"
              >
                Enter Command Center <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
