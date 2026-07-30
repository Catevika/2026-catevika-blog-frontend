import { http, HttpResponse } from "msw";

export const commentHandlers = [
  // GET /api/posts/:postId/comments/tree
  http.get("/api/posts/:postId/comments/tree", () => {
    return HttpResponse.json({
      comments: [],
    });
  }),

  // POST /api/posts/:postId/comments
  http.post("/api/posts/:postId/comments", async ({ request, params }) => {
    const { postId } = params;
    const body = (await request.json()) as {
      content: string;
      parentId?: string;
    };

    const newComment = {
      id: String(Date.now()),
      content: body.content,
      authorId: "u1",
      author: { id: "u1", name: "Dom", email: "dom@example.com" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      depth: 0,
      parentId: body.parentId ?? null,
      deleted: false,
      replies: [],
      postId,
      liked: false,
      likedBy: [],
      likeCount: 0,
      status: "active",
    };

    return HttpResponse.json(newComment);
  }),

  // PUT /api/posts/:postId/comments/:commentId
  http.put(
    "/api/posts/:postId/comments/:commentId",
    async ({ request, params }) => {
      const { postId, commentId } = params;
      const body = (await request.json()) as {
        content?: string;
        deleted?: boolean;
      };

      const updatedComment = {
        id: commentId,
        content: body.content ?? "Updated comment",
        authorId: "u1",
        author: { id: "u1", name: "Dom", email: "dom@example.com" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        depth: 0,
        parentId: null,
        deleted: body.deleted ?? false,
        replies: [],
        postId,
        liked: false,
        likedBy: [],
        likeCount: 0,
        status: "active",
      };

      return HttpResponse.json(updatedComment);
    },
  ),

  // POST /api/posts/:postId/comments/:commentId/like
  http.post("/api/posts/:postId/comments/:commentId/like", () => {
    return HttpResponse.json({
      liked: true,
      likeCount: 1,
      likedBy: ["u1"],
    });
  }),

  // DELETE /api/posts/:postId/comments/:commentId
  http.delete("/api/posts/:postId/comments/:commentId", () => {
    return HttpResponse.json({});
  }),
];
