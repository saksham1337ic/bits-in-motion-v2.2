import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Settings as SettingsIcon, Volume2, Mic, Save, Trash2, RotateCcw, Download, Upload } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GOALS, EQUIPMENT } from "@/lib/exercises";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { profile, history, settings, setProfile, setSetting, clearHistory, resetApp, replaceAll } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [age, setAge] = useState(profile?.age || 20);
  const [goal, setGoal] = useState(profile?.goal || "strength");
  const [equipment, setEquipment] = useState(profile?.equipment || "none");
  const [lowImpact, setLowImpact] = useState(profile?.lowImpact || false);

  const save = () => {
    setProfile({ age: Number(age) || 20, goal, equipment, lowImpact });
    toast.success("Profile updated", { description: "Recommendations refreshed." });
  };

  const doExport = () => {
    const blob = new Blob([JSON.stringify({ profile, history, settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bits-in-motion-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workout data exported", { description: `${history.length} session${history.length !== 1 ? "s" : ""} saved to file` });
  };

  const doImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.history)) throw new Error("bad");
        replaceAll(parsed);
        toast.success("Workout data imported", { description: `${parsed.history.length} session${parsed.history.length !== 1 ? "s" : ""} restored` });
      } catch {
        toast.error("Invalid backup file", { description: "Please pick a BITS in Motion export JSON." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2.5 mb-6">
        <SettingsIcon className="h-6 w-6 text-[#00f3ff]" />
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Settings</h1>
      </div>

      <div className="hud-card p-6 space-y-6">
        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-200">Athlete Profile</h3>

        <div>
          <Label className="text-slate-300">Age</Label>
          <Input type="number" min="10" max="99" value={age} onChange={(e) => setAge(e.target.value)}
            data-testid="settings-age-input"
            className="mt-2 bg-[#101014] border-white/10 focus-visible:ring-[#00f3ff]" />
        </div>

        <div>
          <Label className="text-slate-300">Primary Objective</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button key={g.id} onClick={() => setGoal(g.id)} data-testid={`settings-goal-${g.id}`}
                className={`rounded-md border px-3 py-2.5 text-left transition-all ${
                  goal === g.id ? "border-[#00f3ff]/60 bg-[#00f3ff]/10 glow-cyan" : "border-white/10 bg-[#101014] hover:border-white/25"
                }`}>
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
              <button key={e.id} onClick={() => setEquipment(e.id)} data-testid={`settings-equipment-${e.id}`}
                className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-all ${
                  equipment === e.id ? "border-[#00f3ff]/60 bg-[#00f3ff]/10 glow-cyan" : "border-white/10 bg-[#101014] hover:border-white/25"
                }`}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#101014] p-4">
          <div>
            <p className="font-semibold text-slate-200">Low-Impact Quiet Mode</p>
            <p className="text-[12px] text-slate-500">Swaps high-impact drills for quiet alternatives.</p>
          </div>
          <Switch checked={lowImpact} onCheckedChange={setLowImpact} data-testid="settings-lowimpact-toggle"
            className="data-[state=checked]:bg-[#00f3ff]" />
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#101014] p-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#00f3ff]" />
            <div>
              <p className="font-semibold text-slate-200">Coaching Sounds</p>
              <p className="text-[12px] text-slate-500">Beeps on valid reps & phase changes.</p>
            </div>
          </div>
          <Switch checked={settings.sound} onCheckedChange={(v) => setSetting("sound", v)} data-testid="settings-sound-toggle"
            className="data-[state=checked]:bg-[#00f3ff]" />
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#101014] p-4">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#00f3ff]" />
            <div>
              <p className="font-semibold text-slate-200">Spoken Coach</p>
              <p className="text-[12px] text-slate-500">Calls your reps and cues out loud during sessions.</p>
            </div>
          </div>
          <Switch checked={settings.voice} onCheckedChange={(v) => setSetting("voice", v)} data-testid="settings-voice-toggle"
            className="data-[state=checked]:bg-[#00f3ff]" />
        </div>

        <Button onClick={save} data-testid="settings-save"
          className="w-full h-11 bg-[#00f3ff] text-black font-bold uppercase tracking-wide hover:bg-[#00f3ff]/85 glow-cyan">
          <Save className="mr-1 h-4 w-4" /> Save Profile
        </Button>
      </div>

      <div className="hud-card p-6 mt-5">
        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-200">Backup & Restore</h3>
        <p className="mt-1 text-sm text-slate-500">Your data lives only in this browser. Export a copy or restore one on any device.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Button onClick={doExport} data-testid="export-data-btn"
            className="bg-[#00f3ff] text-black font-bold uppercase tracking-wide hover:bg-[#00f3ff]/85 glow-cyan">
            <Download className="mr-1 h-4 w-4" /> Export JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()} data-testid="import-data-btn" variant="outline"
            className="border-[#00f3ff]/40 text-[#00f3ff] hover:bg-[#00f3ff]/10">
            <Upload className="mr-1 h-4 w-4" /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept="application/json" onChange={doImport} className="hidden" data-testid="import-file-input" />
        </div>
      </div>

      <div className="hud-card p-6 mt-5">
        <h3 className="text-xl font-bold uppercase tracking-tight text-[#ff3b30]">Data Management</h3>
        <p className="mt-1 text-sm text-slate-500">All data lives only in this browser's localStorage.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" data-testid="settings-clear-history" className="border-[#ffb020]/40 text-[#ffb020] hover:bg-[#ffb020]/10">
                <Trash2 className="mr-1 h-4 w-4" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16161b] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear workout history?</AlertDialogTitle>
                <AlertDialogDescription>Keeps your profile, removes all logged sessions.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/15">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { clearHistory(); toast.success("History cleared"); }} className="bg-[#ffb020] text-black hover:bg-[#ffb020]/85">
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" data-testid="settings-reset-app" className="border-[#ff3b30]/40 text-[#ff3b30] hover:bg-[#ff3b30]/10">
                <RotateCcw className="mr-1 h-4 w-4" /> Reset App
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16161b] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                <AlertDialogDescription>Wipes your profile and history, returning to onboarding.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/15">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { resetApp(); navigate("/onboarding"); }} className="bg-[#ff3b30] text-white hover:bg-[#ff3b30]/85">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
