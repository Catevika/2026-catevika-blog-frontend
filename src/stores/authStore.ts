import type { AuthStore } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      persistLogin: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),

      setInitialized: (value) => set({ isInitialized: value }),

      setPersistLogin: (value) => set({ persistLogin: value }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          persistLogin: false,
        });
        localStorage.removeItem("auth-persist");
      },
    }),
    {
      name: "auth-persist",
      storage: createJSONStorage(() => localStorage),

      // Always persist persistLogin, but only persist user if remember me was checked
      partialize: (state) => ({
        persistLogin: state.persistLogin,
        user: state.persistLogin ? state.user : null,
        isAuthenticated: state.persistLogin ? state.isAuthenticated : false,
      }),

      // Hydration logic
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // If remember me was NOT checked, ensure user is cleared
        if (!state.persistLogin) {
          state.setUser(null);
        }

        // Mark hydration complete
        state.setInitialized(true);
      },
    },
  ),
);
