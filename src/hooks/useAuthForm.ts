import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { fetchMe, loginRequest, signupRequest } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import {
  loginPayloadSchema,
  signupPayloadSchema,
  type LoginPayload,
  type SignupPayload,
} from "@/types/auth";
import { RateLimitError } from "@/errors/RateLimitError";

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useAuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // backend-driven cooldown (Retry-After)
  const [cooldown, setCooldown] = useState<number | null>(null);

  const [rememberMe, setRememberMe] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const setPersistLogin = useAuthStore((s) => s.setPersistLogin);

  const loginMutation = useMutation({ mutationFn: loginRequest });
  const signupMutation = useMutation({ mutationFn: signupRequest });

  // countdown timer
  useEffect(() => {
    if (cooldown === null) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const handleRememberMeChange = (checked: boolean | "indeterminate") => {
    setRememberMe(checked === true);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));

    setValues({
      name: "",
      email: "",
      password: "",
    });

    setFieldErrors({});
    setGlobalError(null);
    setRememberMe(false);

    // reset cooldown when switching modes
    setCooldown(null);
  };
  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent) => {
      e.preventDefault();
      setFieldErrors({});
      setGlobalError(null);

      // prevent submitting during cooldown
      if (cooldown !== null) return false;

      const signupData: SignupPayload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      const loginData: LoginPayload = {
        email: values.email,
        password: values.password,
        remember: rememberMe,
      };

      const parsed =
        mode === "signup"
          ? signupPayloadSchema.safeParse(signupData)
          : loginPayloadSchema.safeParse(loginData);

      if (!parsed.success) {
        const errors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const fieldName = Array.isArray(issue.path)
            ? (issue.path[0] as string)
            : String(issue.path);
          errors[fieldName] = issue.message;
        });
        setFieldErrors(errors);
        return false;
      }

      try {
        if (mode === "signup") {
          const result = await signupMutation.mutateAsync(signupData);
          setUser(result.user);
          setInitialized(true);
          setCooldown(null);
          return true;
        }

        const result = await loginMutation.mutateAsync(loginData);
        setUser(result.user);
        setPersistLogin(rememberMe);
        setInitialized(true);
        setCooldown(null);
        return true;
      } catch (err) {
        if (err instanceof RateLimitError) {
          setCooldown(err.retryAfter ?? null);
          setGlobalError(err.message);
          return false;
        }

        const message =
          err instanceof Error ? err.message : "Authentication failed";
        setGlobalError(message);

        return false;
      }
    },
    [
      values,
      rememberMe,
      mode,
      loginMutation,
      signupMutation,
      setUser,
      setPersistLogin,
      setInitialized,
      cooldown,
    ],
  );

  return {
    mode,
    values,
    fieldErrors,
    globalError,
    cooldown,
    rememberMe,
    handleChange,
    handleSubmit,
    handleRememberMeChange,
    toggleMode,
  };
}
