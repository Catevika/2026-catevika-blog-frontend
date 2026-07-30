import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, className }: any) => (
      <a href={to} className={className} data-to={to}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/components/NavBar", () => ({ default: () => null }));
vi.mock("@/components/BackToTopButton", () => ({ default: () => null }));
vi.mock("@/components/TypographyH1", () => ({
  default: ({ children }: any) => <h1>{children}</h1>,
}));

import PostView from "@/pages/PostView";
import { seedPost, resetPosts } from "../setup/postViewHandlers";
import * as authStore from "@/stores/authStore";
import * as themeHook from "@/hooks/useTheme";

function renderPage(path: string) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/posts/:postId" element={<PostView />} />
          <Route
            path="/auth"
            element={<div data-testid="auth-page">Auth</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetPosts();
  mockNavigate.mockClear();

  vi.spyOn(themeHook, "useTheme").mockReturnValue({
    theme: "light",
    setTheme: vi.fn(),
    className: "light",
    dataColorMode: "light",
  });

  vi.spyOn(authStore, "useAuthStore").mockImplementation((selector?: any) => {
    const state = {
      user: {
        id: "u1",
        name: "Dom",
        email: "dom@example.com",
        role: "user",
        createdAt: "",
        updatedAt: "",
      },
      isAuthenticated: true,
      isInitialized: true,
      persistLogin: true,
      setUser: vi.fn(),
      setInitialized: vi.fn(),
      setPersistLogin: vi.fn(),
      resetAuth: vi.fn(),
    };

    return typeof selector === "function" ? selector(state) : state;
  });
});

describe("PostView", () => {
  it("loads and displays a post", async () => {
    seedPost({
      id: "42",
      title: "Hello World",
      slug: "hello-world",
      content: "This is the content",
      status: "draft",
      locked: true,
      deleted: false,
      author: { id: "u1", name: "Dom", email: "dom@example.com" },
      liked: false,
      likedBy: [],
      likeCount: 0,
      createdAt: "",
      updatedAt: "",
    });

    renderPage("/posts/42");

    expect(await screen.findByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("This is the content")).toBeInTheDocument();
  });

  it("shows error when post not found", async () => {
    renderPage("/posts/999");

    expect(await screen.findByText("Post not found")).toBeInTheDocument();
  });

  it("shows Draft badge for draft post", async () => {
    seedPost({
      id: "43",
      title: "Draft Post",
      slug: "draft-post",
      content: "Draft content",
      status: "draft",
      locked: false,
      deleted: false,
      author: { id: "u1", name: "Dom", email: "dom@example.com" },
      liked: false,
      likedBy: [],
      likeCount: 0,
      createdAt: "",
      updatedAt: "",
    });

    renderPage("/posts/43");

    expect(await screen.findByText("Draft")).toBeInTheDocument();
  });

  it("shows login link when user is not logged in", async () => {
    vi.spyOn(authStore, "useAuthStore").mockImplementation((selector?: any) => {
      const state = {
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        persistLogin: true,
        setUser: vi.fn(),
        setInitialized: vi.fn(),
        setPersistLogin: vi.fn(),
        resetAuth: vi.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    seedPost({
      id: "44",
      title: "Public Post",
      slug: "public-post",
      content: "Public content",
      status: "published",
      locked: false,
      deleted: false,
      author: { id: "u2", name: "Jane", email: "jane@example.com" },
      liked: false,
      likedBy: [],
      likeCount: 0,
      createdAt: "",
      updatedAt: "",
    });

    renderPage("/posts/44");

    expect(
      await screen.findByText("Log in to edit, like or comment this post"),
    ).toBeInTheDocument();
  });
});
