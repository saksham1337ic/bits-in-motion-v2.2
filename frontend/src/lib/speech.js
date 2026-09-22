// Spoken coach via the browser Web Speech API (SpeechSynthesis).
// Fully on-device, no external service.
const supported = typeof window !== "undefined" && "speechSynthesis" in window;

export const speech = {
  supported,
  speak(text, { priority = false } = {}) {
    if (!supported) return;
    try {
      if (priority) window.speechSynthesis.cancel();
      // Skip if a queue is already backed up (avoid lag on fast reps)
      if (!priority && window.speechSynthesis.speaking && window.speechSynthesis.pending) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.08;
      u.pitch = 1.0;
      u.volume = 1.0;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  },
  cancel() {
    if (supported) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  },
};
