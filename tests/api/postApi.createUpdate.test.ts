import { createPost, updatePost } from "@/api/postApi";
import type { SerializedPost } from "@/types";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

describe("postApi — createPost & updatePost", () => {
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
    json: () => Promise.resolve(data),
  });

  const mockError = (status: number, json: unknown = {}) => ({
    ok: false,
    status,
    json: () => Promise.resolve(json),
  });

  const mockBadJson = (status: number) => ({
    ok: false,
    status,
    json: () => Promise.reject(new Error("Invalid JSON")),
  });

  /* -------------------------------------------------------
     createPost
  ------------------------------------------------------- */
  describe("createPost", () => {
    it("sends POST with correct body and returns created post", async () => {
      const created: SerializedPost = {
        id: "1",
        title: "Hello",
        slug: "hello",
        content: "World",
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

      mockFetch.mockResolvedValue(mockJson(created));

      const result = await createPost({ title: "Hello", content: "World" });

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/new", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Hello", content: "World" }),
      });

      expect(result).toEqual(created);
    });

    it("throws error with backend message when JSON contains message", async () => {
      mockFetch.mockResolvedValue(mockError(400, { message: "Invalid title" }));

      await expect(createPost({ title: "" })).rejects.toThrow("Invalid title");
    });

    it("falls back to default error message when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue(mockBadJson(500));

      await expect(createPost({ title: "" })).rejects.toThrow(
        "Failed to create post",
      );
    });
  });

  /* -------------------------------------------------------
     updatePost
  ------------------------------------------------------- */
  describe("updatePost", () => {
    const updated: SerializedPost = {
      id: "1",
      title: "Updated",
      slug: "updated",
      content: "New content",
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

    it("sends PUT with correct body and returns updated post", async () => {
      mockFetch.mockResolvedValue(mockJson(updated));

      const result = await updatePost({ id: "1", title: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Updated" }),
      });

      expect(result).toEqual(updated);
    });

    it("throws ApiError on 409 conflict with suggestion", async () => {
      const mockResponse409 = {
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({
            message: "Slug already exists",
            suggestion: "updated-1",
          }),
        headers: new Headers(),
        statusText: "Conflict",
        url: "/api/posts/1",
      };

      mockFetch.mockResolvedValue(mockResponse409);

      await expect(
        updatePost({ id: "1", slug: "updated" }),
      ).rejects.toMatchObject({
        message: "Slug already exists",
        status: 409,
        data: { suggestion: "updated-1" },
        name: "ApiError",
      });
    });

    it("throws normal Error when backend returns message", async () => {
      mockFetch.mockResolvedValue(
        mockError(400, { message: "Invalid update" }),
      );

      await expect(updatePost({ id: "1" })).rejects.toThrow("Invalid update");
    });

    it("falls back to default error message when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue(mockBadJson(500));

      await expect(updatePost({ id: "1" })).rejects.toThrow(
        "Failed to update post",
      );
    });
  });
});
