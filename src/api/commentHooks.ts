import {
  createComment,
  deleteComment,
  getCommentsTree,
  toggleCommentLike,
  updateComment,
} from "@/api/commentApi";
import type { LikeResponse, SerializedComment } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function updateCommentInTree(
  comments: SerializedComment[],
  targetId: string,
  updater: (c: SerializedComment) => SerializedComment,
): SerializedComment[] {
  let changed = false;

  const newComments = comments.map((c) => {
    if (c.id === targetId) {
      changed = true;
      return updater(c);
    }

    if (c.replies?.length) {
      const updatedReplies = updateCommentInTree(c.replies, targetId, updater);

      if (updatedReplies !== c.replies) {
        changed = true;
        return { ...c, replies: updatedReplies };
      }
    }

    return c;
  });

  return changed ? newComments : [...newComments];
}

export function useComments(postId: string, userId?: string) {
  return useQuery<SerializedComment[]>({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsTree(postId, userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      createComment(postId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },
  });
}

export function useUpdateComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content?: string; deleted?: boolean }) =>
      updateComment(postId, commentId, data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", postId],
        exact: false,
      });

      const previous = queryClient.getQueryData<SerializedComment[]>([
        "comments",
        postId,
      ]);

      if (!previous) return { previous };

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

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },
  });
}

export function useToggleCommentLike(
  postId: string,
  commentId: string,
  userId?: string,
  parentId?: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<
    LikeResponse,
    Error,
    void,
    { previousComments?: SerializedComment[] }
  >({
    mutationFn: async () => {
      if (!userId) throw new Error("Must be logged in to like");
      return toggleCommentLike(postId, commentId);
    },

    onMutate: async () => {
      if (!userId) return {};

      await queryClient.cancelQueries({
        queryKey: ["comments", postId],
        exact: false,
      });

      const previousComments = queryClient.getQueryData<SerializedComment[]>([
        "comments",
        postId,
      ]);

      if (!previousComments) return { previousComments };

      const updated = updateCommentInTree(previousComments, commentId, (c) => {
        const alreadyLiked = c.likedBy.includes(userId);
        const newLikedBy = alreadyLiked
          ? c.likedBy.filter((id) => id !== userId)
          : [...c.likedBy, userId];

        return {
          ...c,
          likedBy: newLikedBy,
          likeCount: newLikedBy.length,
        };
      });

      const updatedWithParent =
        parentId != null
          ? updateCommentInTree(updated, parentId, (p) => ({ ...p }))
          : updated;

      queryClient.setQueryData(["comments", postId], updatedWithParent);

      return { previousComments };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousComments) {
        queryClient.setQueryData(["comments", postId], ctx.previousComments);
      }
    },

    onSuccess: async (data) => {
      queryClient.setQueryData<SerializedComment[]>(
        ["comments", postId],
        (old) =>
          old
            ? updateCommentInTree(old, commentId, (c) => ({
                ...c,
                likedBy: data.likedBy,
                likeCount: data.likeCount,
              }))
            : old,
      );

      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(postId, commentId),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
        exact: false,
      });
    },
  });
}
