import { http, HttpResponse } from "msw";
import type { SerializedPost } from "@/types";

let mockPosts: Record<string, SerializedPost> = {};

const buildPost = (post: SerializedPost): SerializedPost => ({
  ...post,
  likedBy: post.likedBy ?? [],
  likeCount: post.likeCount ?? 0,
  author: post.author ?? {
    id: "u1",
    name: "Dom",
    email: "dom@example.com",
  },
});

export const postViewHandlers = [
  // GET /api/posts/:id  (now supports query params)
  http.get("/api/posts/:id", ({ params }) => {
    // Option A: strip query params
    const raw = params.id as string;
    const id = raw.split("?")[0];

    const post = mockPosts[id];

    if (!post) {
      return HttpResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return HttpResponse.json(buildPost(post), { status: 200 });
  }),

  // GET /api/posts/:postId/comments/tree
  http.get("/api/posts/:postId/comments/tree", () => {
    return HttpResponse.json({ comments: [] }, { status: 200 });
  }),

  // POST /api/posts/new
  http.post("/api/posts/new", async ({ request }) => {
    const body = (await request.json()) as Partial<SerializedPost>;

    const id = String(Date.now());
    const newPost: SerializedPost = {
      id,
      title: body.title ?? "",
      slug: body.slug ?? "",
      content: body.content ?? "",
      locked: body.locked ?? true,
      status: body.status ?? "draft",
      deleted: false,
      author: body.author ?? {
        id: "u1",
        name: "Dom",
        email: "dom@example.com",
      },
      liked: false,
      likedBy: [],
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPosts[id] = buildPost(newPost);

    return HttpResponse.json(newPost, { status: 200 });
  }),

  // PUT /api/posts/:id  (also supports query params)
  http.put("/api/posts/:id", async ({ params, request }) => {
    const raw = params.id as string;
    const id = raw.split("?")[0];

    const body = (await request.json()) as Partial<SerializedPost>;

    const existing = mockPosts[id];
    if (!existing) {
      return HttpResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const updated: SerializedPost = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    mockPosts[id] = buildPost(updated);

    return HttpResponse.json(updated, { status: 200 });
  }),
];

// Utility for tests to preload posts
export function seedPost(post: SerializedPost) {
  mockPosts[post.id] = buildPost(post);
}

export function resetPosts() {
  mockPosts = {};
}
