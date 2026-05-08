import type {
  GetPostsParams,
  Post,
  PostsResponse,
  LikePostResponse,
  GetPostsFilters,
} from "@/types/index.js";

// Generic getPosts helper that calls /api/posts with arbitrary filters.
// Use for published and in-progress queries by passing status and author.

export const getPosts = async (
  params: GetPostsFilters = {},
): Promise<PostsResponse> => {
  const { page = 1, limit = 7, search, ...rest } = params;

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (typeof search === "string" && search.trim().length > 0) {
    qs.set("search", search.trim());
  }

  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      qs.set(k, String(v));
    }
  });

  const res = await fetch(`/api/posts?${qs.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch posts");
  return (await res.json()) as PostsResponse;
};

// Convenience wrapper for published posts.
// Matches backend expectation: status=published, deleted=false
export const getPublishedPosts = async (
  params: GetPostsParams = {},
): Promise<PostsResponse> => {
  return getPosts({
    ...params,
    status: "published",
    deleted: "false",
  });
};

// Get posts for feed (sorted by createdAt)
export const getFeedPosts = async (
  params: GetPostsParams = {},
): Promise<PostsResponse> => {
  const { page = 1, limit = 7, search } = params;

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (typeof search === "string" && search.trim().length > 0) {
    qs.set("search", search.trim());
  }

  const res = await fetch(`/api/posts/feed?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch feed posts");
  return (await res.json()) as PostsResponse;
};

// Get single post (public)
export const getPost = async (
  postId: string,
  userId?: string,
): Promise<Post> => {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const url = `/api/posts/${encodeURIComponent(postId)}${qs}`;

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Post not found");
  return (await response.json()) as Post;
};

// Create post (authenticated only)
export async function createPost(input: Partial<Post>): Promise<Post> {
  const res = await fetch("/api/posts/new", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let message = "Failed to create post";
    try {
      const err = (await res.json()) as { message?: string };
      if (err?.message) message = err.message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  return (await res.json()) as Post;
}

// Update post (authenticated & author only)
export async function updatePost(
  postData: { id: string } & Partial<Post>,
): Promise<Post> {
  const { id, ...data } = postData;

  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to update post. Please try again.");
  }

  return (await res.json()) as Post;
}

// Soft delete - set deleted: true
export async function softDeletePost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deleted: true }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to move post to trash. Please try again.");
  }

  return (await res.json()) as Post;
}

// Fetch trashed posts
export async function fetchTrashedPosts(
  page: number,
  limit: number,
  search?: string,
): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (typeof search === "string" && search.trim().length > 0)
    params.append("search", search.trim());

  const res = await fetch(`/api/posts/trash/list?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch trashed posts");
  return (await res.json()) as PostsResponse;
}

// Restore post
export async function restorePost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}/restore`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to restore post. Please try again.");
  }

  return (await res.json()) as Post;
}

// Like post
export const likePost = async (
  postId: string,
  userId?: string,
): Promise<LikePostResponse> => {
  const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    throw new Error("Failed to toggle like");
  }

  return (await res.json()) as LikePostResponse;
};

// Fetch favorite posts
export const fetchFavoritesPosts = async (): Promise<{ topPosts: Post[] }> => {
  const response = await fetch("/api/posts/favorites", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch favorite posts");
  }
  return (await response.json()) as { topPosts: Post[] };
};
