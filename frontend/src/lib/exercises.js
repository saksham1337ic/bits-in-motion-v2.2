import { angle, dist } from "@/lib/pose";

export const GOALS = [
  { id: "strength", label: "Hostel Room Hypertrophy", short: "Strength" },
  { id: "endurance", label: "Endurance & Exam Stamina", short: "Endurance" },
  { id: "fatburn", label: "Fat Burn & Agility", short: "Fat Burn" },
  { id: "mobility", label: "Joint Longevity & Posture", short: "Mobility" },
];

export const EQUIPMENT = [
  { id: "none", label: "Pure Bodyweight (Zero Gear)" },
  { id: "backpack", label: "Heavy Backpack / Water Bottles" },
];

const IDX = {
  knee: { L: [23, 25, 27], R: [24, 26, 28] },
  elbow: { L: [11, 13, 15], R: [12, 14, 16] },
  hip: { L: [11, 23, 25], R: [12, 24, 26] },
};

const V_THRESH = 0.5;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const EXERCISES = {
  squats: {
    id: "squats", name: "Squats", type: "angle", metric: "knee",
    restHigh: true, up: 160, down: 95, impact: "moderate",
    goals: ["strength", "fatburn"], demo: "squat",
    activeLabel: "DOWN", restLabel: "UP", weighted: true,
    tagline: "Hip · Knee · Ankle drive", lowImpactSwap: "wallsit",
    cues: { ready: "Stand tall, feet shoulder-width", mid: "Go lower — sink to parallel!", good: "Locked depth! Power up 🔥" },
  },
  pushups: {
    id: "pushups", name: "Push-ups", type: "angle", metric: "elbow",
    restHigh: true, up: 155, down: 85, impact: "low",
    goals: ["strength", "endurance"], demo: "pushup",
    activeLabel: "DOWN", restLabel: "LOCK", weighted: false,
    tagline: "Shoulder · Elbow · Wrist", lowImpactSwap: "kneepushups",
    cues: { ready: "Plank tight, hands under shoulders", mid: "Lower your chest to the floor!", good: "Clean rep! Core braced 💪" },
  },
  lunges: {
    id: "lunges", name: "Lunges", type: "angle", metric: "knee",
    restHigh: true, up: 160, down: 100, impact: "moderate",
    goals: ["strength", "mobility"], demo: "lunge",
    activeLabel: "DOWN", restLabel: "UP", weighted: true,
    tagline: "Front-knee tracking", lowImpactSwap: "glutebridge",
    cues: { ready: "Big step forward, torso upright", mid: "Drop that back knee down!", good: "Nice rep! Drive through the heel" },
  },
  jumpingjacks: {
    id: "jumpingjacks", name: "Jumping Jacks", type: "spread",
    openRatio: 1.7, closeRatio: 1.15, impact: "high",
    goals: ["fatburn", "endurance"], demo: "jack",
    activeLabel: "OPEN", restLabel: "CLOSED", weighted: false,
    tagline: "Limb-spread cardio", lowImpactSwap: "stepjacks",
    cues: { ready: "Feet together, arms down", mid: "Jump wide — arms overhead!", good: "Full spread! Snap back" },
  },
  plank: {
    id: "plank", name: "Plank", type: "timed", metric: "hip", impact: "low",
    goals: ["mobility", "endurance"], demo: "plank",
    weighted: false, tagline: "Timed isometric hold",
    lowImpactSwap: null,
    cues: { ready: "Forearms down, body straight", good: "Hold it — straight line, core tight!" },
  },
  // ---- Low-impact / alternate variants ----
  wallsit: {
    id: "wallsit", name: "Wall Sit", type: "timed", metric: "knee", impact: "low",
    goals: ["endurance", "mobility"], demo: "squat", variant: true,
    weighted: false, tagline: "Timed quad burn hold",
    cues: { ready: "Back on wall, thighs parallel", good: "Hold parallel — 90° knees!" },
  },
  kneepushups: {
    id: "kneepushups", name: "Knee Push-ups", type: "angle", metric: "elbow",
    restHigh: true, up: 155, down: 90, impact: "low", variant: true,
    goals: ["strength", "endurance"], demo: "pushup",
    activeLabel: "DOWN", restLabel: "LOCK", weighted: false,
    tagline: "Shoulder · Elbow · Wrist",
    cues: { ready: "Knees down, hips in line", mid: "Lower chest closer!", good: "Solid rep! Controlled" },
  },
  glutebridge: {
    id: "glutebridge", name: "Glute Bridge", type: "angle", metric: "hip",
    restHigh: false, up: 165, down: 120, impact: "low", variant: true,
    goals: ["mobility", "strength"], demo: "bridge",
    activeLabel: "UP", restLabel: "DOWN", weighted: false,
    tagline: "Hip extension drive",
    cues: { ready: "On your back, knees bent", mid: "Drive hips higher!", good: "Squeeze glutes at the top" },
  },
  stepjacks: {
    id: "stepjacks", name: "Step Jacks", type: "spread",
    openRatio: 1.6, closeRatio: 1.15, impact: "low", variant: true,
    goals: ["fatburn", "endurance"], demo: "jack",
    activeLabel: "OPEN", restLabel: "CLOSED", weighted: false,
    tagline: "Quiet-mode step cardio",
    cues: { ready: "Feet together, arms down", mid: "Step out wide, arms overhead!", good: "Wide & controlled — no jump" },
  },
};

// Main library exercises (before filtering)
const MAIN = ["squats", "pushups", "lunges", "jumpingjacks", "plank"];

export function recommendedExercises(profile) {
  if (!profile) return MAIN.map((id) => EXERCISES[id]);
  let ids = MAIN.filter((id) => EXERCISES[id].goals.includes(profile.goal));
  if (ids.length === 0) ids = [...MAIN];
  if (profile.lowImpact) {
    ids = ids.map((id) => EXERCISES[id].lowImpactSwap || id);
  }
  // dedupe preserving order
  const seen = new Set();
  return ids.filter((id) => !seen.has(id) && seen.add(id)).map((id) => EXERCISES[id]);
}

export function displayName(ex, profile) {
  if (profile?.equipment === "backpack" && ex.weighted) return `Backpack ${ex.name}`;
  return ex.name;
}

const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const jointAngle = (lm, [a, b, c]) => angle(lm[a], lm[b], lm[c]);
const visible = (lm, idxs) => idxs.every((i) => (lm[i]?.visibility ?? 0) > V_THRESH);

// Evaluate a frame of landmarks for a given exercise.
// Returns { visible, value, progress, active, rest, cue }
export function evaluatePose(lm, ex) {
  if (!lm) return { visible: false, value: 0, progress: 0, active: false, rest: false, cue: "" };

  if (ex.type === "spread") {
    const need = [11, 12, 15, 16, 27, 28];
    const vis = need.every((i) => (lm[i]?.visibility ?? 0) > V_THRESH);
    if (!vis) return { visible: false, value: 0, progress: 0, active: false, rest: false, cue: ex.cues.ready };
    const shoulderW = dist(lm[11], lm[12]) || 0.001;
    const ratio = dist(lm[27], lm[28]) / shoulderW;
    const handsUp = lm[15].y < lm[11].y && lm[16].y < lm[12].y;
    const active = ratio > ex.openRatio && handsUp;
    const rest = ratio < ex.closeRatio && !handsUp;
    const progress = clamp01((ratio - ex.closeRatio) / (ex.openRatio - ex.closeRatio));
    const cue = active ? ex.cues.good : progress > 0.4 ? ex.cues.mid : ex.cues.ready;
    return { visible: true, value: ratio, progress, active, rest, cue };
  }

  // angle-based (also used for timed metric read-out)
  const m = IDX[ex.metric] || IDX.knee;
  const lOK = visible(lm, m.L);
  const rOK = visible(lm, m.R);
  const angles = [];
  if (lOK) angles.push(jointAngle(lm, m.L));
  if (rOK) angles.push(jointAngle(lm, m.R));
  const vis = angles.length > 0;
  if (!vis) return { visible: false, value: 0, progress: 0, active: false, rest: false, cue: ex.cues.ready };
  const value = avg(angles);

  if (ex.type === "timed") {
    return { visible: true, value, progress: 0, active: false, rest: false, cue: ex.cues.good };
  }

  const active = ex.restHigh ? value < ex.down : value > ex.up;
  const rest = ex.restHigh ? value > ex.up : value < ex.down;
  const progress = ex.restHigh
    ? clamp01((ex.up - value) / (ex.up - ex.down))
    : clamp01((value - ex.down) / (ex.up - ex.down));
  const cue = active ? ex.cues.good : progress > 0.45 ? ex.cues.mid : ex.cues.ready;
  return { visible: true, value, progress, active, rest, cue };
}
