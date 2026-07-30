import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

// Mock fetch before importing the API
const mockFetch = vi.fn();
beforeAll(() => {
  vi.stubGlobal("fetch", mockFetch);
});

import {
  createComment,
  deleteComment,
  getCommentsTree,
  toggleCommentLike,
  updateComment,
} from "@/api/commentApi";
import { cleanup } from "@testing-library/react";

describe("commentApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("getCommentsTree", () => {
    it("should fetch comments tree with userId", async () => {
      const mockComments = [
        {
          id: "1",
          content: "Test comment",
          authorId: "user1",
          author: { id: "user1", name: "John", email: "john@example.com" },
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          depth: 0,
          parentId: null,
          deleted: false,
          replies: [],
          postId: "post1",
          liked: false,
          likedBy: [],
          likeCount: 0,
          status: "active",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comments: mockComments }),
      });

      const result = await getCommentsTree("post1", "user1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/post1/comments/tree?userId=user1",
        { credentials: "include" },
      );
      expect(result).toEqual(mockComments);
    });

    it("should fetch comments tree without userId", async () => {
      const mockComments = [
        {
          id: "1",
          content: "Test comment",
          authorId: "user1",
          author: { id: "user1", name: "John", email: "john@example.com" },
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          depth: 0,
          parentId: null,
          deleted: false,
          replies: [],
          postId: "post1",
          liked: false,
          likedBy: [],
          likeCount: 0,
          status: "active",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comments: mockComments }),
      });

      const result = await getCommentsTree("post1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/post1/comments/tree?",
        { credentials: "include" },
      );
      expect(result).toEqual(mockComments);
    });

    it("should throw error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getCommentsTree("post1")).rejects.toThrow(
        "Failed to fetch comment tree",
      );
    });
  });

  describe("createComment", () => {
    it("should create a comment", async () => {
      const mockComment = {
        id: "1",
        content: "New comment",
        authorId: "user1",
        author: { id: "user1", name: "John", email: "john@example.com" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        depth: 0,
        parentId: null,
        deleted: false,
        replies: [],
        postId: "post1",
        liked: false,
        likedBy: [],
        likeCount: 0,
        status: "active",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await createComment("post1", {
        content: "New comment",
        parentId: "parent1",
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/posts/post1/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "New comment", parentId: "parent1" }),
      });
      expect(result).toEqual(mockComment);
    });

    it("should throw error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(createComment("post1", { content: "Test" })).rejects.toThrow(
        "Failed to create comment",
      );
    });
  });

  describe("updateComment", () => {
    it("should update a comment", async () => {
      const mockComment = {
        id: "1",
        content: "Updated comment",
        authorId: "user1",
        author: { id: "user1", name: "John", email: "john@example.com" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        depth: 0,
        parentId: null,
        deleted: false,
        replies: [],
        postId: "post1",
        liked: false,
        likedBy: [],
        likeCount: 0,
        status: "active",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await updateComment("post1", "comment1", {
        content: "Updated comment",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/post1/comments/comment1",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Updated comment" }),
        },
      );
      expect(result).toEqual(mockComment);
    });

    it("should throw error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        updateComment("post1", "comment1", { content: "Test" }),
      ).rejects.toThrow("Failed to update comment");
    });
  });

  describe("toggleCommentLike", () => {
    it("should toggle comment like", async () => {
      const mockLikeResponse = {
        liked: true,
        likeCount: 1,
        likedBy: ["user1"],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLikeResponse,
      });

      const result = await toggleCommentLike("post1", "comment1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/post1/comments/comment1/like",
        {
          method: "POST",
          credentials: "include",
        },
      );
      expect(result).toEqual(mockLikeResponse);
    });

    it("should throw error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(toggleCommentLike("post1", "comment1")).rejects.toThrow(
        "Failed to toggle like",
      );
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {},
      });

      await deleteComment("post1", "comment1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/posts/post1/comments/comment1",
        {
          method: "DELETE",
          credentials: "include",
        },
      );
    });

    it("should throw error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(deleteComment("post1", "comment1")).rejects.toThrow(
        "Failed to delete comment",
      );
    });
  });
});
