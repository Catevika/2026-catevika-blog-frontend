import * as postApi from "@/api/postApi";
import { useAuthStore } from "@/stores/authStore";
import type {
  GetPostsParams,
  LikeResponse,
  PaginatedPost,
  PostsResponse,
  SerializedPost,
} from "@/types/index.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Type guard
function assertPaginatedPost(
  value: PostsResponse,
): asserts value is PaginatedPost {
  if (
    typeof value !== "object" ||
    value === null ||
    !("pagination" in value) ||
    !("docs" in value)
  ) {
    const maybeErr = value as { error?: unknown };
    const message =
      typeof maybeErr?.error === "string"
        ? maybeErr.error
        : "Unexpected posts response";
    throw new Error(message);
  }
}

/* -------------------------------------------------------
   PAGINATED PUBLISHED POSTS
------------------------------------------------------- */
export const usePublishedPostsQuery = (params: GetPostsParams = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["publishedPosts", { page, limit, search }],
    queryFn: async () => {
      const data = await postApi.getPublishedPosts({ page, limit, search });
      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        await queryClient.prefetchQuery({
          queryKey: ["publishedPosts", { page: page + 1, limit, search }],
          queryFn: () =>
            postApi.getPublishedPosts({ page: page + 1, limit, search }),
        });
      }

      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5000,
  });
};

/* -------------------------------------------------------
   PAGINATED FEED POSTS
------------------------------------------------------- */
export const useFeedPostsQuery = (params: GetPostsParams = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["feedPosts", { page, limit, search }],
    queryFn: async () => {
      const data = await postApi.getFeedPosts({ page, limit, search });
      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        await queryClient.prefetchQuery({
          queryKey: ["feedPosts", { page: page + 1, limit, search }],
          queryFn: () =>
            postApi.getFeedPosts({ page: page + 1, limit, search }),
        });
      }

      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5000,
  });
};

/* -------------------------------------------------------
   PAGINATED IN-PROGRESS POSTS
------------------------------------------------------- */
export const useInProgressPostsQuery = (
  params: GetPostsParams & { author?: string } = {},
) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search, author } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["inProgressPosts", { page, limit, search, author }],
    queryFn: async () => {
      const data = await postApi.getPosts({
        page,
        limit,
        search,
        status: "draft",
        deleted: "false",
        ...(author ? { author } : {}),
      });

      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        await queryClient.prefetchQuery({
          queryKey: [
            "inProgressPosts",
            { page: page + 1, limit, search, author },
          ],
          queryFn: () =>
            postApi.getPosts({
              page: page + 1,
              limit,
              search,
              status: "draft",
              deleted: "false",
              ...(author ? { author } : {}),
            }),
        });
      }

      return data;
    },
    placeholderData: undefined,
  });
};

/* -------------------------------------------------------
   PAGINATED TRASHED POSTS
------------------------------------------------------- */
export const useTrashedPostsQuery = ({
  page = 1,
  limit = 7,
  search,
}: GetPostsParams) => {
  return useQuery<PaginatedPost, Error>({
    queryKey: ["trashPosts", page, limit, search],
    retry: false,
    queryFn: async () => {
      const data = await postApi.fetchTrashedPosts(page, limit, search);
      assertPaginatedPost(data);
      return data;
    },
    placeholderData: (prev) => prev,
  });
};

/* -------------------------------------------------------
   CREATE / UPDATE / DELETE / RESTORE / LIKE
------------------------------------------------------- */
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SerializedPost, Error, Partial<SerializedPost>>({
    mutationFn: postApi.createPost,
    onSuccess: async (created) => {
      if (!created || typeof created !== "object") return;

      if (created.status === "published") {
        await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      }

      queryClient.setQueryData(["post", created.id], created);
    },
  });
};

export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SerializedPost,
    Error,
    { id: string } & Partial<SerializedPost>
  >({
    mutationFn: postApi.updatePost,
    onSuccess: async (updatedPost) => {
      queryClient.setQueryData(["post", updatedPost.id], updatedPost);

      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useSoftDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SerializedPost, Error, string>({
    mutationFn: postApi.softDeletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useRestorePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SerializedPost, Error, string>({
    mutationFn: postApi.restorePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useLikePostMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation<
    LikeResponse,
    Error,
    { postId: string },
    { previousPost?: SerializedPost }
  >({
    mutationFn: async ({ postId }) => {
      if (!userId) throw new Error("Must be logged in to like");
      return postApi.likePost(postId, userId);
    },

    onMutate: async ({ postId }) => {
      if (!userId) return {};

      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPost = queryClient.getQueryData<SerializedPost>([
        "post",
        postId,
      ]);

      // Optimistic update for single post
      queryClient.setQueryData<SerializedPost>(["post", postId], (old) => {
        if (!old) return old;

        const isLiked = old.likedBy.includes(userId);
        const newLikedBy = isLiked
          ? old.likedBy.filter((id) => id !== userId)
          : [...old.likedBy, userId];

        return {
          ...old,
          likedBy: newLikedBy,
          likeCount: newLikedBy.length,
        };
      });

      // Optimistic update for lists
      const updateList = (key: readonly unknown[]) => {
        queryClient.setQueryData<PaginatedPost>(key, (old) => {
          if (!old) return old;

          return {
            ...old,
            docs: old.docs.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likedBy: p.likedBy.includes(userId)
                      ? p.likedBy.filter((id) => id !== userId)
                      : [...p.likedBy, userId],
                    likeCount: p.likedBy.includes(userId)
                      ? p.likeCount - 1
                      : p.likeCount + 1,
                  }
                : p,
            ),
          };
        });
      };

      updateList(["publishedPosts"]);
      updateList(["feedPosts"]);
      updateList(["inProgressPosts"]);

      return { previousPost };
    },

    onError: (_err, { postId }, ctx) => {
      if (ctx?.previousPost) {
        queryClient.setQueryData(["post", postId], ctx.previousPost);
      }
    },

    onSuccess: async (data, { postId }) => {
      queryClient.setQueryData<SerializedPost>(["post", postId], (old) =>
        old
          ? {
              ...old,
              likedBy: data.likedBy,
              likeCount: data.likeCount,
            }
          : old,
      );

      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
};

export const useFavoritesPosts = () => {
  return useQuery<{ docs: SerializedPost[] }, Error>({
    queryKey: ["favorites-posts"],
    queryFn: async () => {
      const data = await postApi.fetchFavoritesPosts();
      return {
        docs: [...data.docs]
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 5),
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSinglePostQuery = (postId: string, userId?: string) => {
  return useQuery<SerializedPost | undefined, Error>({
    queryKey: ["post", postId],
    queryFn: () => postApi.getPost(postId, userId),
    enabled: !!postId,
  });
};
