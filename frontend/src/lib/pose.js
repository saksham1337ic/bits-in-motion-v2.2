import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let landmarkerPromise = null;

export async function getPoseLandmarker() {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
    const build = (delegate) =>
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    try {
      return await build("GPU");
    } catch (e) {
      return await build("CPU");
    }
  })();
  return landmarkerPromise;
}

// Landmark indices
export const LM = {
  NOSE: 0,
  LSH: 11, RSH: 12,
  LEL: 13, REL: 14,
  LWR: 15, RWR: 16,
  LHIP: 23, RHIP: 24,
  LKNEE: 25, RKNEE: 26,
  LANK: 27, RANK: 28,
};

export const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

// 3-point angle at vertex b, in degrees
export function angle(a, b, c) {
  if (!a || !b || !c) return 180;
  const abx = a.x - b.x, aby = a.y - b.y;
  const cbx = c.x - b.x, cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (!mag) return 180;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
