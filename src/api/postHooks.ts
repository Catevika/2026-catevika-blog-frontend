import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import type {
  GetPostsParams,
  Post,
  PaginatedPost,
  PostsResponse,
  LikePostResponse,
  LikeMutationContext,
} from "@/types/index.js";
import {
  createPost,
  fetchFavoritesPosts,
  getPost,
  getPublishedPosts,
  getPosts,
  getFeedPosts,
  likePost,
  restorePost,
  softDeletePost,
  updatePost,
  fetchTrashedPosts,
} from "@/api/postApi.js";

// Type guard: narrow PostsResponse -> PaginatedPost
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
   PAGINATED PUBLISHED POSTS (PUBLIC)
------------------------------------------------------- */
export const usePublishedPostsQuery = (params: GetPostsParams = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["publishedPosts", { page, limit, search }],
    queryFn: async () => {
      const data = await getPublishedPosts({ page, limit, search });
      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        void queryClient.prefetchQuery({
          queryKey: ["publishedPosts", { page: page + 1, limit, search }],
          queryFn: () => getPublishedPosts({ page: page + 1, limit, search }),
        });
      }

      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5000,
  });
};

/* -------------------------------------------------------
   PAGINATED FEED POSTS (PUBLIC)
   Backend route: GET /api/posts/feed
------------------------------------------------------- */
export const useFeedPostsQuery = (params: GetPostsParams = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["feedPosts", { page, limit, search }],
    queryFn: async () => {
      const data = await getFeedPosts({ page, limit, search });
      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        void queryClient.prefetchQuery({
          queryKey: ["feedPosts", { page: page + 1, limit, search }],
          queryFn: () => getFeedPosts({ page: page + 1, limit, search }),
        });
      }

      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5000,
  });
};

/* -------------------------------------------------------
   PAGINATED IN-PROGRESS POSTS (AUTH ONLY)
   (status = draft, author = current user, deleted = false)
------------------------------------------------------- */
export const useInProgressPostsQuery = (
  params: GetPostsParams & { author?: string } = {},
) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 7, search, author } = params;

  return useQuery<PaginatedPost, Error>({
    queryKey: ["inProgressPosts", { page, limit, search, author }],
    enabled: true,
    queryFn: async () => {
      const data = await getPosts({
        page,
        limit,
        search,
        status: "draft",
        deleted: "false",
        ...(author ? { author } : {}),
      });

      assertPaginatedPost(data);

      if (data.pagination.hasNextPage) {
        void queryClient.prefetchQuery({
          queryKey: [
            "inProgressPosts",
            { page: page + 1, limit, search, author },
          ],
          queryFn: () =>
            getPosts({
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
    placeholderData: undefined, // prevents showing stale Published posts
  });
};

/* -------------------------------------------------------
   PAGINATED TRASHED POSTS (AUTH ONLY)
   Uses dedicated trash route
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
      const data = await fetchTrashedPosts(page, limit, search);
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

  return useMutation<Post, Error, Partial<Post>>({
    mutationFn: createPost,
    onSuccess: async (created) => {
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

  return useMutation<Post, Error, { id: string } & Partial<Post>>({
    mutationFn: updatePost,
    onSuccess: async (updatedPost) => {
      queryClient.setQueriesData(
        { queryKey: ["post", updatedPost.id] },
        updatedPost,
      );

      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useSoftDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, string>({
    mutationFn: softDeletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useRestorePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, string>({
    mutationFn: restorePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
    },
  });
};

export const useLikePostMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation<
    LikePostResponse,
    Error,
    { postId: string },
    LikeMutationContext
  >({
    mutationFn: ({ postId }: { postId: string }) => {
      if (!userId) throw new Error("Must be logged in to like");
      return likePost(postId, userId);
    },

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId, userId] });

      const previousPost = queryClient.getQueryData<Post>([
        "post",
        postId,
        userId,
      ]);

      queryClient.setQueryData<Post | undefined>(
        ["post", postId, userId],
        (old) => {
          if (!old || !userId) return old;

          const isLiked = old.likedBy.includes(userId);

          return {
            ...old,
            liked: !isLiked,
            likeCount: isLiked ? old.likeCount - 1 : old.likeCount + 1,
            likedBy: isLiked
              ? old.likedBy.filter((id) => id !== userId)
              : [...old.likedBy, userId],
          };
        },
      );

      // Return the typed context so onError receives it
      return { previousPost };
    },

    onError: (error, variables, context) => {
      console.error("Like failed:", error);
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["post", variables.postId, userId],
          context.previousPost,
        );
      }
    },

    onSuccess: async (data, variables) => {
      queryClient.setQueryData<Post | undefined>(
        ["post", variables.postId, userId],
        (old) =>
          old
            ? {
                ...old,
                liked: data.liked,
                likedBy: data.likedBy,
                likeCount: data.likeCount,
              }
            : old,
      );

      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useFavoritesPosts = () => {
  return useQuery<{ topPosts: Post[] }, Error>({
    queryKey: ["favorites-posts"],
    queryFn: fetchFavoritesPosts,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSinglePostQuery = (postId: string, userId?: string) => {
  return useQuery<Post, Error>({
    queryKey: ["post", postId, userId],
    queryFn: () => getPost(postId, userId),
    enabled: !!postId,
  });
};
