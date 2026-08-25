import { http, HttpResponse } from "msw";
import type { PaginatedPost, SerializedPost } from "@/types";

export function createFeedResponse(
  docs: SerializedPost[],
  page: number,
  limit: number,
  totalDocs: number,
): PaginatedPost {
  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    docs,
    pagination: {
      totalDocs,
      limit,
      page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
}

export const postFeedHandlers = [
  http.get("/api/posts/feed", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 7);
    const searchRaw = url.searchParams.get("search");
    const search = searchRaw ? searchRaw.trim() : undefined;

    const basePosts: SerializedPost[] = [
      {
        id: "post-1",
        title: search ? `Post matching "${search}"` : "First Published Post",
        slug: "first-post",
        locked: false,
        content: "This is the content of the first post.",
        author: {
          id: "author-1",
          name: "Catevika Author",
          email: "author@example.com",
        },
        status: "published",
        deleted: false,
        likeCount: 5,
        liked: false,
        likedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const filteredPosts =
      search && search.length > 0
        ? basePosts.filter((p) => {
            const q = search.toLowerCase();
            return (
              p.title.toLowerCase().includes(q) ||
              p.content.toLowerCase().includes(q) ||
              p.author.name.toLowerCase().includes(q) ||
              p.author.email.toLowerCase().includes(q)
            );
          })
        : basePosts;

    const totalDocs = filteredPosts.length;
    const start = (page - 1) * limit;
    const paginatedDocs = filteredPosts.slice(start, start + limit);

    return HttpResponse.json(
      createFeedResponse(paginatedDocs, page, limit, totalDocs),
    );
  }),
];
