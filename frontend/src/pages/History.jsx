import React from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, Trash2, Camera, Timer, Repeat } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { history, clearHistory } = useApp();
  const navigate = useNavigate();

  const fmt = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <HistoryIcon className="h-6 w-6 text-[#00f3ff]" />
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Session Log</h1>
            <p className="text-sm text-slate-500">{history.length} workout{history.length !== 1 ? "s" : ""} stored locally</p>
          </div>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" data-testid="clear-history-btn" className="border-[#ff3b30]/40 text-[#ff3b30] hover:bg-[#ff3b30]/10">
                <Trash2 className="mr-1 h-4 w-4" /> Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16161b] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every logged session from your browser. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/15">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} data-testid="confirm-clear-history" className="bg-[#ff3b30] text-white hover:bg-[#ff3b30]/85">
                  Clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {history.length === 0 ? (
        <div className="hud-card p-12 text-center">
          <Camera className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-lg font-semibold text-slate-300">No sessions yet</p>
          <p className="text-sm text-slate-500">Your logged reps and holds will appear here.</p>
          <Button onClick={() => navigate("/")} className="mt-5 bg-[#00f3ff] text-black font-bold hover:bg-[#00f3ff]/85">
            Start a workout
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((h) => (
            <div key={h.id} data-testid="history-row"
              className="hud-card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#101014]">
                  {h.type === "timed" ? <Timer className="h-5 w-5 text-[#ffb020]" /> : <Repeat className="h-5 w-5 text-[#00f3ff]" />}
                </span>
                <div>
                  <p className="font-semibold text-slate-100">{h.name}</p>
                  <p className="text-[12px] text-slate-500">{fmt(h.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-black text-[#00f3ff]">{h.count}</p>
                <Badge variant="outline" className="border-white/15 text-[10px] uppercase text-slate-400">
                  {h.type === "timed" ? "sec hold" : "reps"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
