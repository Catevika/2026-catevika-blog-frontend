import { softDeletePost, restorePost, fetchTrashedPosts } from "@/api/postApi";
import type { PaginatedPost, SerializedPost } from "@/types";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

describe("postApi — delete, restore, trashed posts", () => {
  let mockFetch: Mock<(...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockJson = (data: unknown) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    statusText: "OK",
    url: "/api",
  });

  const mockError = (
    status: number,
    json: Record<string, unknown> | null = null,
  ) => ({
    ok: false,
    status,
    json: () => Promise.resolve(json),
    headers: new Headers(),
    statusText: "Error",
    url: "/api",
  });

  /* -------------------------------------------------------
     softDeletePost
  ------------------------------------------------------- */
  describe("softDeletePost", () => {
    it("sends PUT with deleted:true and returns updated post", async () => {
      const updated: SerializedPost = {
        id: "123",
        title: "Test",
        slug: "test",
        content: "",
        locked: false,
        status: "draft",
        deleted: true,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: { id: "u1", name: "User", email: "user@example.com" },
        createdAt: "",
        updatedAt: "",
      };

      mockFetch.mockResolvedValue(mockJson(updated));

      const result = await softDeletePost("123");

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: true }),
        credentials: "include",
      });

      expect(result).toEqual(updated);
    });

    it("throws error when backend returns non-ok", async () => {
      mockFetch.mockResolvedValue(mockError(400));

      await expect(softDeletePost("123")).rejects.toThrow(
        "Failed to move post to trash. Please try again.",
      );
    });
  });

  /* -------------------------------------------------------
     restorePost
  ------------------------------------------------------- */
  describe("restorePost", () => {
    it("sends POST and returns restored post", async () => {
      const restored: SerializedPost = {
        id: "1",
        title: "Restored",
        slug: "restored",
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

      mockFetch.mockResolvedValue(mockJson(restored));

      const result = await restorePost("1");

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/1/restore", {
        method: "POST",
        credentials: "include",
      });

      expect(result).toEqual(restored);
    });

    it("throws error when backend returns non-ok", async () => {
      mockFetch.mockResolvedValue(mockError(400));

      await expect(restorePost("1")).rejects.toThrow(
        "Failed to restore post. Please try again.",
      );
    });
  });

  /* -------------------------------------------------------
     fetchTrashedPosts
  ------------------------------------------------------- */
  describe("fetchTrashedPosts", () => {
    const pagination = {
      totalDocs: 1,
      limit: 7,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    };

    const trashedPost: SerializedPost = {
      id: "1",
      title: "Deleted",
      slug: "deleted",
      content: "",
      locked: false,
      status: "draft",
      deleted: true,
      liked: false,
      likedBy: [],
      likeCount: 0,
      author: { id: "u1", name: "User", email: "user@example.com" },
      createdAt: "",
      updatedAt: "",
    };

    const response: PaginatedPost = {
      docs: [trashedPost],
      pagination,
    };

    it("builds correct querystring and returns trashed posts", async () => {
      mockFetch.mockResolvedValue(mockJson(response));

      const result = await fetchTrashedPosts(2, 5);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/trash/list?page=2&limit=5",
        { credentials: "include" },
      );

      expect(result).toEqual(response);
    });

    it("supports search parameter", async () => {
      mockFetch.mockResolvedValue(mockJson(response));

      await fetchTrashedPosts(1, 7, " hello ");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/trash/list?page=1&limit=7&search=hello",
        { credentials: "include" },
      );
    });

    it("throws error when backend returns non-ok", async () => {
      mockFetch.mockResolvedValue(
        mockError(400, { message: "Failed to fetch trashed posts" }),
      );

      await expect(fetchTrashedPosts(1, 7)).rejects.toThrow(
        "Failed to fetch trashed posts",
      );
    });
  });
});
