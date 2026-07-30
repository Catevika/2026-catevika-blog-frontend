import { likePost, fetchFavoritesPosts } from "@/api/postApi";
import type { LikeResponse, SerializedComment, SerializedPost } from "@/types";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

describe("postApi — likePost & favorites (5 top liked posts)", () => {
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
     likePost
  ------------------------------------------------------- */
  describe("likePost", () => {
    const mockComment: SerializedComment = {
      id: "c1",
      content: "",
      postId: "123",
      authorId: "u1",
      author: { id: "u1", name: "User", email: "user@example.com" },
      liked: false,
      likedBy: [],
      likeCount: 0,
      status: "ok",
      parentId: null,
      depth: 0,
      deleted: false,
      createdAt: "",
      updatedAt: "",
    };

    it("sends POST with correct body and returns LikeResponse", async () => {
      const response: LikeResponse = {
        success: true,
        userId: "u1",
        liked: true,
        likedBy: ["u1"],
        likeCount: 1,
        comment: mockComment,
      };

      mockFetch.mockResolvedValue(mockJson(response));

      const result = await likePost("123", "u1");

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/123/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: "u1" }),
      });

      expect(result).toEqual(response);
    });

    it("throws error when backend returns non-ok", async () => {
      mockFetch.mockResolvedValue(mockError(400));

      await expect(likePost("123", "u1")).rejects.toThrow(
        "Failed to toggle like",
      );
    });
  });

  /* -------------------------------------------------------
   fetchFavoritesPosts (Top 5 most liked)
------------------------------------------------------- */
  /* -------------------------------------------------------
fetchFavoritesPosts (Top 5 most liked)
------------------------------------------------------- */
  describe("fetchFavoritesPosts", () => {
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
      author: { id: "u1", name: "User", email: "user@example.com" },
      createdAt: "",
      updatedAt: "",
    });

    // These SHOULD appear
    const top5 = [
      makePost("1", 100),
      makePost("2", 90),
      makePost("3", 80),
      makePost("4", 70),
      makePost("5", 60),
    ];

    // These SHOULD NOT appear
    const others = [
      makePost("6", 50),
      makePost("7", 40),
      makePost("8", 30),
      makePost("9", 20),
      makePost("10", 10),
    ];

    it("returns ONLY the top 5 most liked posts sorted by likeCount DESC", async () => {
      // Backend returns only the top 5
      mockFetch.mockResolvedValue(mockJson({ docs: top5 }));

      const result = await fetchFavoritesPosts();

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/favorites", {
        credentials: "include",
      });

      // Must return exactly 5 posts
      expect(result.docs).toHaveLength(5);

      // Must be sorted by likeCount descending
      const likeCounts = result.docs.map((p) => p.likeCount);
      expect(likeCounts).toEqual([100, 90, 80, 70, 60]);

      // Must NOT include any lower-ranked posts
      const returnedIds = result.docs.map((p) => p.id);
      for (const p of others) {
        expect(returnedIds).not.toContain(p.id);
      }
    });

    it("throws error when backend returns non-ok", async () => {
      mockFetch.mockResolvedValue(mockError(500));

      await expect(fetchFavoritesPosts()).rejects.toThrow(
        "Failed to fetch favorite posts",
      );
    });
  });
});
