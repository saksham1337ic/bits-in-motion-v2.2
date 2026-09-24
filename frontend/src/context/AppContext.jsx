import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { loadData, saveData, defaultData } from "@/lib/storage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const GUEST_FLAG = "bits_mode";

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(null); // null | 'guest' | 'auth'
  const [user, setUser] = useState(null);
  const [data, setData] = useState(defaultData());

  const modeRef = useRef(null);
  const saveTimer = useRef(null);

  const cloudSave = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile: next.profile ?? null,
          history: next.history || [],
          settings: next.settings || {},
          meal: next.meal ?? null,
        }),
      }).catch(() => {});
    }, 500);
  }, []);

  const persist = useCallback((next) => {
    if (modeRef.current === "auth") cloudSave(next);
    else saveData(next);
  }, [cloudSave]);

  const commit = useCallback((next) => {
    setData(next);
    persist(next);
  }, [persist]);

  // ---- bootstrap ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (window.location.hash?.includes("session_id=")) {
        // AuthCallback will handle establishing the session.
        setReady(true);
        return;
      }
      try {
        const me = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (me.ok) {
          const u = await me.json();
          const dres = await fetch(`${API}/data`, { credentials: "include" });
          const d = dres.ok ? await dres.json() : defaultData();
          if (cancelled) return;
          setUser(u);
          modeRef.current = "auth";
          setMode("auth");
          setData({ ...defaultData(), ...d, settings: { ...defaultData().settings, ...(d.settings || {}) } });
          setReady(true);
          return;
        }
      } catch { /* offline / not authed */ }
      if (localStorage.getItem(GUEST_FLAG) === "guest") {
        modeRef.current = "guest";
        setMode("guest");
        setData(loadData());
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- entry actions ----
  const enterGuest = useCallback(() => {
    localStorage.setItem(GUEST_FLAG, "guest");
    modeRef.current = "guest";
    setMode("guest");
    setData(loadData());
  }, []);

  const signInGoogle = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/app";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const completeAuth = useCallback(async (sessionId) => {
    const wasGuest = localStorage.getItem(GUEST_FLAG) === "guest";
    const guestData = wasGuest ? loadData() : null;
    const res = await fetch(`${API}/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-ID": sessionId },
      credentials: "include",
      body: JSON.stringify({ guest_data: guestData }),
    });
    if (!res.ok) throw new Error("auth failed");
    const { user: u, data: d } = await res.json();
    localStorage.removeItem(GUEST_FLAG);
    setUser(u);
    modeRef.current = "auth";
    setMode("auth");
    setData({ ...defaultData(), ...d, settings: { ...defaultData().settings, ...(d.settings || {}) } });
    return true;
  }, []);

  const logout = useCallback(async () => {
    try { await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    modeRef.current = null;
    setUser(null);
    setMode(null);
    setData(defaultData());
  }, []);

  // ---- data mutations ----
  const setProfile = (profile) => commit({ ...data, profile });
  const addWorkout = (workout) =>
    commit({ ...data, history: [{ id: uid(), date: new Date().toISOString(), ...workout }, ...data.history] });
  const clearHistory = () => commit({ ...data, history: [] });
  const setSetting = (key, value) => commit({ ...data, settings: { ...data.settings, [key]: value } });
  const setMeal = (meal) => commit({ ...data, meal });
  const resetApp = () => commit(defaultData());
  const replaceAll = (next) =>
    commit({
      ...defaultData(),
      profile: next.profile ?? null,
      history: Array.isArray(next.history) ? next.history : [],
      settings: { ...defaultData().settings, ...(next.settings || {}) },
      meal: next.meal ?? null,
    });

  const value = {
    ready,
    mode,
    user,
    profile: data.profile,
    history: data.history,
    settings: data.settings,
    meal: data.meal,
    enterGuest,
    signInGoogle,
    completeAuth,
    logout,
    setProfile,
    addWorkout,
    clearHistory,
    setSetting,
    setMeal,
    resetApp,
    replaceAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
