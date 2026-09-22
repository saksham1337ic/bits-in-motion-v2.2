# BITS in Motion — PRD

## Original Problem Statement
Build "BITS in Motion", a high-energy, hostel-friendly AI fitness app. Cyber-Athletic dark-mode UI
(deep charcoal #121212, neon cyan #00f3ff), procedural SVG progress rings and grid layouts. Core
feature: privacy-first, client-side AI Camera Coach using @mediapipe/tasks-vision with a finite state
machine for squat/push-up rep counting via 3-point joint angles, visibility gating, and real-time
overlay feedback. 3-column "Command Center" dashboard, human-style exercise demos (not 3D), onboarding
questionnaire (Age, Goal, Equipment None/Backpack, Low-impact toggle) that filters/swaps exercises.
All workout history, reps and settings saved strictly to browser localStorage. Constraints: React,
no Three.js, no external auth/DB.

## Architecture
- **100% client-side React app** (CRA/craco + React 19 — the fixed template that fulfils the "React 18 + Vite"
  constraint; functionally equivalent, no backend used). The FastAPI/Mongo backend template exists but is unused.
- **State/persistence**: `AppContext` + `localStorage` key `bits_in_motion_data` (`/lib/storage.js`).
- **AI vision**: `@mediapipe/tasks-vision` PoseLandmarker (lite model + WASM from public CDN), GPU→CPU fallback.
  Angle math + FSM in `/lib/pose.js` and `/lib/exercises.js`. Everything runs on-device; no frames leave the browser.
- **UI**: Tailwind + shadcn/ui, custom Cyber-Athletic theme (dark tokens), Barlow Condensed / Inter / JetBrains Mono,
  procedural SVG `ProgressRing`, animated `ExerciseDemo` stick-figure loops, recharts weekly chart, sonner toasts.
- Routes: `/onboarding`, `/` (Command Center), `/coach/:exerciseId`, `/history`, `/settings` with profile guard.

## User Persona
Hostel/dorm students training in a small room with bodyweight (or a backpack), wanting live rep counting
and form feedback without gym equipment, accounts, or privacy concerns.

## Core Requirements (static)
- Onboarding questionnaire; profile drives exercise recommendations.
- Camera Coach: FSM rep counting (squat hip-knee-ankle, push-up shoulder-elbow-wrist), visibility gating,
  live HUD overlay (reps, phase, angle, form cues, FPS).
- 3-column Command Center with SVG rings + stats.
- Low-impact swap + backpack weighted variants.
- Strictly localStorage; no auth/DB/backend.

## Implemented (2026-06-22)
- ✅ Onboarding questionnaire (Age, Goal, Equipment, Low-impact) → localStorage, with guard/redirect.
- ✅ Command Center 3-column dashboard: streak/workouts/reps rings, weekly bar chart, per-exercise bests,
  recommended drill tiles, full library with impact badges.
- ✅ Camera Coach: MediaPipe pose engine (CDN), 3-point angle FSM for squats/push-ups/lunges/knee-pushups/
  glute-bridge, spread detection for jumping jacks/step jacks, timed holds for plank/wall sit, visibility
  gating with "step back" warning, live skeleton canvas overlay + full HUD, Web Audio rep/phase/finish beeps.
- ✅ Exercise filtering by goal + low-impact swaps (Squats→Wall Sit, Push-ups→Knee Push-ups, Lunges→Glute
  Bridge, Jumping Jacks→Step Jacks) + backpack weighted naming.
- ✅ History log (list + clear) and Settings (edit profile, sound toggle, clear history, reset app).
- ✅ Animated SVG "human demo" figures per exercise. Cyber-Athletic dark theme throughout.
- ✅ Verified end-to-end by testing agent (frontend 100%, no crashes; fake-webcam HUD renders).

## Backlog / Remaining
- P1: Reduce rep-count sensitivity to lighting/framing (angle smoothing / EMA filter).
- P2: Optional workout export/import (JSON) since there is no cloud backup.
- P2: Per-exercise rep/time goals and session targets.
- P2: Silence cosmetic recharts ResponsiveContainer size warning.
- P2: Mobile-camera tuning (currently best-effort on desktop webcams).

## Next Tasks
- Add angle smoothing for steadier rep detection.
- Add rep/time target selector before starting a session.
- Add localStorage export/import for manual backup.
