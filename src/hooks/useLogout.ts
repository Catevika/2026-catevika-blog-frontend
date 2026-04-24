import { logoutRequest } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const setPersistLogin = useAuthStore((s) => s.setPersistLogin);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  const mutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      setUser(null);
      setPersistLogin(false);
      setInitialized(true);
    },
  });

  return {
    logout: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
  };
}
