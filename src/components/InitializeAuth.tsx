import { useMe } from "@/hooks/useAuthForm";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router";

export default function InitializeAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const persistLogin = useAuthStore((s) => s.persistLogin);

  const hasRun = useRef(false);

  const { data, isLoading } = useMe(persistLogin);

  useEffect(() => {
    if (hasRun.current) return;
    if (isLoading) return;

    hasRun.current = true;

    if (persistLogin) {
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    }

    setInitialized(true);
  }, [isLoading, data, persistLogin, setUser, setInitialized]);

  if (!isInitialized) {
    return <div className="flex-center min-h-screen">Loading session…</div>;
  }

  return <Outlet />;
}
