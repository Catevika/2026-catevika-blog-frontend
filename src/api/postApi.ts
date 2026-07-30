import { ApiError } from "@/errors/ApiError";
import type {
  GetPostsFilters,
  GetPostsParams,
  LikeResponse,
  PostsResponse,
  SerializedPost,
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
): Promise<SerializedPost> => {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const url = `/api/posts/${encodeURIComponent(postId)}${qs}`;

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Post not found");
  return (await response.json()) as SerializedPost;
};

// Create post (authenticated only)
export async function createPost(
  input: Partial<SerializedPost>,
): Promise<SerializedPost> {
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

  return (await res.json()) as Promise<SerializedPost>;
}

// Update post (authenticated & author only)
export async function updatePost(
  postData: { id: string } & Partial<SerializedPost>,
): Promise<SerializedPost> {
  const { id, ...data } = postData;

  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let json: Record<string, unknown> | null = null;

    try {
      const raw = (await res.json()) as unknown;

      if (typeof raw === "object" && raw !== null) {
        json = raw as Record<string, unknown>;
      }
    } catch {
      // ignore JSON parse errors
    }

    const message =
      typeof json?.message === "string"
        ? json.message
        : "Failed to update post";

    if (res.status === 409) {
      throw new ApiError(message, 409, json);
    }

    throw new Error(message);
  }

  return (await res.json()) as SerializedPost;
}

// Soft delete - set deleted: true
export async function softDeletePost(id: string): Promise<SerializedPost> {
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

  return (await res.json()) as SerializedPost;
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
export async function restorePost(id: string): Promise<SerializedPost> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}/restore`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to restore post. Please try again.");
  }

  return (await res.json()) as SerializedPost;
}

// Like post
export const likePost = async (
  postId: string,
  userId?: string,
): Promise<LikeResponse> => {
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

  return (await res.json()) as LikeResponse;
};

// Fetch favorite posts
export const fetchFavoritesPosts = async (): Promise<{
  docs: SerializedPost[];
}> => {
  const response = await fetch("/api/posts/favorites", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorite posts");
  }

  const json = (await response.json()) as { docs: SerializedPost[] };

  return { docs: json.docs };
};
