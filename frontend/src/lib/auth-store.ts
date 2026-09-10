import { create } from "zustand";
import { AuthAPI, UserProfile, getAccessToken, setAccessToken } from "./auth-api";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;

  setUser: (user: UserProfile | null) => void;
  initAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  },

  initAuth: async () => {
    if (get().initialized && get().user) {
      return;
    }

    set({ isLoading: true });
    try {
      // Check if session token exists
      const token = getAccessToken();
      if (!token) {
        // Try refreshing session with cookie
        try {
          await AuthAPI.refreshToken();
        } catch {
          // No session
          set({ user: null, isAuthenticated: false, isLoading: false, initialized: true });
          return;
        }
      }

      const profile = await AuthAPI.getMe();
      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      });
    } catch {
      setAccessToken(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      });
    }
  },

  refreshUser: async () => {
    try {
      const profile = await AuthAPI.getMe();
      set({
        user: profile,
        isAuthenticated: true,
      });
    } catch (err) {
      console.warn("Could not refresh user profile:", err);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthAPI.logout();
    } finally {
      setAccessToken(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
