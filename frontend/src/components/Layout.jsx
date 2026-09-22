import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Activity, LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/context/AppContext";

const links = [
  { to: "/", label: "Command Center", icon: LayoutDashboard, end: true, testid: "nav-dashboard" },
  { to: "/history", label: "History", icon: HistoryIcon, testid: "nav-history" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
];

export function Layout({ children }) {
  const { settings, setSetting } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid-bg text-slate-100">
      <div className="radial-glow min-h-screen">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/85 backdrop-blur-md">
          <div className="mx-auto max-w-[1500px] px-5 h-16 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/")}
              data-testid="brand-logo"
              className="flex items-center gap-2.5 group"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#00f3ff]/50 bg-[#00f3ff]/10 glow-cyan">
                <Activity className="h-5 w-5 text-[#00f3ff]" />
              </span>
              <span className="leading-none">
                <span className="block text-xl font-black uppercase tracking-tight text-glow" style={{ fontFamily: "Barlow Condensed" }}>
                  BITS <span className="text-[#00f3ff]">in Motion</span>
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  AI Camera Coach
                </span>
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  data-testid={l.testid}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#00f3ff]/10 text-[#00f3ff]"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    }`
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={() => setSetting("sound", !settings.sound)}
              data-testid="sound-toggle"
              title={settings.sound ? "Mute cues" : "Unmute cues"}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 hover:text-[#00f3ff] hover:border-[#00f3ff]/40 transition-colors"
            >
              {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* mobile nav */}
          <nav className="md:hidden flex items-center justify-around border-t border-white/10 px-2 py-1.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-[11px] ${
                    isActive ? "text-[#00f3ff]" : "text-slate-400"
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label.split(" ")[0]}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 sm:px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
