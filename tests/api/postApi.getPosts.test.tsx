import {
  getPosts,
  getPublishedPosts,
  getFeedPosts,
  getPost,
} from "@/api/postApi";
import type { PaginatedPost, SerializedPost } from "@/types";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("postApi — getPosts & related endpoints", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockJson = (data: any) => ({
    ok: true,
    json: () => Promise.resolve(data),
  });

  const mockError = (status = 500) => ({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });

  const makePagination = (): PaginatedPost["pagination"] => ({
    totalDocs: 0,
    limit: 7,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });

  /* -------------------------------------------------------
     getPosts
  ------------------------------------------------------- */
  describe("getPosts", () => {
    it("builds correct querystring and returns data", async () => {
      const response: PaginatedPost = {
        docs: [],
        pagination: makePagination(),
      };

      (fetch as any).mockResolvedValue(mockJson(response));

      const result = await getPosts({
        page: 2,
        limit: 10,
        search: " hello ",
        status: "draft",
        deleted: "false",
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/posts?page=2&limit=10&search=hello&status=draft&deleted=false",
        { credentials: "include" },
      );

      expect(result).toEqual(response);
    });

    it("omits empty search", async () => {
      const response: PaginatedPost = {
        docs: [],
        pagination: makePagination(),
      };

      (fetch as any).mockResolvedValue(mockJson(response));

      await getPosts({ search: "   " });

      expect(fetch).toHaveBeenCalledWith("/api/posts?page=1&limit=7", {
        credentials: "include",
      });
    });

    it("throws on non-ok response", async () => {
      (fetch as any).mockResolvedValue(mockError());

      await expect(getPosts()).rejects.toThrow("Failed to fetch posts");
    });
  });

  /* -------------------------------------------------------
     getPublishedPosts
  ------------------------------------------------------- */
  describe("getPublishedPosts", () => {
    it("forces status=published and deleted=false", async () => {
      const response: PaginatedPost = {
        docs: [],
        pagination: makePagination(),
      };

      (fetch as any).mockResolvedValue(mockJson(response));

      await getPublishedPosts({ page: 3 });

      expect(fetch).toHaveBeenCalledWith(
        "/api/posts?page=3&limit=7&status=published&deleted=false",
        { credentials: "include" },
      );
    });
  });

  /* -------------------------------------------------------
     getFeedPosts
  ------------------------------------------------------- */
  describe("getFeedPosts", () => {
    it("builds correct feed querystring", async () => {
      const response: PaginatedPost = {
        docs: [],
        pagination: makePagination(),
      };

      (fetch as any).mockResolvedValue(mockJson(response));

      await getFeedPosts({ page: 2, limit: 5, search: "test" });

      expect(fetch).toHaveBeenCalledWith(
        "/api/posts/feed?page=2&limit=5&search=test",
        { credentials: "include" },
      );
    });

    it("throws on non-ok response", async () => {
      (fetch as any).mockResolvedValue(mockError());

      await expect(getFeedPosts()).rejects.toThrow(
        "Failed to fetch feed posts",
      );
    });
  });

  /* -------------------------------------------------------
     getPost
  ------------------------------------------------------- */
  describe("getPost", () => {
    it("fetches post without userId", async () => {
      const post: SerializedPost = {
        id: "1",
        title: "Test",
        slug: "test",
        content: "",
        locked: false,
        status: "published",
        deleted: false,
        liked: false,
        likedBy: [],
        likeCount: 0,
        author: {
          id: "a",
          name: "Author",
          email: "author@example.com",
        },
        createdAt: "",
        updatedAt: "",
      };

      (fetch as any).mockResolvedValue(mockJson(post));

      const result = await getPost("1");

      expect(fetch).toHaveBeenCalledWith("/api/posts/1", {
        credentials: "include",
      });

      expect(result).toEqual(post);
    });

    it("fetches post with userId", async () => {
      (fetch as any).mockResolvedValue(mockJson({}));

      await getPost("1", "user123");

      expect(fetch).toHaveBeenCalledWith("/api/posts/1?userId=user123", {
        credentials: "include",
      });
    });

    it("throws on non-ok response", async () => {
      (fetch as any).mockResolvedValue(mockError(404));

      await expect(getPost("1")).rejects.toThrow("Post not found");
    });
  });
});
