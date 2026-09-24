import React, { useState } from "react";
import { toast } from "sonner";
import { Utensils, Sparkles, RefreshCw, Loader2, Flame, Beef, Info, Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GOALS } from "@/lib/exercises";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DIETS = [
  { id: "veg", label: "Vegetarian" },
  { id: "egg", label: "Egg-OK" },
  { id: "nonveg", label: "Non-Veg" },
  { id: "vegan", label: "Vegan" },
];
const BUDGETS = [
  { id: "low", label: "Tight" },
  { id: "medium", label: "Moderate" },
  { id: "any", label: "Flexible" },
];

export default function Fuel() {
  const { profile, meal, setMeal } = useApp();
  const saved = meal?.inputs || {};
  const [diet, setDiet] = useState(saved.diet || "veg");
  const [budget, setBudget] = useState(saved.budget || "low");
  const [allergies, setAllergies] = useState(saved.allergies || "");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(meal?.plan || null);

  const goalLabel = GOALS.find((g) => g.id === profile?.goal)?.short || "Fitness";

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/meal/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          goal: profile?.goal || "strength",
          diet,
          allergies,
          budget,
          age: profile?.age || 20,
          equipment: profile?.equipment || "none",
        }),
      });
      if (!res.ok) throw new Error("gen failed");
      const data = await res.json();
      setPlan(data);
      setMeal({ plan: data, inputs: { diet, budget, allergies }, savedAt: new Date().toISOString() });
      toast.success("Fresh fuel plan ready", { description: "Saved to your profile." });
    } catch {
      toast.error("Couldn't generate a plan", { description: "Please try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ active, onClick, children, testid }) => (
    <button onClick={onClick} data-testid={testid}
      className={`rounded-md border px-3 py-2 text-sm font-semibold transition-all ${
        active ? "border-[#00f3ff]/60 bg-[#00f3ff]/10 text-[#00f3ff] glow-cyan" : "border-white/10 bg-[#101014] text-slate-300 hover:border-white/25"
      }`}>
      {children}
    </button>
  );

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Controls */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
        <div className="hud-card p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#00f3ff]/40 bg-[#00f3ff]/10">
              <Utensils className="h-5 w-5 text-[#00f3ff]" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight">Fuel Guide</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">Goal: {goalLabel}</p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <Label className="text-slate-300">Diet Type</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {DIETS.map((d) => (
                  <Chip key={d.id} active={diet === d.id} onClick={() => setDiet(d.id)} testid={`diet-${d.id}`}>{d.label}</Chip>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Budget</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)} testid={`budget-${b.id}`}>{b.label}</Chip>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Allergies / Dislikes <span className="text-slate-600">(optional)</span></Label>
              <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} data-testid="allergies-input"
                placeholder="e.g. peanuts, lactose"
                className="mt-2 bg-[#101014] border-white/10 focus-visible:ring-[#00f3ff]" />
            </div>

            <Button onClick={generate} disabled={loading} data-testid="generate-meal-btn"
              className="w-full h-12 bg-[#00f3ff] text-black font-bold uppercase tracking-wide hover:bg-[#00f3ff]/85 glow-cyan disabled:opacity-60">
              {loading ? <Loader2 className="mr-1 h-5 w-5 animate-spin" /> : plan ? <RefreshCw className="mr-1 h-4 w-4" /> : <Sparkles className="mr-1 h-4 w-4" />}
              {loading ? "Generating…" : plan ? "Regenerate" : "Generate Plan"}
            </Button>
          </div>
        </div>

        <div className="hud-card p-4 flex gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-[#ffb020]" />
          <p className="text-[12px] text-slate-500 leading-relaxed">
            AI-generated general guidance for hostel-friendly eating — <span className="text-slate-400">not dietary or medical advice</span>. Check ingredients against your own needs.
          </p>
        </div>
      </div>

      {/* Plan */}
      <div className="col-span-12 lg:col-span-8">
        {!plan ? (
          <div className="hud-card p-12 text-center h-full flex flex-col items-center justify-center">
            <Sparkles className="h-10 w-10 text-slate-600" />
            <p className="mt-3 text-lg font-semibold text-slate-300">No plan yet</p>
            <p className="text-sm text-slate-500 max-w-sm">Set your preferences and generate a personalized day of hostel-friendly eating tuned to your goal.</p>
          </div>
        ) : (
          <div className="space-y-5 fade-up">
            <div className="hud-card scanlines relative overflow-hidden p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">Your Fuel Plan</p>
              <h2 className="mt-1 text-3xl font-extrabold uppercase tracking-tight">{plan.title || "Daily Plan"}</h2>
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#ffb020]" />
                  <span className="font-mono text-2xl font-black text-[#ffb020]">{plan.day_calories ?? "—"}</span>
                  <span className="text-xs text-slate-500 uppercase">kcal / day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Beef className="h-5 w-5 text-[#10b981]" />
                  <span className="font-mono text-2xl font-black text-[#10b981]">{plan.day_protein_g ?? "—"}g</span>
                  <span className="text-xs text-slate-500 uppercase">protein</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(plan.meals || []).map((m, i) => (
                <div key={i} data-testid={`meal-card-${i}`} className="hud-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">{m.slot}</span>
                    <div className="flex gap-3 font-mono text-[11px] text-slate-500">
                      <span>{m.calories}kcal</span>
                      <span className="text-[#10b981]">{m.protein_g}g P</span>
                    </div>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-slate-100">{m.name}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-400">
                    {(m.items || []).map((it, j) => (
                      <li key={j} className="flex gap-2"><span className="text-[#00f3ff]">›</span>{it}</li>
                    ))}
                  </ul>
                  {m.rationale && <p className="mt-3 text-[12px] text-slate-500 italic border-t border-white/5 pt-2">{m.rationale}</p>}
                </div>
              ))}
            </div>

            {plan.tips?.length > 0 && (
              <div className="hud-card p-5">
                <h3 className="text-lg font-bold uppercase tracking-tight text-slate-300 flex items-center gap-2">
                  <Save className="h-4 w-4 text-[#00f3ff]" /> Coach Tips
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#00f3ff]">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
