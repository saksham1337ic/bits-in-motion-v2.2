const KEY = "bits_in_motion_data";

const defaultData = () => ({
  profile: null,
  history: [],
  settings: { sound: true },
});

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    return { ...defaultData(), ...parsed, settings: { ...defaultData().settings, ...(parsed.settings || {}) } };
  } catch {
    return defaultData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full / unavailable */
  }
}

export { defaultData };
