import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthStore, User } from "../types";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      persistLogin: false,

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),

      setInitialized: (value: boolean) => set({ isInitialized: value }),

      setPersistLogin: (value: boolean) => set({ persistLogin: value }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          persistLogin: false,
        });

        // Clear persisted storage
        localStorage.removeItem("auth-persist");
      },
    }),
    {
      name: "auth-persist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        if (state.persistLogin) {
          return {
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            persistLogin: state.persistLogin,
          };
        }

        return {
          persistLogin: false,
        };
      },
    },
  ),
);
