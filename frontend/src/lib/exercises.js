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

const kneeCues = { ready: "Stand tall, brace your core", mid: "Sink lower — hit depth!", good: "Great depth! Drive up 🔥" };
const elbowCues = { ready: "Plank tight, hands set", mid: "Lower your chest to the floor!", good: "Clean rep! Lock it out 💪" };
const hipCues = { ready: "Set your base, brace up", mid: "Drive those hips higher!", good: "Squeeze glutes at the top!" };
const hingeCues = { ready: "Soft knees, flat back", mid: "Hinge back at the hips!", good: "Stand tall — squeeze glutes" };
const spreadCues = { ready: "Feet together, arms down", mid: "Open wide — arms overhead!", good: "Full spread! Snap back" };
const timedCues = { ready: "Get into position", good: "Hold it — stay tight!" };

// helper builders
const A = (o) => ({ type: "angle", activeLabel: "DOWN", restLabel: "UP", ...o });
const T = (o) => ({ type: "timed", ...o });
const S = (o) => ({ type: "spread", activeLabel: "OPEN", restLabel: "CLOSED", openRatio: 1.7, closeRatio: 1.15, ...o });

export const EXERCISES = {
  // ---------- Bodyweight primaries ----------
  squats: A({ id: "squats", name: "Squats", metric: "knee", restHigh: true, up: 160, down: 95, impact: "moderate", goals: ["strength", "fatburn"], demo: "squat", gear: "none", lowImpactSwap: "wallsit", tagline: "Hip · Knee · Ankle drive", cues: kneeCues }),
  pushups: A({ id: "pushups", name: "Push-ups", metric: "elbow", restHigh: true, up: 155, down: 85, restLabel: "LOCK", impact: "low", goals: ["strength", "endurance"], demo: "pushup", gear: "none", lowImpactSwap: "kneepushups", tagline: "Shoulder · Elbow · Wrist", cues: elbowCues }),
  lunges: A({ id: "lunges", name: "Lunges", metric: "knee", restHigh: true, up: 160, down: 100, impact: "moderate", goals: ["strength", "mobility"], demo: "lunge", gear: "none", lowImpactSwap: "glutebridge", tagline: "Front-knee tracking", cues: kneeCues }),
  jumpingjacks: S({ id: "jumpingjacks", name: "Jumping Jacks", impact: "high", goals: ["fatburn", "endurance"], demo: "jack", gear: "none", lowImpactSwap: "stepjacks", tagline: "Limb-spread cardio", cues: spreadCues }),
  plank: T({ id: "plank", name: "Plank", metric: "hip", impact: "low", goals: ["mobility", "endurance"], demo: "plank", gear: "none", tagline: "Timed isometric hold", cues: timedCues }),
  jumpsquats: A({ id: "jumpsquats", name: "Jump Squats", metric: "knee", restHigh: true, up: 160, down: 95, impact: "high", goals: ["fatburn", "strength"], demo: "squat", gear: "none", lowImpactSwap: "squats", tagline: "Explosive lower body", cues: kneeCues }),
  pikepushups: A({ id: "pikepushups", name: "Pike Push-ups", metric: "elbow", restHigh: true, up: 155, down: 90, restLabel: "LOCK", impact: "low", goals: ["strength"], demo: "pushup", gear: "none", lowImpactSwap: "kneepushups", tagline: "Shoulder-press pattern", cues: elbowCues }),
  tricepdips: A({ id: "tricepdips", name: "Tricep Dips", metric: "elbow", restHigh: true, up: 160, down: 90, restLabel: "LOCK", impact: "low", goals: ["strength", "endurance"], demo: "pushup", gear: "none", tagline: "Triceps · Elbow drive", cues: elbowCues }),
  glutebridge: A({ id: "glutebridge", name: "Glute Bridge", metric: "hip", restHigh: false, up: 165, down: 120, activeLabel: "UP", restLabel: "DOWN", impact: "low", goals: ["mobility", "strength"], demo: "bridge", gear: "none", tagline: "Hip extension drive", cues: hipCues }),
  hipthrust: A({ id: "hipthrust", name: "Hip Thrust", metric: "hip", restHigh: false, up: 170, down: 120, activeLabel: "UP", restLabel: "DOWN", impact: "low", goals: ["strength", "mobility"], demo: "bridge", gear: "none", tagline: "Glute power hinge", cues: hipCues }),
  sidelunge: A({ id: "sidelunge", name: "Side Lunges", metric: "knee", restHigh: true, up: 160, down: 105, impact: "moderate", goals: ["mobility", "fatburn"], demo: "lunge", gear: "none", lowImpactSwap: "glutebridge", tagline: "Lateral hip mobility", cues: kneeCues }),
  goodmorning: A({ id: "goodmorning", name: "Good Mornings", metric: "hip", restHigh: true, up: 165, down: 110, impact: "low", goals: ["mobility", "strength"], demo: "bridge", gear: "none", tagline: "Posterior-chain hinge", cues: hingeCues }),
  sealjacks: S({ id: "sealjacks", name: "Seal Jacks", impact: "high", goals: ["fatburn"], demo: "jack", gear: "none", lowImpactSwap: "stepjacks", tagline: "Clap-front cardio", cues: spreadCues }),
  superman: T({ id: "superman", name: "Superman Hold", metric: "hip", impact: "low", goals: ["mobility"], demo: "bridge", gear: "none", tagline: "Lower-back timed hold", cues: timedCues }),
  birddog: T({ id: "birddog", name: "Bird-Dog Hold", metric: "hip", impact: "low", goals: ["mobility", "endurance"], demo: "plank", gear: "none", tagline: "Anti-rotation stability", cues: timedCues }),
  highknees: T({ id: "highknees", name: "High Knees", metric: "knee", impact: "high", goals: ["fatburn", "endurance"], demo: "jack", gear: "none", lowImpactSwap: "marching", tagline: "For-time cardio drive", cues: timedCues }),
  mountainclimbers: T({ id: "mountainclimbers", name: "Mountain Climbers", metric: "hip", impact: "moderate", goals: ["fatburn", "endurance"], demo: "plank", gear: "none", lowImpactSwap: "birddog", tagline: "For-time core cardio", cues: timedCues }),
  burpees: T({ id: "burpees", name: "Burpees", metric: "knee", impact: "high", goals: ["fatburn"], demo: "squat", gear: "none", lowImpactSwap: "squatthrusthold", tagline: "Full-body for-time", cues: timedCues }),
  calfraises: T({ id: "calfraises", name: "Calf Raises", metric: "knee", impact: "low", goals: ["endurance", "strength"], demo: "squat", gear: "none", tagline: "Timed calf endurance", cues: timedCues }),

  // ---------- Backpack-weighted variants (gear: backpack) ----------
  backpacksquats: A({ id: "backpacksquats", name: "Backpack Squats", metric: "knee", restHigh: true, up: 160, down: 95, impact: "moderate", goals: ["strength", "fatburn"], demo: "squat", gear: "backpack", lowImpactSwap: "wallsit", tagline: "Loaded squat pattern", cues: kneeCues }),
  backpacklunges: A({ id: "backpacklunges", name: "Backpack Lunges", metric: "knee", restHigh: true, up: 160, down: 100, impact: "moderate", goals: ["strength", "mobility"], demo: "lunge", gear: "backpack", lowImpactSwap: "glutebridge", tagline: "Loaded split stance", cues: kneeCues }),
  backpackpushups: A({ id: "backpackpushups", name: "Backpack Push-ups", metric: "elbow", restHigh: true, up: 155, down: 85, restLabel: "LOCK", impact: "low", goals: ["strength"], demo: "pushup", gear: "backpack", tagline: "Weighted press", cues: elbowCues }),
  backpackhipthrust: A({ id: "backpackhipthrust", name: "Backpack Hip Thrust", metric: "hip", restHigh: false, up: 170, down: 120, activeLabel: "UP", restLabel: "DOWN", impact: "low", goals: ["strength", "mobility"], demo: "bridge", gear: "backpack", tagline: "Loaded glute drive", cues: hipCues }),
  backpackgoodmorning: A({ id: "backpackgoodmorning", name: "Backpack Good Mornings", metric: "hip", restHigh: true, up: 165, down: 110, impact: "low", goals: ["mobility", "strength"], demo: "bridge", gear: "backpack", tagline: "Loaded hinge", cues: hingeCues }),
  backpackcalfraise: T({ id: "backpackcalfraise", name: "Backpack Calf Raises", metric: "knee", impact: "low", goals: ["strength"], demo: "squat", gear: "backpack", tagline: "Loaded calf endurance", cues: timedCues }),

  // ---------- Low-impact swap-only variants (hidden from base library) ----------
  wallsit: T({ id: "wallsit", name: "Wall Sit", metric: "knee", impact: "low", goals: ["endurance", "mobility"], demo: "squat", gear: "none", swapOnly: true, variant: true, tagline: "Timed quad hold", cues: timedCues }),
  kneepushups: A({ id: "kneepushups", name: "Knee Push-ups", metric: "elbow", restHigh: true, up: 155, down: 90, restLabel: "LOCK", impact: "low", goals: ["strength", "endurance"], demo: "pushup", gear: "none", swapOnly: true, variant: true, tagline: "Scaled press", cues: elbowCues }),
  stepjacks: S({ id: "stepjacks", name: "Step Jacks", impact: "low", openRatio: 1.6, goals: ["fatburn", "endurance"], demo: "jack", gear: "none", swapOnly: true, variant: true, tagline: "Quiet-mode cardio", cues: spreadCues }),
  marching: T({ id: "marching", name: "Marching In Place", metric: "knee", impact: "low", goals: ["fatburn", "endurance"], demo: "jack", gear: "none", swapOnly: true, variant: true, tagline: "Quiet timed cardio", cues: timedCues }),
  squatthrusthold: T({ id: "squatthrusthold", name: "Squat-Thrust Hold", metric: "knee", impact: "low", goals: ["fatburn"], demo: "squat", gear: "none", swapOnly: true, variant: true, tagline: "No-jump conditioning", cues: timedCues }),
};

export function recommendedExercises(profile, limit = 6) {
  const all = Object.values(EXERCISES);
  if (!profile) return all.filter((e) => e.gear === "none" && !e.swapOnly).slice(0, limit);
  const goal = profile.goal;
  const backpack = profile.equipment === "backpack";
  let list = all.filter(
    (e) =>
      !e.swapOnly &&
      e.goals.includes(goal) &&
      (e.gear === "none" || (e.gear === "backpack" && backpack))
  );
  if (backpack) {
    // Interleave backpack-first so weighted variants always surface in the top slots.
    const bp = list.filter((e) => e.gear === "backpack");
    const bw = list.filter((e) => e.gear === "none");
    const inter = [];
    const n = Math.max(bp.length, bw.length);
    for (let i = 0; i < n; i++) {
      if (bp[i]) inter.push(bp[i]);
      if (bw[i]) inter.push(bw[i]);
    }
    list = inter;
  }
  if (profile.lowImpact) {
    list = list.map((e) => (e.lowImpactSwap ? EXERCISES[e.lowImpactSwap] : e));
  }
  const seen = new Set();
  list = list.filter((e) => !seen.has(e.id) && seen.add(e.id));
  return list.slice(0, limit);
}

export function libraryExercises() {
  return Object.values(EXERCISES).filter((e) => !e.swapOnly);
}

export function displayName(ex) {
  return ex?.name || "";
}

const V_THRESH = 0.5;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const IDX = {
  knee: { L: [23, 25, 27], R: [24, 26, 28] },
  elbow: { L: [11, 13, 15], R: [12, 14, 16] },
  hip: { L: [11, 23, 25], R: [12, 24, 26] },
};
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const jointAngle = (lm, [a, b, c]) => angle(lm[a], lm[b], lm[c]);
const visible = (lm, idxs) => idxs.every((i) => (lm[i]?.visibility ?? 0) > V_THRESH);

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
