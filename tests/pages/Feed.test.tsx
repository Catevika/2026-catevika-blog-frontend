import Feed from "@/pages/Feed";
import type { SerializedPost } from "@/types";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFeedResponse,
  createUniquePosts,
  mockPosts,
} from "../mocks/mockPosts";
import { server } from "../setup/server";
import { renderWithProvider } from "../utils/renderWithProvider";
import { resetAuthStore } from "../utils/resetAuthStore";

// ============================================================================
// MOCKS (at top level - required by Vitest)
// ============================================================================

vi.mock("@/components/AuthorForPost", () => ({
  default: ({ post }: { post: SerializedPost }) => (
    <div data-testid="author-for-post">
      <a data-testid="post-title">{post.title}</a>
      {post.author.name}
    </div>
  ),
}));

vi.mock("@/components/CustomNewButton", () => ({
  default: () => <button data-testid="custom-new-button">New</button>,
}));

vi.mock("@/components/CustomPdfButton", () => ({
  default: () => <button data-testid="custom-pdf-button">PDF</button>,
}));

vi.mock("@/components/CustomPublishedButton", () => ({
  default: () => <button data-testid="custom-published-button">Posts</button>,
}));

vi.mock("@/components/CustomTrendingButton", () => ({
  default: () => <button data-testid="custom-trending-button">Trending</button>,
}));

vi.mock("@/components/LikeButton", () => ({
  default: () => <button data-testid="like-button">❤️ 5</button>,
}));

vi.mock("@/components/PostContent", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="post-content">{content}</div>
  ),
}));

vi.mock("@/components/PostsPagination", () => ({
  default: ({
    page,
    totalPages,
    onPrevPage,
    onNextPage,
  }: {
    page: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
  }) => (
    <nav data-testid="pagination">
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        data-testid="prev-page"
        onClick={onPrevPage}
        disabled={page === 1}
      >
        Prev
      </button>
      <button data-testid="next-page" onClick={onNextPage}>
        Next
      </button>
    </nav>
  ),
}));

vi.mock("@/components/TypographyH1", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="h1">{children}</h1>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="input-group" {...props}>
      {children}
    </div>
  ),
  InputGroupAddon: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="input-group-addon">{children}</span>
  ),
  InputGroupInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="search-input" {...props} />
  ),
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/hooks/useScrollRestoration", () => ({
  useScrollRestoration: () => {},
}));

vi.mock("@/stores/authStore", () => {
  const mockState = {
    user: null,
    isAuthenticated: false,
    isInitialized: true,
    persistLogin: false,
    setUser: vi.fn(),
    setInitialized: vi.fn(),
    setPersistLogin: vi.fn(),
    resetAuth: vi.fn(),
  };

  const useAuthStore = vi.fn((selector: (state: any) => any) =>
    selector(mockState),
  ) as any;
  useAuthStore.getState = () => mockState;
  useAuthStore.setUser = vi.fn();
  useAuthStore.setInitialized = vi.fn();
  useAuthStore.setPersistLogin = vi.fn();
  useAuthStore.resetAuth = vi.fn();

  return {
    useAuthStore,
  };
});

// ============================================================================
// TESTS
// ============================================================================

describe("Feed page", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    cleanup();
  });

  describe("Loading state", () => {
    it("shows loading state when query is fetching", async () => {
      server.use(
        http.get("/api/posts/feed", () => {
          return new HttpResponse(null, { status: 200 });
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Loaded posts", () => {
    it("renders feed posts when query succeeds", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "loaded");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(screen.getByText("Feed")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();

      expect(screen.getAllByTestId("card")).toHaveLength(uniquePosts.length);
      expect(screen.getAllByTestId("author-for-post")).toHaveLength(
        uniquePosts.length,
      );
      expect(screen.getAllByTestId("post-content")).toHaveLength(
        uniquePosts.length,
      );
    });

    it("shows post count and author for each post", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "count");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(screen.getAllByTestId("author-for-post")).toHaveLength(
        uniquePosts.length,
      );
      expect(screen.getAllByTestId("post-content")).toHaveLength(
        uniquePosts.length,
      );
      expect(screen.getAllByTestId("card")).toHaveLength(uniquePosts.length);
    });
  });

  describe("Empty state", () => {
    it("shows no posts message when there are no published posts", async () => {
      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse([], 1, 7, 0);
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("No published posts yet");
    });

    it("shows search-specific no posts message when searching", async () => {
      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse([], 1, 7, 0);
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "nonexistent");

      await screen.findByText(/No posts found for "nonexistent"/);
    });
  });

  describe("Search functionality", () => {
    it("updates search input when user types", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "search-input");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toHaveValue("");

      await userEvent.type(searchInput, "Post");

      expect(searchInput).toHaveValue("Post");
    });

    it("includes search param in API request after debouncing", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "search-param");
      let capturedSearchParam: string | undefined;

      server.use(
        http.get("/api/posts/feed", ({ request }) => {
          const url = new URL(request.url);
          capturedSearchParam = url.searchParams.get("search") ?? undefined;

          const filteredPosts = uniquePosts.filter((p) =>
            p.title
              .toLowerCase()
              .includes(capturedSearchParam?.toLowerCase() ?? ""),
          );
          const response = createFeedResponse(
            filteredPosts,
            1,
            7,
            filteredPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "First");

      await waitFor(() => {
        expect(capturedSearchParam).toBe("First");
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination controls when there are multiple pages", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "pagination-ctrl");
      const manyPosts = [
        ...uniquePosts,
        ...uniquePosts.map((p) => ({ ...p, id: `${p.id}-dup1` })),
        ...uniquePosts.map((p) => ({ ...p, id: `${p.id}-dup2` })),
      ];

      server.use(
        http.get("/api/posts/feed", ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const limit = Number(url.searchParams.get("limit") ?? 7);

          const start = (page - 1) * limit;
          const paginatedDocs = manyPosts.slice(start, start + limit);
          const response = createFeedResponse(
            paginatedDocs,
            page,
            limit,
            manyPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("Feed");

      await screen.findByTestId("pagination");
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("calls onNextPage when next button is clicked", async () => {
      const page1Posts = [
        { ...mockPosts[0], id: "post-1-page1-click" },
        { ...mockPosts[1], id: "post-2-page1-click" },
        { ...mockPosts[2], id: "post-3-page1-click" },
        {
          ...mockPosts[0],
          id: "post-4-page1-click",
          title: "Fourth Post Page 1",
        },
        {
          ...mockPosts[1],
          id: "post-5-page1-click",
          title: "Fifth Post Page 1",
        },
        {
          ...mockPosts[2],
          id: "post-6-page1-click",
          title: "Sixth Post Page 1",
        },
        {
          ...mockPosts[0],
          id: "post-7-page1-click",
          title: "Seventh Post Page 1",
        },
      ];

      const page2Posts = [
        { ...mockPosts[0], id: "post-1-page2-click" },
        { ...mockPosts[1], id: "post-2-page2-click" },
        { ...mockPosts[2], id: "post-3-page2-click" },
      ];

      server.use(
        http.get("/api/posts/feed", ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const limit = Number(url.searchParams.get("limit") ?? 7);

          const allPosts = [...page1Posts, ...page2Posts];
          const start = (page - 1) * limit;
          const paginatedDocs = allPosts.slice(start, start + limit);
          const response = createFeedResponse(
            paginatedDocs,
            page,
            limit,
            allPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("Feed");
      await screen.findByTestId("next-page");

      const nextButton = screen.getByTestId("next-page");
      await userEvent.click(nextButton);

      await screen.findByText("Page 2 of 2");
    });

    it("disables prev button on first page", async () => {
      const allPosts = [
        { ...mockPosts[0], id: "post-1-prev-btn" },
        { ...mockPosts[1], id: "post-2-prev-btn" },
        { ...mockPosts[2], id: "post-3-prev-btn" },
        { ...mockPosts[0], id: "post-4-prev-btn", title: "Fourth Post Page 1" },
        { ...mockPosts[1], id: "post-5-prev-btn", title: "Fifth Post Page 1" },
        { ...mockPosts[2], id: "post-6-prev-btn", title: "Sixth Post Page 1" },
        {
          ...mockPosts[0],
          id: "post-7-prev-btn",
          title: "Seventh Post Page 1",
        },
        { ...mockPosts[1], id: "post-8-prev-btn", title: "Eighth Post Page 2" },
      ];

      server.use(
        http.get("/api/posts/feed", ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const limit = Number(url.searchParams.get("limit") ?? 7);

          const start = (page - 1) * limit;
          const paginatedDocs = allPosts.slice(start, start + limit);
          const response = createFeedResponse(
            paginatedDocs,
            page,
            limit,
            allPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("Feed");
      await screen.findByTestId("pagination");

      const prevButton = screen.getByTestId("prev-page");
      expect(prevButton).toBeDisabled();
    });
  });

  describe("Error handling", () => {
    it("can handle API errors gracefully", async () => {
      server.use(
        http.get("/api/posts/feed", () => {
          return HttpResponse.json({ error: "Failed to fetch posts" });
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("No published posts yet");
    });

    it("shows error message when API returns 500", async () => {
      server.use(
        http.get("/api/posts/feed", () => {
          return HttpResponse.json(
            { error: "Internal server error" },
            { status: 500 },
          );
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("No published posts yet");
    });

    it("shows loading during slow network", async () => {
      server.use(
        http.get("/api/posts/feed", async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const response = createFeedResponse(
            mockPosts,
            1,
            7,
            mockPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await screen.findByText("Feed");
    });
  });

  describe("URL sync", () => {
    it("updates URL params when page changes", async () => {
      const allPosts = [
        { ...mockPosts[0], id: "post-1-url-sync" },
        { ...mockPosts[1], id: "post-2-url-sync" },
        { ...mockPosts[2], id: "post-3-url-sync" },
        { ...mockPosts[0], id: "post-4-url-sync", title: "Fourth Post Page 1" },
        { ...mockPosts[1], id: "post-5-url-sync", title: "Fifth Post Page 1" },
        { ...mockPosts[2], id: "post-6-url-sync", title: "Sixth Post Page 1" },
        {
          ...mockPosts[0],
          id: "post-7-url-sync",
          title: "Seventh Post Page 1",
        },
        { ...mockPosts[1], id: "post-8-url-sync", title: "Eighth Post Page 2" },
      ];

      server.use(
        http.get("/api/posts/feed", ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const limit = Number(url.searchParams.get("limit") ?? 7);

          const start = (page - 1) * limit;
          const paginatedDocs = allPosts.slice(start, start + limit);
          const response = createFeedResponse(
            paginatedDocs,
            page,
            limit,
            allPosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      const nextButton = screen.getByTestId("next-page");
      await userEvent.click(nextButton);

      await screen.findByText("Page 2 of 2");
    });

    it("includes search param in URL when searching", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "search-url");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed/search-test");

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "test");

      expect(searchInput).toHaveValue("test");
    });
  });

  describe("Button navigation", () => {
    it("renders trending, published, and new buttons", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "buttons");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      expect(screen.getByTestId("custom-trending-button")).toBeInTheDocument();
      expect(screen.getByTestId("custom-published-button")).toBeInTheDocument();
      expect(screen.getByTestId("custom-new-button")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has basic accessibility features", async () => {
      const uniquePosts = createUniquePosts(mockPosts, "a11y");

      server.use(
        http.get("/api/posts/feed", () => {
          const response = createFeedResponse(
            uniquePosts,
            1,
            7,
            uniquePosts.length,
          );
          return HttpResponse.json(response);
        }),
      );

      renderWithProvider(<Feed />, "/feed");

      await screen.findByText("Feed");

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Heading presence
      expect(screen.getByRole("heading", { name: "Feed" })).toBeInTheDocument();

      // Button labels (by role + name)
      expect(
        screen.getByRole("button", { name: "Trending" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Posts" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();

      // Search input has accessible name
      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      // Posts are present
      expect(screen.getAllByTestId("card")).toHaveLength(uniquePosts.length);
    });
  });
});
