import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity, LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon,
  Utensils, Volume2, VolumeX, LogOut, UserCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Footer } from "@/components/Footer";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/app", label: "Command Center", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/fuel", label: "Fuel", icon: Utensils, testid: "nav-fuel" },
  { to: "/history", label: "History", icon: HistoryIcon, testid: "nav-history" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
];

export function Layout({ children }) {
  const { settings, setSetting, mode, user, logout } = useApp();
  const navigate = useNavigate();

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen grid-bg text-slate-100 flex flex-col">
      <div className="radial-glow flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/85 backdrop-blur-md">
          <div className="mx-auto max-w-[1500px] px-5 h-16 flex items-center justify-between gap-4">
            <button onClick={() => navigate("/app")} data-testid="brand-logo" className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#00f3ff]/50 bg-[#00f3ff]/10 glow-cyan">
                <Activity className="h-5 w-5 text-[#00f3ff]" />
              </span>
              <span className="leading-none">
                <span className="block text-xl font-black uppercase tracking-tight text-glow" style={{ fontFamily: "Barlow Condensed" }}>
                  BITS <span className="text-[#00f3ff]">in Motion</span>
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">AI Camera Coach</span>
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} data-testid={l.testid}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-[#00f3ff]/10 text-[#00f3ff]" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    }`}>
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSetting("sound", !settings.sound)} data-testid="sound-toggle"
                title={settings.sound ? "Mute cues" : "Unmute cues"}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 hover:text-[#00f3ff] hover:border-[#00f3ff]/40 transition-colors">
                {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button data-testid="account-menu-trigger" className="flex items-center gap-2 rounded-md border border-white/10 pl-1 pr-2.5 py-1 hover:border-[#00f3ff]/40 transition-colors">
                    {mode === "auth" && user?.picture ? (
                      <img src={user.picture} alt="" className="h-7 w-7 rounded-full" />
                    ) : (
                      <UserCircle2 className="h-7 w-7 text-slate-400" />
                    )}
                    <span className="hidden sm:block text-sm text-slate-300 max-w-[8rem] truncate">
                      {mode === "auth" ? (user?.name || "Account") : "Guest"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#16161b] border-white/10 text-slate-200">
                  <DropdownMenuLabel className="text-slate-400">
                    {mode === "auth" ? user?.email : "Guest — local only"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {mode === "auth" ? (
                    <DropdownMenuItem data-testid="logout-btn" onClick={doLogout} className="text-[#ff3b30] focus:text-[#ff3b30] focus:bg-white/5">
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem data-testid="exit-guest-btn" onClick={doLogout} className="focus:bg-white/5">
                      <LogOut className="mr-2 h-4 w-4" /> Exit to landing
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="md:hidden flex items-center justify-around border-t border-white/10 px-2 py-1.5">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-[11px] ${isActive ? "text-[#00f3ff]" : "text-slate-400"}`}>
                <l.icon className="h-4 w-4" />
                {l.label.split(" ")[0]}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 sm:px-5 py-6 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
