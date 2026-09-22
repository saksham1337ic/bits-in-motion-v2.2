import React from "react";

// Procedural SVG progress ring with neon-cyan glow.
export function ProgressRing({
  value = 0,
  max = 100,
  size = 128,
  stroke = 9,
  color = "#00f3ff",
  track = "rgba(255,255,255,0.07)",
  children,
  ticks = true,
  "data-testid": testId,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const offset = c * (1 - pct);
  const cx = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      data-testid={testId}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {ticks &&
          Array.from({ length: 40 }).map((_, i) => {
            const a = (i / 40) * Math.PI * 2;
            const inner = r + stroke / 2 + 3;
            const outer = inner + (i % 5 === 0 ? 5 : 2.5);
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * inner}
                y1={cx + Math.sin(a) * inner}
                x2={cx + Math.cos(a) * outer}
                y2={cx + Math.sin(a) * outer}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
              />
            );
          })}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 3px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
