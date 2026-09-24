import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Dumbbell, Repeat, Trophy, Camera, ChevronRight, Target, CalendarDays } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Cell, Tooltip } from "recharts";
import { useApp } from "@/context/AppContext";
import { recommendedExercises, displayName, libraryExercises, GOALS } from "@/lib/exercises";
import { ProgressRing } from "@/components/ProgressRing";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { Badge } from "@/components/ui/badge";

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

function useStats(history) {
  return useMemo(() => {
    const totalWorkouts = history.length;
    const totalReps = history.filter((h) => h.type !== "timed").reduce((s, h) => s + (h.count || 0), 0);

    // streak
    const days = new Set(history.map((h) => dayKey(h.date)));
    let streak = 0;
    const cursor = new Date();
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // per exercise
    const perExercise = {};
    history.forEach((h) => {
      const p = (perExercise[h.exerciseId] = perExercise[h.exerciseId] || {
        id: h.exerciseId, name: h.name, type: h.type, best: 0, total: 0, sessions: 0,
      });
      p.best = Math.max(p.best, h.count || 0);
      p.total += h.count || 0;
      p.sessions += 1;
    });

    // weekly (last 7 days reps)
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const reps = history
        .filter((h) => dayKey(h.date) === k && h.type !== "timed")
        .reduce((s, h) => s + (h.count || 0), 0);
      weekly.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), reps });
    }

    return { totalWorkouts, totalReps, streak, perExercise: Object.values(perExercise), weekly };
  }, [history]);
}

const StatRing = ({ value, max, label, color, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2">
    <ProgressRing value={value} max={max} size={112} stroke={8} color={color}>
      <Icon className="h-4 w-4 mb-0.5" style={{ color }} />
      <span className="font-mono text-2xl font-black tracking-tighter" style={{ color }}>{value}</span>
    </ProgressRing>
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
  </div>
);

export default function Dashboard() {
  const { profile, history } = useApp();
  const navigate = useNavigate();
  const stats = useStats(history);
  const recs = recommendedExercises(profile);
  const goalLabel = GOALS.find((g) => g.id === profile?.goal)?.short || "Athlete";
  const weekTotal = stats.weekly.reduce((s, d) => s + d.reps, 0);
  const maxWeek = Math.max(10, ...stats.weekly.map((d) => d.reps));

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* ============ LEFT COLUMN ============ */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
        <div className="hud-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">Athlete</p>
          <h3 className="text-2xl font-extrabold uppercase tracking-tight">{goalLabel} Track</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/15 text-slate-300">Age {profile?.age}</Badge>
            <Badge variant="outline" className="border-white/15 text-slate-300">
              {profile?.equipment === "backpack" ? "Backpack" : "Bodyweight"}
            </Badge>
            {profile?.lowImpact && (
              <Badge className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">Quiet Mode</Badge>
            )}
          </div>
        </div>

        <div className="hud-card p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy className="h-4 w-4 text-[#ffb020]" />
            <h4 className="text-lg font-bold uppercase tracking-tight">Exercise Bests</h4>
          </div>
          <div className="mt-4 space-y-3">
            {stats.perExercise.length === 0 && (
              <p className="text-sm text-slate-500">No sessions logged yet. Fire up the Camera Coach →</p>
            )}
            {stats.perExercise.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[11px] text-slate-500">{p.sessions} session{p.sessions > 1 ? "s" : ""} · {p.total} total</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-black text-[#00f3ff]">{p.best}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{p.type === "timed" ? "sec" : "reps"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ CENTER COLUMN ============ */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
        <div className="hud-card scanlines relative overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00f3ff]">Command Center</p>
              <h1 className="mt-1 text-4xl sm:text-5xl font-black uppercase leading-none tracking-tight">
                Ready to <span className="text-[#00f3ff] text-glow">Move</span>?
              </h1>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Pick a drill below. The AI coach counts every rep and calls your form in real time.
              </p>
              <button
                onClick={() => navigate(`/coach/${recs[0]?.id || "squats"}`)}
                data-testid="quick-start-coach"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#00f3ff] px-5 py-3 font-bold uppercase tracking-wide text-black hover:bg-[#00f3ff]/85 glow-cyan transition-colors"
              >
                <Camera className="h-4 w-4" /> Launch Camera Coach
              </button>
            </div>
            <div className="hidden sm:block h-28 w-28 shrink-0 opacity-90">
              <ExerciseDemo demo={recs[0]?.demo || "squat"} />
            </div>
          </div>
        </div>

        <div className="hud-card p-6">
          <div className="flex items-center justify-around">
            <StatRing value={stats.streak} max={Math.max(7, stats.streak)} label="Day Streak" color="#ffb020" icon={Flame} />
            <StatRing value={stats.totalWorkouts} max={Math.max(10, stats.totalWorkouts)} label="Workouts" color="#00f3ff" icon={Dumbbell} />
            <StatRing value={stats.totalReps} max={Math.max(50, stats.totalReps)} label="Total Reps" color="#10b981" icon={Repeat} />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#00f3ff]" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Recommended Drills</h3>
            {profile?.lowImpact && <span className="font-mono text-[10px] text-[#10b981]">· quiet-mode filtered</span>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recs.map((ex) => (
              <button
                key={ex.id}
                onClick={() => navigate(`/coach/${ex.id}`)}
                data-testid={`exercise-tile-${ex.id}`}
                className="hud-card group relative overflow-hidden p-4 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-20 w-20 shrink-0">
                    <ExerciseDemo demo={ex.demo} />
                  </div>
                  <div className="flex-1 pl-3">
                    <p className="text-lg font-bold text-slate-100">{displayName(ex, profile)}</p>
                    <p className="text-[12px] text-slate-500">{ex.tagline}</p>
                    <div className="mt-2 flex gap-1.5">
                      <Badge variant="outline" className="border-white/15 text-[10px] text-slate-400 uppercase">
                        {ex.type === "timed" ? "Hold" : ex.type === "spread" ? "Cardio" : "Reps"}
                      </Badge>
                      {ex.variant && <Badge className="bg-[#10b981]/15 text-[10px] text-[#10b981] border border-[#10b981]/30">Low-impact</Badge>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-[#00f3ff] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ RIGHT COLUMN ============ */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
        <div className="hud-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <CalendarDays className="h-4 w-4 text-[#00f3ff]" />
              <h4 className="text-lg font-bold uppercase tracking-tight">This Week</h4>
            </div>
            <span className="font-mono text-sm font-black text-[#00f3ff]">{weekTotal}</span>
          </div>
          <div className="mt-4 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekly} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,243,255,0.06)" }}
                  contentStyle={{ background: "#16161b", border: "1px solid rgba(0,243,255,0.3)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="reps" radius={[4, 4, 0, 0]}>
                  {stats.weekly.map((d, i) => (
                    <Cell key={i} fill={d.reps > 0 ? "#00f3ff" : "#26262c"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hud-card p-5">
          <h4 className="text-lg font-bold uppercase tracking-tight text-slate-300">Full Library</h4>
          <div className="mt-3 space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {libraryExercises().filter((e) => e.gear === "none").map((ex) => (
              <button
                key={ex.id}
                onClick={() => navigate(`/coach/${ex.id}`)}
                data-testid={`library-${ex.id}`}
                className="flex w-full items-center justify-between rounded-md border border-white/5 bg-[#101014] px-3 py-2 text-left hover:border-[#00f3ff]/40 transition-colors"
              >
                <span className="text-sm font-medium text-slate-200">{ex.name}</span>
                <Badge
                  className={`text-[10px] uppercase border ${
                    ex.impact === "high" ? "bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/30"
                    : ex.impact === "moderate" ? "bg-[#ffb020]/10 text-[#ffb020] border-[#ffb020]/30"
                    : "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30"
                  }`}
                >
                  {ex.impact}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
