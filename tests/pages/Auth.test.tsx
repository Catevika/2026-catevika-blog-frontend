import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Auth from "@/pages/Auth";
import { renderWithProvider } from "../utils/renderWithProvider";
import { loginRequest, signupRequest } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { RateLimitError } from "@/errors";
import * as themeHook from "@/hooks/useTheme";

vi.mock("@/api/authApi", () => ({
  loginRequest: vi.fn(),
  signupRequest: vi.fn(),
}));

function setup() {
  return renderWithProvider(<Auth />);
}

beforeEach(() => {
  useAuthStore.getState().resetAuth();
  vi.clearAllMocks();
  vi.restoreAllMocks();

  vi.spyOn(themeHook, "useTheme").mockReturnValue({
    theme: "light",
    setTheme: vi.fn(),
    className: "light",
    dataColorMode: "light",
  });
});

afterEach(() => {
  cleanup();
});

describe("Auth Page", () => {
  it("logs in successfully", async () => {
    (loginRequest as any).mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
    });

    setup();

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("test@example.com");
    expect(state.isInitialized).toBe(true);
  });

  it("signs up successfully", async () => {
    (signupRequest as any).mockResolvedValue({
      user: { id: "1", email: "new@example.com" },
    });

    setup();

    await userEvent.click(
      screen.getByRole("button", { name: /don't have an account/i }),
    );

    await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("new@example.com");
    expect(state.isInitialized).toBe(true);
  });

  it("shows global error on invalid credentials", async () => {
    (loginRequest as any).mockRejectedValue(new Error("Invalid credentials"));

    setup();

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("handles rate limit with cooldown", async () => {
    (loginRequest as any).mockRejectedValue(
      new RateLimitError("Too many login attempts.", 900),
    );

    setup();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "ratelimit@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Too many login attempts.")).toBeInTheDocument();
    expect(await screen.findByText("Try again in 15:00.")).toBeInTheDocument();
  });

  it("toggles between login and signup modes", async () => {
    setup();

    await userEvent.click(
      screen.getByRole("button", { name: /don't have an account/i }),
    );

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /already have an account/i }),
    );

    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it("passes rememberMe to loginRequest", async () => {
    (loginRequest as any).mockResolvedValue({
      user: { id: "1", email: "remember@example.com" },
    });

    setup();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "remember@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByLabelText(/remember me/i));

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    const mockedLogin = vi.mocked(loginRequest);

    expect(mockedLogin.mock.calls[0][0]).toEqual(
      expect.objectContaining({ rememberMe: true }),
    );
  });
});
