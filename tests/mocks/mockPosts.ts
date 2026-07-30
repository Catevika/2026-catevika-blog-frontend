import type { SerializedPost } from "@/types";

export const mockPosts: SerializedPost[] = [
  {
    id: "post-1",
    title: "First Published Post",
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
  {
    id: "post-2",
    title: "Second Published Post",
    slug: "second-post",
    locked: false,
    content: "This is the content of the second post.",
    author: {
      id: "author-2",
      name: "Another Author",
      email: "another@example.com",
    },
    status: "published",
    deleted: false,
    likeCount: 3,
    liked: false,
    likedBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "post-3",
    title: "Third Published Post",
    slug: "third-post",
    locked: false,
    content: "This is the content of the third post.",
    author: {
      id: "author-1",
      name: "Catevika Author",
      email: "author@example.com",
    },
    status: "published",
    deleted: false,
    likeCount: 0,
    liked: false,
    likedBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function createUniquePosts(
  basePosts: SerializedPost[],
  suffix: string,
): SerializedPost[] {
  return basePosts.map((post, i) => ({
    ...post,
    id: `${post.id}-${suffix}-${i}`,
  }));
}

export function createFeedResponse(
  docs: SerializedPost[],
  page: number,
  limit: number,
  totalDocs: number,
): import("@/types").PaginatedPost {
  const totalPages = Math.ceil(totalDocs / limit);
  return {
    docs,
    pagination: {
      totalDocs,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
}
