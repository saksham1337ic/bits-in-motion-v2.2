import React, { createContext, useContext, useEffect, useState } from "react";
import { loadData, saveData, defaultData } from "@/lib/storage";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function AppProvider({ children }) {
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setProfile = (profile) => setData((d) => ({ ...d, profile }));

  const addWorkout = (workout) =>
    setData((d) => ({
      ...d,
      history: [{ id: uid(), date: new Date().toISOString(), ...workout }, ...d.history],
    }));

  const clearHistory = () => setData((d) => ({ ...d, history: [] }));

  const resetApp = () => setData(defaultData());

  const replaceAll = (next) =>
    setData({
      ...defaultData(),
      profile: next.profile ?? null,
      history: Array.isArray(next.history) ? next.history : [],
      settings: { ...defaultData().settings, ...(next.settings || {}) },
    });

  const setSetting = (key, value) =>
    setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));

  const value = {
    profile: data.profile,
    history: data.history,
    settings: data.settings,
    setProfile,
    addWorkout,
    clearHistory,
    resetApp,
    replaceAll,
    setSetting,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
