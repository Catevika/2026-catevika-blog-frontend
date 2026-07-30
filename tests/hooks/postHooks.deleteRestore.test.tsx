import { vi } from "vitest";

// ---------------------------------------------------------
// 1. Correct partial mock of postApi (ESM-safe + coverage-safe)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 2. Imports AFTER mocks
// ---------------------------------------------------------
import { restorePost, softDeletePost } from "@/api/postApi";
import {
  useRestorePostMutation,
  useSoftDeletePostMutation,
} from "@/api/postHooks";

import type { SerializedPost } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

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
describe("postHooks.deleteRestore", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    cleanup();
  });

  describe("useSoftDeletePostMutation", () => {
    it("soft-deletes a post and invalidates all related lists", async () => {
      const { wrapper } = createWrapper();

      const deleted: SerializedPost = {
        id: "1",
        title: "Deleted",
        slug: "deleted",
        content: "",
        locked: true,
        status: "published",
        deleted: true,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: { id: "u1", name: "User", email: "user@example.com" },
        createdAt: "",
        updatedAt: "",
      };

      (softDeletePost as Mock).mockResolvedValue(deleted);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useSoftDeletePostMutation(), {
        wrapper,
      });

      result.current.mutate("1");

      await waitFor(() => {
        expect(softDeletePost).toHaveBeenCalledTimes(1);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["publishedPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inProgressPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["trashPosts"] });
    });
  });

  describe("useRestorePostMutation", () => {
    it("restores a post and invalidates all related lists", async () => {
      const { wrapper } = createWrapper();

      const restored: SerializedPost = {
        id: "1",
        title: "Restored",
        slug: "restored",
        content: "",
        locked: true,
        status: "published",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: { id: "u1", name: "User", email: "user@example.com" },
        createdAt: "",
        updatedAt: "",
      };

      (restorePost as Mock).mockResolvedValue(restored);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRestorePostMutation(), {
        wrapper,
      });

      result.current.mutate("1");

      await waitFor(() => {
        expect(restorePost).toHaveBeenCalledTimes(1);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["publishedPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inProgressPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["trashPosts"] });
    });
  });
});
