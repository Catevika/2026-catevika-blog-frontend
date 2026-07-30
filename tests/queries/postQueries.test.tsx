import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useFeedPostsQuery,
  usePublishedPostsQuery,
  useInProgressPostsQuery,
  useTrashedPostsQuery,
  useSinglePostQuery,
  useFavoritesPosts,
} from "@/api/postHooks";

import type { SerializedPost, PaginatedPost } from "@/types/index.js";

vi.mock("@/api/postApi", () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  softDeletePost: vi.fn(),
  restorePost: vi.fn(),
  likePost: vi.fn(),
  fetchFavoritesPosts: vi.fn(),
  fetchTrashedPosts: vi.fn(),
  getFeedPosts: vi.fn(),
  getPublishedPosts: vi.fn(),
  getPosts: vi.fn(),
  getPost: vi.fn(),
}));

import * as postApi from "@/api/postApi";

const mockedPostApi = vi.mocked(postApi);

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// ---------------------------------------------------------
// Helpers (fully typed)
// ---------------------------------------------------------
const makePost = (id: string, likeCount = 0): SerializedPost => ({
  id,
  title: `Post ${id}`,
  slug: `post-${id}`,
  content: "",
  locked: false,
  status: "published", // literal type
  deleted: false,
  liked: false,
  likedBy: [],
  likeCount,
  author: {
    id: "u1",
    name: "User",
    email: "user@example.com",
  },
  createdAt: "",
  updatedAt: "",
});

const makePaginated = (docs: SerializedPost[]): PaginatedPost => ({
  docs,
  pagination: {
    totalDocs: docs.length,
    limit: 7,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  },
});

// ---------------------------------------------------------
// Tests
// ---------------------------------------------------------
describe("postHooks — Query Hooks (API mocked)", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.resetAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    cleanup();
  });

  // FEED POSTS
  describe("useFeedPostsQuery", () => {
    it("returns feed posts", async () => {
      const posts = [makePost("1"), makePost("2")];

      mockedPostApi.getFeedPosts.mockResolvedValueOnce(makePaginated(posts));

      const { result } = renderHook(
        () => useFeedPostsQuery({ page: 1, limit: 7 }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(2);
      });
    });
  });

  // PUBLISHED POSTS
  describe("usePublishedPostsQuery", () => {
    it("returns published posts", async () => {
      const posts = [makePost("1"), makePost("2")];

      mockedPostApi.getPublishedPosts.mockResolvedValueOnce(
        makePaginated(posts),
      );

      const { result } = renderHook(
        () => usePublishedPostsQuery({ page: 1, limit: 7 }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(2);
      });
    });
  });

  // IN-PROGRESS POSTS
  describe("useInProgressPostsQuery", () => {
    it("returns in-progress posts", async () => {
      const posts = [makePost("1")];

      mockedPostApi.getPosts.mockResolvedValueOnce(makePaginated(posts));

      const { result } = renderHook(
        () => useInProgressPostsQuery({ page: 1, limit: 7 }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(1);
      });
    });
  });

  // TRASHED POSTS
  describe("useTrashedPostsQuery", () => {
    it("returns trashed posts", async () => {
      const posts = [makePost("1")];

      mockedPostApi.fetchTrashedPosts.mockResolvedValueOnce(
        makePaginated(posts),
      );

      const { result } = renderHook(
        () => useTrashedPostsQuery({ page: 1, limit: 7 }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(1);
      });
    });
  });

  // SINGLE POST
  describe("useSinglePostQuery", () => {
    it("returns a single post", async () => {
      const post = makePost("1");

      mockedPostApi.getPost.mockResolvedValueOnce(post);

      const { result } = renderHook(() => useSinglePostQuery("1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.data?.id).toBe("1");
      });
    });
  });

  // FAVORITES POSTS
  describe("useFavoritesPosts", () => {
    it("returns favorites posts", async () => {
      const posts = [makePost("1"), makePost("2")];

      mockedPostApi.fetchFavoritesPosts.mockResolvedValueOnce({
        docs: posts,
      });

      const { result } = renderHook(() => useFavoritesPosts(), { wrapper });

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(2);
      });
    });
  });
});
