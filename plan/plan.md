# BITS in Motion — Build Plan

A high-energy, hostel-friendly AI fitness app that uses your webcam to watch your form and
count reps in real time. Everything runs privately in your browser — no sign-in, no server,
no camera footage ever leaves your device. Your profile, settings, and full workout history
are stored locally in the browser.

## Look & feel
- "Cyber-Athletic" dark mode: deep charcoal background (#121212) with neon cyan (#00f3ff) accents.
- Grid-based "Command Center" layouts, glowing SVG progress rings, subtle motion and hover effects.
- Motivational, energetic tone for all coaching cues ("Go lower!", "Nice rep!", "Lock it in!").

## Screens & flow

### 1. Onboarding (first launch)
A quick questionnaire captured once and saved to the browser:
- Age
- Goal (Strength / Endurance / Fat Burn / Mobility)
- Equipment (None / Backpack — backpack unlocks weighted variants)
- "Low-impact" toggle

This drives which exercises are shown and how they're swapped (see below). It can be re-edited
anytime from Settings.

### 2. Command Center (dashboard) — 3-column layout
Rich stats view:
- Streak, total workouts, and total reps shown as glowing progress rings.
- Per-exercise breakdown (best reps, total reps).
- Weekly activity chart.
- Personal bests and goal progress.
- Quick-start tiles for each recommended exercise (filtered to the user's profile).

### 3. Camera Coach (the core AI feature)
- Turns on the webcam and tracks your body live, entirely on-device.
- Counts reps using a form state machine (e.g. Standing → Down → Standing) driven by
  3-point joint angles (hip–knee–ankle for squats, shoulder–elbow–wrist for push-ups).
- Pauses counting automatically when your body isn't fully in frame, and prompts you to
  reposition ("Step back — get your full body in view").
- Real-time overlay on the video: current rep count, a live form/angle indicator, the current
  phase, and coaching cues.
- Each session's reps are saved to history when you finish.

### 4. History
Chronological log of every session (exercise, reps, date/time), with the option to clear it.

### 5. Settings
Edit the onboarding profile anytime, toggle low-impact on/off, and manage stored data
(clear history / reset app).

## Exercises & logic

Launch library (a focused set, each with a low-impact alternative and a backpack-weighted variant):

| Exercise | Live rep counting | High-impact? | Low-impact swap |
|---|---|---|---|
| Squats | Yes (hip-knee-ankle) | Moderate | Wall Sit (timed hold) |
| Push-ups | Yes (shoulder-elbow-wrist) | No | Knee Push-ups |
| Lunges | Yes (hip-knee-ankle) | Moderate | Glute Bridge |
| Jumping Jacks | Yes (limb spread) | High | Step Jacks |
| Plank | Timed hold | No | (already low-impact) |

Selection logic:
- Exercises are filtered by the chosen **Goal** (e.g. Strength favors squats/push-ups/lunges;
  Fat Burn favors jumping jacks; Mobility favors lunges/glute bridge/plank).
- If **Low-impact** is on, every high-impact exercise is automatically swapped for its
  low-impact alternative in recommendations and quick-start tiles.
- If **Equipment = Backpack**, weighted variants (e.g. "Backpack Squats") are surfaced.

## Assumptions
- The pose/rep-counting model is loaded in the browser from a public CDN on first use; a short
  one-time loading step is expected before the camera starts.
- Exercise demos are shown as clean animated illustrations (looping SVG-style motion), not
  real human video clips.
- Rep-counting accuracy depends on lighting and camera framing; the coach guides the user to
  position correctly but is not medically precise.
- No accounts and no cloud backup — clearing browser data erases history (a manual export is
  out of scope unless requested).
- Works best on a desktop/laptop webcam; mobile support is best-effort.

## Out of scope (for now)
- Social features, leaderboards, or sharing.
- Cloud sync, user accounts, or multi-device history.
- Custom/user-added exercises.
