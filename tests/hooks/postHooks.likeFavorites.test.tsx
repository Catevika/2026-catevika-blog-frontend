import { vi } from "vitest";
// ---------------------------------------------------------
// 1. Mock modules (top-level, no unmock)
// ---------------------------------------------------------
vi.mock("@/stores/authStore", () => {
  const createMockAuthState = () => ({
    user: {
      id: "u1",
      name: "User",
      email: "user@example.com",
      role: "user",
      createdAt: "",
      updatedAt: "",
    },
    isAuthenticated: true,
    isInitialized: true,
    persistLogin: false,
    setUser: vi.fn(),
    setInitialized: vi.fn(),
    setPersistLogin: vi.fn(),
    resetAuth: vi.fn(),
  });

  const mockState = createMockAuthState();

  return {
    useAuthStore: (selector: (s: typeof mockState) => unknown) =>
      selector(mockState),
  };
});

vi.mock("@/api/postApi", () => ({
  likePost: vi.fn(),
  fetchFavoritesPosts: vi.fn(),
  getPublishedPosts: vi.fn(),
  getFeedPosts: vi.fn(),
  getPosts: vi.fn(),
  fetchTrashedPosts: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  softDeletePost: vi.fn(),
  restorePost: vi.fn(),
  getPost: vi.fn(),
}));

// ---------------------------------------------------------
// 2. Imports AFTER mocks
// ---------------------------------------------------------
import type { LikeResponse, SerializedPost } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, type Mock } from "vitest";

import { likePost, fetchFavoritesPosts } from "@/api/postApi";
import { useFavoritesPosts, useLikePostMutation } from "@/api/postHooks";

// ---------------------------------------------------------
// 3. QueryClient wrapper
// ---------------------------------------------------------
let queryClient: QueryClient;

function createWrapper() {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, {
      client: queryClient,
      children,
    });

  return { wrapper };
}

// ---------------------------------------------------------
// 4. Test Suite
// ---------------------------------------------------------
describe("postHooks.likeFavorites", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks(); // safe
  });

  afterEach(() => {
    queryClient.clear();
    cleanup();
  });

  // -------------------------------------------------------
  // useLikePostMutation
  // -------------------------------------------------------
  describe("useLikePostMutation", () => {
    it("ends with server like state in cache after success", async () => {
      const { wrapper } = createWrapper();

      const initial: SerializedPost = {
        id: "1",
        title: "Post",
        slug: "post",
        content: "",
        locked: false,
        status: "published",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: {
          id: "u1",
          name: "User",
          email: "user@example.com",
        },
        createdAt: "",
        updatedAt: "",
      };

      queryClient.setQueryData(["post", "1"], initial);

      const serverResponse: LikeResponse = {
        success: true,
        userId: "u1",
        liked: true,
        likedBy: ["u1"],
        likeCount: 1,
        comment: {
          id: "c1",
          content: "",
          postId: "1",
          authorId: "u1",
          author: {
            id: "u1",
            name: "User",
            email: "user@example.com",
          },
          liked: false,
          likedBy: [],
          likeCount: 0,
          status: "ok",
          parentId: null,
          depth: 0,
          deleted: false,
          createdAt: "",
          updatedAt: "",
        },
      };

      (likePost as Mock).mockResolvedValue(serverResponse);

      const { result } = renderHook(() => useLikePostMutation(), { wrapper });

      result.current.mutate({ postId: "1" });

      await waitFor(() => {
        expect(likePost).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const final = queryClient.getQueryData<SerializedPost>(["post", "1"]);
        expect(final?.likedBy).toEqual(["u1"]);
        expect(final?.likeCount).toBe(1);
      });
    });

    it("ends with original state in cache after error", async () => {
      const { wrapper } = createWrapper();

      const initial: SerializedPost = {
        id: "1",
        title: "Post",
        slug: "post",
        content: "",
        locked: false,
        status: "published",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: {
          id: "u1",
          name: "User",
          email: "user@example.com",
        },
        createdAt: "",
        updatedAt: "",
      };

      queryClient.setQueryData(["post", "1"], initial);

      (likePost as Mock).mockRejectedValue(new Error("fail"));

      const { result } = renderHook(() => useLikePostMutation(), { wrapper });

      result.current.mutate({ postId: "1" });

      await waitFor(() => {
        expect(likePost).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const final = queryClient.getQueryData<SerializedPost>(["post", "1"]);
        expect(final).toEqual(initial);
      });
    });
  });

  // -------------------------------------------------------
  // useFavoritesPosts
  // -------------------------------------------------------
  describe("useFavoritesPosts", () => {
    it("returns ONLY the top 5 most liked posts sorted by likeCount DESC", async () => {
      const { wrapper } = createWrapper();

      const makePost = (id: string, likeCount: number): SerializedPost => ({
        id,
        title: `Post ${id}`,
        slug: `post-${id}`,
        content: "",
        locked: false,
        status: "published",
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

      const top5 = [
        makePost("1", 100),
        makePost("2", 90),
        makePost("3", 80),
        makePost("4", 70),
        makePost("5", 60),
      ];

      (fetchFavoritesPosts as Mock).mockResolvedValue({
        docs: top5,
      });

      const { result } = renderHook(() => useFavoritesPosts(), { wrapper });

      await waitFor(() => {
        expect(result.current.data?.docs).toHaveLength(5);
      });

      const likeCounts = result.current.data!.docs.map((p) => p.likeCount);
      expect(likeCounts).toEqual([100, 90, 80, 70, 60]);

      const returnedIds = result.current.data!.docs.map((p) => p.id);
      expect(returnedIds).toEqual(["1", "2", "3", "4", "5"]);

      expect(fetchFavoritesPosts).toHaveBeenCalledTimes(1);
    });
  });
});
