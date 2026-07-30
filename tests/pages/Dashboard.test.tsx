import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import Dashboard from "@/pages/Dashboard";
import { renderWithProvider } from "../utils/renderWithProvider";
import * as authStore from "@/stores/authStore";
import * as themeHook from "@/hooks/useTheme";
import type { AuthStore } from "@/types";

// Helper to mock auth state per test
function mockAuthState(state: Partial<AuthStore>) {
  vi.spyOn(authStore, "useAuthStore").mockImplementation((selector: any) =>
    selector({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      persistLogin: false,
      setUser: vi.fn(),
      setInitialized: vi.fn(),
      setPersistLogin: vi.fn(),
      resetAuth: vi.fn(),
      ...state,
    }),
  );
}

function setup() {
  return renderWithProvider(<Dashboard />);
}

beforeEach(() => {
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
  vi.restoreAllMocks();
});

describe("Dashboard Page", () => {
  it("renders hero image and caption", () => {
    mockAuthState({}); // guest state

    setup();

    const img = screen.getByAltText(/hero banner/i);
    expect(img).toBeInTheDocument();

    const captionLink = screen.getByRole("link", { name: /cg artists/i });
    expect(captionLink).toBeInTheDocument();
  });

  it("shows guest CTA text when not authenticated", () => {
    mockAuthState({ isAuthenticated: false });

    setup();

    // Use query to check if exactly one exists
    const elements = screen.queryAllByText("No account needed");
    expect(elements.length).toBe(1);

    expect(screen.getByText("Create an Account")).toBeInTheDocument();
  });

  it("shows authenticated CTA text when logged in", () => {
    mockAuthState({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Dom",
        email: "dom@example.com",
        role: "user",
        createdAt: "",
        updatedAt: "",
      },
    });

    setup();

    expect(screen.getByText("Start Reading Now")).toBeInTheDocument();
    expect(screen.getByText("Start Writing Now")).toBeInTheDocument();
  });

  it("links to /posts", () => {
    mockAuthState({});

    setup();

    const link = screen.getByRole("link", { name: /no account needed/i });
    expect(link).toHaveAttribute("href", "/posts");
  });

  it("links to /posts/new", () => {
    mockAuthState({});

    setup();

    const link = screen.getByRole("link", { name: /create an account/i });
    expect(link).toHaveAttribute("href", "/posts/new");
  });
});
