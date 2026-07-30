import { http, HttpResponse } from "msw";
import type { SerializedPost } from "@/types";

let posts: SerializedPost[] = [];

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
export function resetPosts() {
  posts = [];
}

export function seedPublished(list: SerializedPost[]) {
  list.forEach((p) =>
    posts.push({ ...p, status: "published", deleted: false }),
  );
}

export function seedInProgress(list: SerializedPost[]) {
  list.forEach((p) => posts.push({ ...p, status: "draft", deleted: false }));
}

export function seedTrashed(list: SerializedPost[]) {
  list.forEach((p) => posts.push({ ...p, deleted: true }));
}

function paginate(docs: SerializedPost[], page: number, limit: number) {
  const totalDocs = docs.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    docs: docs.slice(start, end),
    pagination: {
      page,
      limit,
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/* -------------------------------------------------------
   Handlers
------------------------------------------------------- */
export const postListHandlers = [
  /* -------------------------
     GET /api/posts
  ------------------------- */
  http.get("/api/posts", ({ request }) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 7);
    const status = url.searchParams.get("status");
    const deleted = url.searchParams.get("deleted");
    const author = url.searchParams.get("author");
    const search = url.searchParams.get("search")?.toLowerCase();

    let filtered = posts;

    if (status) filtered = filtered.filter((p) => p.status === status);
    if (deleted !== null)
      filtered = filtered.filter((p) => String(p.deleted) === deleted);
    if (author) filtered = filtered.filter((p) => p.author?.id === author);
    if (search)
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search),
      );

    return HttpResponse.json(paginate(filtered, page, limit));
  }),

  /* -------------------------
     GET /api/posts/trash/list
  ------------------------- */
  http.get("/api/posts/trash/list", ({ request }) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 7);
    const search = url.searchParams.get("search")?.toLowerCase();

    let filtered = posts.filter((p) => p.deleted === true);

    if (search)
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search),
      );

    return HttpResponse.json(paginate(filtered, page, limit));
  }),

  /* -------------------------
     POST /api/posts/:id/restore
  ------------------------- */
  http.post("/api/posts/:id/restore", ({ params }) => {
    const id = params.id as string;

    const post = posts.find((p) => p.id === id);
    if (!post) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }

    post.deleted = false;

    return HttpResponse.json(post);
  }),
];
