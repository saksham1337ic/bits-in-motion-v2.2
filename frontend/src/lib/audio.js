let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}

function beep(freq, duration, type = "sine", gainVal = 0.08) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainVal, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sound = {
  rep(enabled) {
    if (!enabled) return;
    beep(880, 0.14, "triangle", 0.12);
    setTimeout(() => beep(1320, 0.12, "triangle", 0.1), 60);
  },
  phase(enabled) {
    if (!enabled) return;
    beep(420, 0.06, "sine", 0.05);
  },
  finish(enabled) {
    if (!enabled) return;
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle", 0.1), i * 110));
  },
};
