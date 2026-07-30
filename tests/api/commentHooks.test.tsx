import { expect, describe, it, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SerializedComment } from "@/types";
import {
  updateCommentInTree,
  useComments,
  useCreateComment,
  useUpdateComment,
  useToggleCommentLike,
  useDeleteComment,
} from "@/api/commentHooks";
import { server } from "../setup/server";

// Helper to create complete SerializedComment
function createMockComment(
  id: string,
  content: string,
  likedBy: string[] = [],
  replies: SerializedComment[] = [],
): SerializedComment {
  return {
    id,
    content,
    likedBy,
    likeCount: likedBy.length,
    postId: "post-1",
    authorId: "user-1",
    author: {
      id: "user-1",
      name: "Test Author",
      email: "test@example.com",
    },
    liked: false,
    status: "active",
    parentId: null,
    depth: 0,
    replies,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Mock comment data
const mockComments: SerializedComment[] = [
  createMockComment(
    "1",
    "First comment",
    ["user-2"],
    [createMockComment("2", "Reply comment", [])],
  ),
  createMockComment("3", "Second comment", ["user-1", "user-2"]),
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  server.resetHandlers();
  queryClient.clear();
  queryClient.resetQueries();

  server.use(
    http.get("/api/posts/:postId/comments/tree", () => {
      return HttpResponse.json({ comments: mockComments });
    }),
  );
});

//
// updateCommentInTree
//
describe("updateCommentInTree", () => {
  it("updates a root-level comment", () => {
    const comments = [
      createMockComment("1", "old"),
      createMockComment("2", "test"),
    ];

    const result = updateCommentInTree(comments, "1", (c) => ({
      ...c,
      content: "updated",
    }));

    expect(result[0].content).toBe("updated");
    expect(result[1].content).toBe("test");
  });

  it("updates a nested reply", () => {
    const comments = [
      createMockComment("1", "parent", [], [createMockComment("2", "old")]),
    ];

    const result = updateCommentInTree(comments, "2", (c) => ({
      ...c,
      content: "updated",
    }));

    expect(result[0].replies?.[0].content).toBe("updated");
  });

  it("returns same array if not found", () => {
    const comments = [createMockComment("1", "test")];

    const result = updateCommentInTree(comments, "999", (c) => ({
      ...c,
      content: "updated",
    }));

    expect(result).toEqual(comments);
  });

  it("handles deeply nested replies", () => {
    const comments = [
      createMockComment(
        "1",
        "level1",
        [],
        [createMockComment("2", "level2", [], [createMockComment("3", "old")])],
      ),
    ];

    const result = updateCommentInTree(comments, "3", (c) => ({
      ...c,
      content: "updated",
    }));

    expect(result[0].replies?.[0].replies?.[0].content).toBe("updated");
  });
});

//
// useComments
//
describe("useComments", () => {
  it("fetches comments tree", async () => {
    const { result } = renderHook(() => useComments("post-1"), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual(mockComments);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches comments with userId filter", async () => {
    const { result } = renderHook(() => useComments("post-1", "user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual(mockComments);
  });
});

//
// useCreateComment
//
describe("useCreateComment", () => {
  it("creates a new comment", async () => {
    const { result } = renderHook(() => useCreateComment("post-1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ content: "New comment content" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("creates a reply with parentId", async () => {
    const { result } = renderHook(() => useCreateComment("post-1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ content: "Reply", parentId: "1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

//
// useUpdateComment
//
describe("useUpdateComment", () => {
  it("updates comment content", async () => {
    const { result } = renderHook(() => useUpdateComment("post-1", "1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ content: "Updated comment content" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("deletes comment when deleted flag is set", async () => {
    const { result } = renderHook(() => useUpdateComment("post-1", "1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ deleted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("handles update error", async () => {
    server.use(
      http.put("/api/posts/:postId/comments/:commentId", () => {
        return HttpResponse.json({ message: "Update failed" }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useUpdateComment("post-1", "1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ content: "Updated" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

//
// useToggleCommentLike
//
describe("useToggleCommentLike", () => {
  it("likes a comment", async () => {
    const { result } = renderHook(
      () => useToggleCommentLike("post-1", "3", "user-1"),
      { wrapper },
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("unlikes a comment", async () => {
    const { result } = renderHook(
      () => useToggleCommentLike("post-1", "1", "user-2"),
      { wrapper },
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws error if not logged in", async () => {
    const { result } = renderHook(
      () => useToggleCommentLike("post-1", "1", undefined),
      { wrapper },
    );

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Must be logged in to like",
    );
  });

  it("handles like error", async () => {
    server.use(
      http.post("/api/posts/:postId/comments/:commentId/like", () => {
        return HttpResponse.json({ message: "Like failed" }, { status: 500 });
      }),
    );

    const { result } = renderHook(
      () => useToggleCommentLike("post-1", "1", "user-1"),
      { wrapper },
    );

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

//
// useDeleteComment
//
describe("useDeleteComment", () => {
  it("deletes a comment", async () => {
    const { result } = renderHook(() => useDeleteComment("post-1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("handles delete error", async () => {
    server.use(
      http.delete("/api/posts/:postId/comments/:commentId", () => {
        return HttpResponse.json({ message: "Delete failed" }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useDeleteComment("post-1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
