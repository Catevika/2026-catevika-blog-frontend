import { useAuthStore } from "@/stores/authStore";
import type { SerializedUser } from "@/types";

export function mockAuth(user: SerializedUser | null) {
  useAuthStore.setState({
    user,
    isAuthenticated: Boolean(user),
    isInitialized: true,
    persistLogin: false,
  });
}
