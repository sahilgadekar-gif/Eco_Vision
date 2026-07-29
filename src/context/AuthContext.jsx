import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI }  from '../services/api';
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getUserByEmail,
  saveUser,
  updateUser,
} from '../services/storage';

const TOKEN_KEY   = 'ecovision_token';
const USER_KEY    = 'ecovision_current_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session from stored JWT or localStorage on mount ────────────
  useEffect(() => {
    const token  = localStorage.getItem(TOKEN_KEY);
    const cached = getCurrentUser();

    if (token) {
      // Validate token with the backend
      authAPI.getMe()
        .then(({ data }) => {
          if (data.success) {
            setUser(data.user);
            setCurrentUser(data.user);
          } else if (cached) {
            setUser(cached);
          } else {
            clearSession();
          }
        })
        .catch(() => {
          if (cached) {
            setUser(cached);
          } else {
            clearSession();
          }
        })
        .finally(() => setLoading(false));
    } else if (cached) {
      setUser(cached);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    clearCurrentUser();
    setUser(null);
  };

  const persistSession = (token, userData) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    setCurrentUser(userData);
    setUser(userData);
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const trimmedName  = name.trim();
    const cleanedEmail = email.toLowerCase().trim();

    try {
      const { data } = await authAPI.register({ name: trimmedName, email: cleanedEmail, password });
      if (data.success) {
        persistSession(data.token, data.user);
        saveUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.message || 'Registration failed.' };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, error: err.response.data.message };
      }

      const existing = getUserByEmail(cleanedEmail);
      if (existing) return { success: false, error: 'Email already registered.' };

      const newUser = {
        id:        Date.now().toString(),
        _id:       Date.now().toString(),
        name:      trimmedName,
        email:     cleanedEmail,
        password,
        createdAt: new Date().toISOString(),
        avatar:    trimmedName.charAt(0).toUpperCase(),
      };

      saveUser(newUser);
      setCurrentUser(newUser);
      setUser(newUser);
      return { success: true };
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const cleanedEmail = email.toLowerCase().trim();

    try {
      const { data } = await authAPI.login({ email: cleanedEmail, password });
      if (data.success) {
        persistSession(data.token, data.user);
        saveUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed.' };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, error: err.response.data.message };
      }

      const found = getUserByEmail(cleanedEmail);
      if (!found) return { success: false, error: 'No account found with this email.' };
      if (found.password !== password) return { success: false, error: 'Incorrect password.' };

      setCurrentUser(found);
      setUser(found);
      return { success: true };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    clearSession();
  }, []);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async ({ name, bio }) => {
    try {
      const { data } = await userAPI.updateProfile({ name, bio });
      if (data.success) {
        const updated = { ...user, ...data.user };
        setUser(updated);
        updateUser(updated);
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch {
      const updated = { ...user, name, bio, avatar: name.charAt(0).toUpperCase() };
      updateUser(updated);
      setUser(updated);
      return { success: true };
    }
  }, [user]);

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    try {
      const { data } = await userAPI.changePassword({ currentPassword, newPassword });
      return { success: data.success, error: data.message };
    } catch {
      if (user?.password && user.password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      const updated = { ...user, password: newPassword };
      updateUser(updated);
      setUser(updated);
      return { success: true };
    }
  }, [user]);

  // ── Delete account ────────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    try {
      await userAPI.deleteAccount();
    } catch {
      /* ignore server error */
    }
    clearSession();
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
