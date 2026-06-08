import {
  createComment,
  deleteComment,
  getCommentsTree,
  toggleCommentLike,
  updateComment,
} from "@/api/commentApi";
import type { SerializedComment } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Recursively updates a comment inside a nested comment tree
function updateCommentInTree(
  comments: SerializedComment[],
  commentId: string,
  updater: (c: SerializedComment) => SerializedComment,
): SerializedComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      };
    }

    return comment;
  });
}

// Fetch the full nested comment tree
export function useComments(postId: string, userId?: string) {
  return useQuery<SerializedComment[]>({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsTree(postId, userId),
    staleTime: 5 * 60 * 1000,
  });
}

// Create a new comment or reply
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      createComment(postId, data),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// Edit or delete a comment inside a nested tree
export function useUpdateComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content?: string; deleted?: boolean }) =>
      updateComment(postId, commentId, data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previous = queryClient.getQueryData<SerializedComment[]>([
        "comments",
        postId,
      ]);

      if (!previous) return { previous };

      // DELETE
      if (data.deleted) {
        const remove = (list: SerializedComment[]): SerializedComment[] =>
          list
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies ? remove(c.replies) : [],
            }));

        queryClient.setQueryData(["comments", postId], remove(previous));
      }

      // EDIT
      if (data.content !== undefined) {
        queryClient.setQueryData(
          ["comments", postId],
          (old: SerializedComment[]) =>
            updateCommentInTree(old ?? [], commentId, (c) => ({
              ...c,
              content: data.content!,
            })),
        );
      }

      return { previous };
    },

    onError: (_err, _data, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["comments", postId], ctx.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// Optimistic like toggle inside a nested tree
export function useToggleCommentLike(
  postId: string,
  commentId: string,
  userId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleCommentLike(postId, commentId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previous = queryClient.getQueryData<SerializedComment[]>([
        "comments",
        postId,
      ]);

      if (!previous || !userId) return { previous };

      queryClient.setQueryData(
        ["comments", postId],
        (old: SerializedComment[] | undefined) =>
          updateCommentInTree(old ?? [], commentId, (c) => {
            const alreadyLiked = c.likedBy.includes(userId);

            return {
              ...c,
              liked: !alreadyLiked,
              likeCount: alreadyLiked ? c.likeCount - 1 : c.likeCount + 1,
              likedBy: alreadyLiked
                ? c.likedBy.filter((id) => id !== userId)
                : [...c.likedBy, userId],
            };
          }),
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["comments", postId], ctx.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(postId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}
