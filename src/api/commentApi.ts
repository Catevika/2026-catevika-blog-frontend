import type { Comment, LikeResponse, SerializedComment } from "@/types";

const COMMENTS_BASE = (postId: string) => `/api/posts/${postId}/comments`;

export async function getCommentsTree(
  postId: string,
  userId?: string,
): Promise<SerializedComment[]> {
  const searchParams = new URLSearchParams({
    ...(userId && { userId }),
  });

  const response = await fetch(
    `${COMMENTS_BASE(postId)}/tree?${searchParams}`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch comment tree");
  }

  const data = (await response.json()) as { comments: SerializedComment[] };
  return data.comments;
}

export const createComment = async (
  postId: string,
  commentData: { content: string; parentId?: string },
): Promise<Comment> => {
  const response = await fetch(COMMENTS_BASE(postId), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) throw new Error(`Failed to create comment`);
  return response.json() as Promise<Comment>;
};

export const updateComment = async (
  postId: string,
  commentId: string,
  updateData: { content?: string; deleted?: boolean },
): Promise<Comment> => {
  const response = await fetch(`${COMMENTS_BASE(postId)}/${commentId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) throw new Error(`Failed to update comment`);
  return response.json() as Promise<Comment>;
};

export const toggleCommentLike = async (
  postId: string,
  commentId: string,
): Promise<LikeResponse> => {
  const response = await fetch(`${COMMENTS_BASE(postId)}/${commentId}/like`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Failed to toggle like`);
  return response.json() as Promise<LikeResponse>;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete comment");
  }

  return (await res.json()) as Promise<void>;
};
