// ─── localStorage Service ─────────────────────────────────────────────────────
// All data persistence for EcoVision goes through this service.

const KEYS = {
  USERS: 'ecovision_users',
  CURRENT_USER: 'ecovision_current_user',
  HISTORY: 'ecovision_history',
  SETTINGS: 'ecovision_settings',
  THEME: 'ecovision_theme',
};

// ── Generic helpers ───────────────────────────────────────────────────────────
const get = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const remove = (key) => localStorage.removeItem(key);

// ── User Auth ─────────────────────────────────────────────────────────────────
export const getUsers = () => get(KEYS.USERS, []);

export const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  set(KEYS.USERS, users);
};

export const updateUser = (updatedUser) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === updatedUser.email);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updatedUser };
    set(KEYS.USERS, users);
    // Also update current session if same user
    const current = getCurrentUser();
    if (current && current.email === updatedUser.email) {
      setCurrentUser({ ...current, ...updatedUser });
    }
    return true;
  }
  return false;
};

export const getUserByEmail = (email) =>
  getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;

export const getCurrentUser = () => get(KEYS.CURRENT_USER, null);

export const setCurrentUser = (user) => set(KEYS.CURRENT_USER, user);

export const clearCurrentUser = () => remove(KEYS.CURRENT_USER);

// ── Calculation History ───────────────────────────────────────────────────────
export const getHistory = (userEmail) => {
  const all = get(KEYS.HISTORY, {});
  return all[userEmail] || [];
};

export const saveCalculation = (userEmail, result) => {
  const all = get(KEYS.HISTORY, {});
  if (!all[userEmail]) all[userEmail] = [];
  const entry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...result,
  };
  all[userEmail].unshift(entry); // newest first
  set(KEYS.HISTORY, all);
  return entry;
};

export const deleteCalculation = (userEmail, id) => {
  const all = get(KEYS.HISTORY, {});
  if (!all[userEmail]) return;
  all[userEmail] = all[userEmail].filter((h) => h.id !== id);
  set(KEYS.HISTORY, all);
};

export const clearHistory = (userEmail) => {
  const all = get(KEYS.HISTORY, {});
  all[userEmail] = [];
  set(KEYS.HISTORY, all);
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = (userEmail) => {
  const all = get(KEYS.SETTINGS, {});
  return all[userEmail] || {
    theme: 'dark',
    unit: 'kg',
    emailAlerts: true,
    weeklyReport: false,
    achievements: true,
    density: 'comfortable',
    dateFormat: 'MM/DD/YYYY',
  };
};

export const saveSettings = (userEmail, settings) => {
  const all = get(KEYS.SETTINGS, {});
  all[userEmail] = { ...(all[userEmail] || {}), ...settings };
  set(KEYS.SETTINGS, all);
};

// ── Theme ─────────────────────────────────────────────────────────────────────
export const getTheme = () => get(KEYS.THEME, 'dark');
export const saveTheme = (theme) => set(KEYS.THEME, theme);

// ── Delete account ────────────────────────────────────────────────────────────
export const deleteAccount = (userEmail) => {
  // Remove from users list
  const users = getUsers().filter((u) => u.email !== userEmail);
  set(KEYS.USERS, users);
  // Remove history
  const allHistory = get(KEYS.HISTORY, {});
  delete allHistory[userEmail];
  set(KEYS.HISTORY, allHistory);
  // Remove settings
  const allSettings = get(KEYS.SETTINGS, {});
  delete allSettings[userEmail];
  set(KEYS.SETTINGS, allSettings);
  // Clear session
  clearCurrentUser();
};
