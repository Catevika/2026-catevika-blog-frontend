import { createPost, updatePost } from "@/api/postApi";
import { useCreatePostMutation, useUpdatePostMutation } from "@/api/postHooks";
import type { SerializedPost } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------
//  API MOCKS — must be declared BEFORE importing hooks
// ---------------------------------------------------------
vi.mock("@/api/postApi", () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
}));

// ---------------------------------------------------------
//  Shared QueryClient for deterministic tests
// ---------------------------------------------------------
let queryClient: QueryClient;

const createWrapper = () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, {
      client: queryClient,
      children,
    });

  return { wrapper };
};

describe("postHooks.createUpdate", () => {
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

  /* -------------------------------------------------------
     useCreatePostMutation
  ------------------------------------------------------- */
  describe("useCreatePostMutation", () => {
    it("creates a post, writes it to cache, and invalidates the correct queries", async () => {
      const { wrapper } = createWrapper();

      const created: SerializedPost = {
        id: "1",
        title: "New Post",
        slug: "new-post",
        content: "",
        locked: false,
        status: "published",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: { id: "u1", name: "User", email: "user@example.com" },
        createdAt: "",
        updatedAt: "",
      };

      (createPost as Mock).mockResolvedValue(created);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePostMutation(), { wrapper });

      result.current.mutate(created);

      await waitFor(() => {
        expect(createPost).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<SerializedPost>(["post", "1"]);
        expect(cached).toEqual(created);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["publishedPosts"],
      });
    });

    it("does not crash when the create response is missing", async () => {
      const { wrapper } = createWrapper();

      (createPost as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatePostMutation(), { wrapper });

      await expect(
        result.current.mutateAsync({ title: "New Post" }),
      ).resolves.toBeUndefined();
    });
  });

  /* -------------------------------------------------------
     useUpdatePostMutation
  ------------------------------------------------------- */
  describe("useUpdatePostMutation", () => {
    it("updates a post, writes it to cache, and invalidates all related lists", async () => {
      const { wrapper } = createWrapper();

      const updated: SerializedPost = {
        id: "1",
        title: "Updated",
        slug: "updated",
        content: "",
        locked: false,
        status: "draft",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: { id: "u1", name: "User", email: "user@example.com" },
        createdAt: "",
        updatedAt: "",
      };

      (updatePost as Mock).mockResolvedValue(updated);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdatePostMutation(), { wrapper });

      result.current.mutate({ id: "1", title: "Updated" });

      await waitFor(() => {
        expect(updatePost).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<SerializedPost>(["post", "1"]);
        expect(cached).toEqual(updated);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["publishedPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inProgressPosts"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["trashPosts"],
      });
    });
  });
});
