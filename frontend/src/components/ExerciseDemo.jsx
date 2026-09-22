import React, { useEffect, useRef, useState } from "react";

// Two-frame stick-figure keyframes. Coordinates in a 120x130 viewBox.
// Interpolated with an eased sine to create a smooth human-like loop.
const POSES = {
  squat: {
    up: {
      head: [60, 18], shoulder: [60, 33], hip: [60, 68],
      lElbow: [49, 47], lHand: [47, 62], rElbow: [71, 47], rHand: [73, 62],
      lKnee: [52, 92], lAnkle: [50, 120], rKnee: [68, 92], rAnkle: [70, 120],
    },
    down: {
      head: [60, 33], shoulder: [60, 47], hip: [60, 82],
      lElbow: [45, 55], lHand: [51, 44], rElbow: [75, 55], rHand: [69, 44],
      lKnee: [43, 88], lAnkle: [50, 120], rKnee: [77, 88], rAnkle: [70, 120],
    },
  },
  pushup: {
    up: {
      head: [26, 54], shoulder: [42, 60], hip: [76, 66],
      lElbow: [44, 78], lHand: [46, 96], rElbow: [44, 78], rHand: [46, 96],
      lKnee: [94, 72], lAnkle: [110, 76], rKnee: [94, 72], rAnkle: [110, 76],
    },
    down: {
      head: [26, 66], shoulder: [42, 72], hip: [76, 74],
      lElbow: [36, 82], lHand: [46, 96], rElbow: [36, 82], rHand: [46, 96],
      lKnee: [94, 78], lAnkle: [110, 80], rKnee: [94, 78], rAnkle: [110, 80],
    },
  },
  lunge: {
    up: {
      head: [58, 20], shoulder: [58, 34], hip: [58, 68],
      lElbow: [49, 48], lHand: [48, 62], rElbow: [67, 48], rHand: [68, 62],
      lKnee: [52, 92], lAnkle: [50, 120], rKnee: [64, 92], rAnkle: [66, 120],
    },
    down: {
      head: [56, 30], shoulder: [56, 44], hip: [56, 74],
      lElbow: [47, 58], lHand: [46, 72], rElbow: [65, 58], rHand: [66, 72],
      lKnee: [82, 92], lAnkle: [86, 120], rKnee: [38, 100], rAnkle: [34, 120],
    },
  },
  jack: {
    up: {
      head: [60, 18], shoulder: [60, 33], hip: [60, 72],
      lElbow: [53, 50], lHand: [51, 66], rElbow: [67, 50], rHand: [69, 66],
      lKnee: [57, 94], lAnkle: [57, 120], rKnee: [63, 94], rAnkle: [63, 120],
    },
    down: {
      head: [60, 18], shoulder: [60, 33], hip: [60, 70],
      lElbow: [40, 24], lHand: [30, 12], rElbow: [80, 24], rHand: [90, 12],
      lKnee: [46, 94], lAnkle: [38, 120], rKnee: [74, 94], rAnkle: [82, 120],
    },
  },
  plank: {
    up: {
      head: [26, 56], shoulder: [42, 62], hip: [76, 66],
      lElbow: [40, 78], lHand: [42, 96], rElbow: [40, 78], rHand: [42, 96],
      lKnee: [94, 70], lAnkle: [110, 74], rKnee: [94, 70], rAnkle: [110, 74],
    },
    down: {
      head: [26, 58], shoulder: [42, 64], hip: [76, 68],
      lElbow: [40, 80], lHand: [42, 96], rElbow: [40, 80], rHand: [42, 96],
      lKnee: [94, 72], lAnkle: [110, 76], rKnee: [94, 72], rAnkle: [110, 76],
    },
  },
  bridge: {
    up: {
      head: [18, 92], shoulder: [32, 90], hip: [62, 64],
      lElbow: [40, 98], lHand: [26, 100], rElbow: [40, 98], rHand: [26, 100],
      lKnee: [84, 70], lAnkle: [90, 100], rKnee: [84, 70], rAnkle: [90, 100],
    },
    down: {
      head: [18, 92], shoulder: [32, 90], hip: [62, 88],
      lElbow: [40, 98], lHand: [26, 100], rElbow: [40, 98], rHand: [26, 100],
      lKnee: [84, 76], lAnkle: [90, 100], rKnee: [84, 76], rAnkle: [90, 100],
    },
  },
};

const SEGMENTS = [
  ["shoulder", "hip"],
  ["shoulder", "lElbow"], ["lElbow", "lHand"],
  ["shoulder", "rElbow"], ["rElbow", "rHand"],
  ["hip", "lKnee"], ["lKnee", "lAnkle"],
  ["hip", "rKnee"], ["rKnee", "rAnkle"],
];

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPt = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

export function ExerciseDemo({ demo = "squat", speed = 1.6, size = "100%", color = "#00f3ff" }) {
  const pose = POSES[demo] || POSES.squat;
  const [t, setT] = useState(0);
  const raf = useRef();
  const start = useRef(performance.now());

  useEffect(() => {
    const loop = (now) => {
      const elapsed = (now - start.current) / 1000;
      const phase = (Math.sin(elapsed * speed) + 1) / 2; // 0..1 eased
      setT(phase);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [speed]);

  const frame = {};
  Object.keys(pose.up).forEach((k) => {
    frame[k] = lerpPt(pose.up[k], pose.down[k], t);
  });

  return (
    <svg viewBox="0 0 120 130" width={size} height={size} style={{ display: "block" }}>
      <ellipse cx="60" cy="126" rx="34" ry="3.5" fill="rgba(0,243,255,0.12)" />
      <g
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      >
        {SEGMENTS.map(([a, b], i) => (
          <line key={i} x1={frame[a][0]} y1={frame[a][1]} x2={frame[b][0]} y2={frame[b][1]} />
        ))}
        <circle cx={frame.head[0]} cy={frame.head[1]} r="8" fill="#121212" />
      </g>
      {["shoulder", "hip", "lElbow", "rElbow", "lKnee", "rKnee"].map((k) => (
        <circle key={k} cx={frame[k][0]} cy={frame[k][1]} r="2.4" fill="#fff" />
      ))}
    </svg>
  );
}
