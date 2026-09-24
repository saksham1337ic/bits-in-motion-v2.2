import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#121212]/80">
      <div className="mx-auto max-w-[1500px] px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600">
          BITS in Motion · On-device AI · No video ever uploaded
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/terms" data-testid="footer-terms-link" className="text-slate-400 hover:text-[#00f3ff] transition-colors">
            Terms &amp; Conditions
          </Link>
          <span className="text-slate-700">·</span>
          <span className="text-slate-600">Not medical advice</span>
        </div>
      </div>
    </footer>
  );
}
