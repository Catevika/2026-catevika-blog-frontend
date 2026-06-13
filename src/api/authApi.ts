import { RateLimitError, type ApiError } from "@/errors";
import type { AuthResponse, LoginPayload, SignupPayload } from "@/types";

export async function signupRequest(payload: SignupPayload) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Detect rate limit
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;

    throw new RateLimitError("Too many signup attempts.", retryAfter);
  }

  if (!res.ok) {
    let errorBody: ApiError | null = null;

    try {
      errorBody = (await res.json()) as ApiError;
    } catch {
      // backend didn't return JSON
    }

    const message = errorBody?.message ?? `Signup failed (${res.status})`;

    throw new Error(message);
  }

  return (await res.json()) as Promise<AuthResponse>;
}

export async function loginRequest(payload: LoginPayload) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Detect rate limit
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;

    throw new RateLimitError("Too many login attempts.", retryAfter);
  }

  // Normal error handling
  if (!res.ok) {
    let errorBody: ApiError | null = null;

    try {
      errorBody = (await res.json()) as ApiError;
    } catch {
      // backend didn't return JSON
    }

    const message = errorBody?.message ?? `Login failed (${res.status})`;

    throw new Error(message);
  }

  return (await res.json()) as Promise<AuthResponse>;
}

export async function logoutRequest(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Logout failed");
}

export async function fetchMe(): Promise<AuthResponse> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Not authenticated");
  return (await res.json()) as Promise<AuthResponse>;
}
