import { useAuthStore } from "@/stores/authStore";

export function resetAuthStore() {
  useAuthStore.getState().resetAuth();
}
