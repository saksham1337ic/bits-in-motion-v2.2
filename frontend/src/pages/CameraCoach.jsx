import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Camera, CameraOff, Play, Square, Loader2, AlertTriangle, Gauge, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { EXERCISES, evaluatePose, displayName } from "@/lib/exercises";
import { getPoseLandmarker, POSE_CONNECTIONS } from "@/lib/pose";
import { sound } from "@/lib/audio";
import { ProgressRing } from "@/components/ProgressRing";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CameraCoach() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { profile, settings, addWorkout } = useApp();
  const exercise = EXERCISES[exerciseId] || EXERCISES.squats;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const lastTimeRef = useRef(-1);

  // FSM + telemetry refs (avoid stale closures inside rAF)
  const wentActiveRef = useRef(false);
  const repsRef = useRef(0);
  const holdRef = useRef(0);
  const lastFrameRef = useRef(performance.now());
  const soundRef = useRef(settings.sound);
  useEffect(() => { soundRef.current = settings.sound; }, [settings.sound]);

  const [status, setStatus] = useState("idle"); // idle | loading | running | error
  const [errorMsg, setErrorMsg] = useState("");
  const [reps, setReps] = useState(0);
  const [hold, setHold] = useState(0);
  const [phase, setPhase] = useState("READY");
  const [angleVal, setAngleVal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cue, setCue] = useState(exercise.cues.ready);
  const [visible, setVisible] = useState(true);
  const [fps, setFps] = useState(0);
  const [flash, setFlash] = useState(false);

  const isTimed = exercise.type === "timed";

  const drawSkeleton = useCallback((ctx, lm, w, h, ok) => {
    const color = ok ? "#00f3ff" : "#ffb020";
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    POSE_CONNECTIONS.forEach(([a, b]) => {
      const p = lm[a], q = lm[b];
      if (!p || !q) return;
      ctx.beginPath();
      ctx.moveTo(p.x * w, p.y * h);
      ctx.lineTo(q.x * w, q.y * h);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach((i) => {
      const p = lm[i];
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const loop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const now = performance.now();
    const landmarker = await getPoseLandmarker();

    if (video.currentTime !== lastTimeRef.current) {
      lastTimeRef.current = video.currentTime;
      const res = landmarker.detectForVideo(video, now);
      const w = canvas.width, h = canvas.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      const lm = res.landmarks && res.landmarks[0];
      if (lm) {
        const s = evaluatePose(lm, exercise);
        drawSkeleton(ctx, lm, w, h, s.visible);
        setVisible(s.visible);
        setAngleVal(Math.round(s.value));
        setProgress(s.progress);
        setCue(s.cue);

        if (!s.visible) {
          setPhase("PAUSED");
        } else if (isTimed) {
          // accumulate hold time
          const dt = (now - lastFrameRef.current) / 1000;
          holdRef.current += Math.min(dt, 0.2);
          setHold(Math.floor(holdRef.current));
          setPhase("HOLD");
        } else {
          if (s.active && !wentActiveRef.current) {
            wentActiveRef.current = true;
            setPhase(exercise.activeLabel);
            sound.phase(soundRef.current);
          } else if (s.rest && wentActiveRef.current) {
            wentActiveRef.current = false;
            repsRef.current += 1;
            setReps(repsRef.current);
            setPhase(exercise.restLabel);
            sound.rep(soundRef.current);
            setFlash(true);
            setTimeout(() => setFlash(false), 500);
          } else if (!s.active && !s.rest) {
            setPhase("MOVE");
          }
        }
      } else {
        setVisible(false);
        setPhase("PAUSED");
        setCue("Step into frame — no body detected");
      }
      // fps
      const delta = now - lastFrameRef.current;
      if (delta > 0) setFps(Math.round(1000 / delta));
      lastFrameRef.current = now;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [exercise, drawSkeleton, isTimed]);

  const start = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await getPoseLandmarker();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 960, height: 720, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 960;
      canvas.height = video.videoHeight || 720;
      lastFrameRef.current = performance.now();
      setStatus("running");
      toast.success("Camera Coach live", { description: "Position your full body in frame." });
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setStatus("error");
      setErrorMsg(
        e?.name === "NotAllowedError"
          ? "Camera permission denied. Allow access in your browser to use the live coach."
          : "No camera available. Connect a webcam and retry."
      );
    }
  };

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const finish = () => {
    const count = isTimed ? Math.floor(holdRef.current) : repsRef.current;
    stopStream();
    if (count > 0) {
      addWorkout({
        exerciseId: exercise.id,
        name: displayName(exercise, profile),
        type: exercise.type,
        count,
      });
      sound.finish(soundRef.current);
      toast.success("Workout logged to localStorage", {
        description: `${displayName(exercise, profile)} — ${count} ${isTimed ? "sec hold" : "reps"}`,
      });
    } else {
      toast.info("Nothing to log yet — no reps counted.");
    }
    navigate("/");
  };

  useEffect(() => () => stopStream(), [stopStream]);

  return (
    <div>
      <button
        onClick={() => { stopStream(); navigate("/"); }}
        data-testid="coach-back"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#00f3ff] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Command Center
      </button>

      <div className="grid grid-cols-12 gap-5">
        {/* ===== Video stage ===== */}
        <div className="col-span-12 lg:col-span-8">
          <div className="hud-card scanlines relative overflow-hidden aspect-video">
            <video ref={videoRef} playsInline muted className="mirror absolute inset-0 h-full w-full object-cover" />
            <canvas ref={canvasRef} className="mirror absolute inset-0 h-full w-full object-cover pointer-events-none" />

            {/* rep flash */}
            {flash && <div className="absolute inset-0 pointer-events-none flash-good" />}

            {/* idle / loading / error overlays */}
            {status !== "running" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#121212]/92 backdrop-blur-sm text-center px-6">
                {status === "idle" && (
                  <>
                    <div className="h-28 w-28"><ExerciseDemo demo={exercise.demo} /></div>
                    <h2 className="text-3xl font-extrabold uppercase tracking-tight">{displayName(exercise, profile)}</h2>
                    <p className="max-w-md text-sm text-slate-400">
                      The pose model loads once from CDN, then runs fully on-device. No frames ever leave this browser.
                    </p>
                    <Button onClick={start} data-testid="start-camera-button"
                      className="h-12 bg-[#00f3ff] text-black font-bold uppercase tracking-wide hover:bg-[#00f3ff]/85 glow-cyan">
                      <Camera className="mr-1 h-5 w-5" /> Start Camera Coach
                    </Button>
                  </>
                )}
                {status === "loading" && (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-[#00f3ff]" />
                    <p className="font-mono text-sm uppercase tracking-[0.2em] text-[#00f3ff]">Loading pose engine…</p>
                    <p className="text-xs text-slate-500">One-time model download from CDN</p>
                  </>
                )}
                {status === "error" && (
                  <>
                    <CameraOff className="h-10 w-10 text-[#ff3b30]" />
                    <p className="max-w-sm text-sm text-slate-300" data-testid="camera-error">{errorMsg}</p>
                    <Button onClick={start} variant="outline" className="border-[#00f3ff]/40 text-[#00f3ff]">
                      <Play className="mr-1 h-4 w-4" /> Retry
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* live HUD */}
            {status === "running" && (
              <>
                {/* top-left telemetry */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-white/10 bg-[#121212]/85 px-3 py-1.5 backdrop-blur-md">
                  <Gauge className="h-3.5 w-3.5 text-[#00f3ff]" />
                  <span className="font-mono text-[11px] text-slate-300">{fps} FPS</span>
                  <span className="mx-1 h-3 w-px bg-white/15" />
                  <span className="font-mono text-[11px] text-slate-300">{angleVal}&deg;</span>
                </div>

                {/* phase badge */}
                <div className="absolute right-3 top-3">
                  <Badge
                    data-testid="phase-badge"
                    className={`font-mono uppercase tracking-widest border ${
                      phase === "PAUSED"
                        ? "bg-[#ffb020]/15 text-[#ffb020] border-[#ffb020]/40"
                        : "bg-[#00f3ff]/15 text-[#00f3ff] border-[#00f3ff]/40"
                    }`}
                  >
                    {phase}
                  </Badge>
                </div>

                {/* gating warning */}
                {!visible && (
                  <div className="absolute left-1/2 top-16 -translate-x-1/2 flex items-center gap-2 rounded-md border border-[#ffb020]/40 bg-[#121212]/90 px-4 py-2 backdrop-blur-md animate-pulse-ring">
                    <AlertTriangle className="h-4 w-4 text-[#ffb020]" />
                    <span className="text-sm text-[#ffb020]">Step back — get your full body in view</span>
                  </div>
                )}

                {/* big counter bottom-left */}
                <div className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-[#121212]/85 px-4 py-2 backdrop-blur-md">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {isTimed ? "Hold" : "Reps"}
                  </p>
                  <p data-testid="rep-counter-display" className={`font-mono text-5xl font-black tracking-tighter text-[#00f3ff] ${flash ? "animate-rep-pop" : ""}`}>
                    {isTimed ? `${hold}s` : reps}
                  </p>
                </div>

                {/* cue banner bottom-center */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[60%] rounded-md border border-white/10 bg-[#121212]/85 px-4 py-2 text-center backdrop-blur-md">
                  <p data-testid="form-cue" className="text-sm font-semibold text-slate-100">{cue}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== Side panel ===== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="hud-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">Now Training</p>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">{displayName(exercise, profile)}</h1>
            <p className="mt-1 text-sm text-slate-500">{exercise.tagline}</p>
            <div className="mt-4 flex justify-center">
              <ProgressRing value={Math.round(progress * 100)} max={100} size={150} stroke={10}
                color={visible ? "#00f3ff" : "#ffb020"} data-testid="form-ring">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  {isTimed ? "Hold" : "Depth"}
                </span>
                <span className="font-mono text-3xl font-black tracking-tighter text-[#00f3ff]">
                  {isTimed ? `${hold}` : `${Math.round(progress * 100)}%`}
                </span>
                <span className="font-mono text-[10px] text-slate-500">{angleVal}&deg;</span>
              </ProgressRing>
            </div>
          </div>

          <div className="hud-card p-5">
            <h4 className="text-lg font-bold uppercase tracking-tight text-slate-300">Form Guide</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#10b981]" /> {exercise.cues.ready}</li>
              {exercise.cues.mid && <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#10b981]" /> {exercise.cues.mid}</li>}
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#10b981]" /> {exercise.cues.good}</li>
            </ul>
            <div className="mt-4 h-24 flex justify-center opacity-90">
              <ExerciseDemo demo={exercise.demo} />
            </div>
          </div>

          {status === "running" && (
            <Button onClick={finish} data-testid="finish-workout-btn"
              className="h-12 bg-[#10b981] text-black font-bold uppercase tracking-wide hover:bg-[#10b981]/85">
              <Square className="mr-1 h-4 w-4" /> Finish & Log
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
