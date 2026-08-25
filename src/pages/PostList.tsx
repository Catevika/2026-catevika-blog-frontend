import {
  useInProgressPostsQuery,
  usePublishedPostsQuery,
  useRestorePostMutation,
  useTrashedPostsQuery,
} from "@/api/postHooks";
import AuthorForList from "@/components/AuthorForList";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomNewButton from "@/components/CustomNewButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import PostListItemEdit from "@/components/PostListItemEdit";
import PostsPagination from "@/components/PostsPagination";
import TypographyH1 from "@/components/TypographyH1";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/useDebounce";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedPost, PostsResponse, SerializedPost } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { LiaTrashRestoreAltSolid } from "react-icons/lia";
import { Link, useNavigate, useSearchParams } from "react-router";

// Type guard: PostsResponse may be PaginatedPost or { error: string }
function isPaginatedPost(
  value: PostsResponse | undefined,
): value is PaginatedPost {
  return Boolean(
    value &&
    typeof value === "object" &&
    "pagination" in value &&
    "docs" in value,
  );
}

const DEFAULT_LIMIT = 7;

export default function PostList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  useScrollRestoration();

  const page = Number(searchParams.get("page") ?? 1);
  const inProgressPage = Number(searchParams.get("inProgressPage") ?? 1);
  const deletedPage = Number(searchParams.get("deletedPage") ?? 1);

  const limit = DEFAULT_LIMIT;

  /* -------------------------
     Queries
  ------------------------- */

  const publishedQuery = usePublishedPostsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const inProgressQuery = useInProgressPostsQuery({
    page: inProgressPage,
    limit,
    search: debouncedSearch || undefined,
    author: user?.id,
  });

  const trashedQuery = useTrashedPostsQuery({
    page: deletedPage,
    limit,
    search: debouncedSearch || undefined,
  });

  const restoreMutation = useRestorePostMutation();

  /* -------------------------
     Derived lists (safely narrowed)
  ------------------------- */

  const publishedData = publishedQuery.data;
  const publishedPosts: SerializedPost[] = isPaginatedPost(publishedData)
    ? publishedData.docs
    : [];
  const publishedPagination = isPaginatedPost(publishedData)
    ? publishedData.pagination
    : undefined;

  const inProgressData = inProgressQuery.data;
  const inProgressPosts: SerializedPost[] = isPaginatedPost(inProgressData)
    ? inProgressData.docs
    : [];
  const inProgressPagination = isPaginatedPost(inProgressData)
    ? inProgressData.pagination
    : undefined;

  const trashedData = trashedQuery.data;
  const trashedPosts: SerializedPost[] = isPaginatedPost(trashedData)
    ? trashedData.docs
    : [];
  const trashedPagination = isPaginatedPost(trashedData)
    ? trashedData.pagination
    : undefined;

  /* -------------------------
    URL sync
 ------------------------- */

  const initializedRef = useRef(false);

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page || 1),
      inProgressPage: String(inProgressPage || 1),
      deletedPage: String(deletedPage || 1),
    };
    if (searchInput) params.search = searchInput;

    // First mount → initialize URL without adding history entries
    if (!initializedRef.current) {
      setSearchParams(params, { replace: true });
      initializedRef.current = true;
      return;
    }

    // Compare current params to avoid unnecessary updates
    const current = Object.fromEntries(searchParams.entries());
    const next = params;

    const changed =
      Object.keys(next).length !== Object.keys(current).length ||
      Object.entries(next).some(([k, v]) => current[k] !== v);

    if (changed) {
      setSearchParams(params, { replace: true });
    }
  }, [
    page,
    inProgressPage,
    deletedPage,
    searchInput,
    setSearchParams,
    searchParams,
  ]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
      setSearchParams(
        (current) => {
          current.set("page", "1");
          current.set("inProgressPage", "1");
          current.set("deletedPage", "1");
          return current;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const goTo = useCallback(
    (newPage: number, newInProgressPage: number, newDeletedPage: number) => {
      const params: Record<string, string> = {
        page: String(newPage),
        inProgressPage: String(newInProgressPage),
        deletedPage: String(newDeletedPage),
      };
      if (searchInput) params.search = searchInput;
      // navigate returns void; use void to explicitly ignore any returned value
      void navigate(`?${new URLSearchParams(params).toString()}`, {
        replace: true,
      });
    },
    [navigate, searchInput],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      await restoreMutation.mutateAsync(id);
      await queryClient.invalidateQueries({ queryKey: ["trashPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["inProgressPosts"] });
      await queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
    },
    [restoreMutation, queryClient],
  );

  /* -------------------------
     UI
  ------------------------- */

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4">
      <div className="flex w-full flex-col items-center justify-between pb-2 sm:flex-row sm:justify-between sm:pb-0">
        <TypographyH1>Posts</TypographyH1>

        <div className="flex flex-wrap gap-2">
          <CustomTrendingButton />
          <CustomFeedButton />
          <CustomNewButton />
        </div>
      </div>

      <InputGroup className="max-w-lg">
        <InputGroupInput
          id="search"
          type="search"
          placeholder="Search posts by author, title or content term..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <InputGroupAddon>
          <FiSearch />
        </InputGroupAddon>
      </InputGroup>

      {/* Published block */}
      <Badge className="mt-4 h-7 px-3 text-base">Published</Badge>

      {publishedPagination && publishedPagination.totalPages > 1 && (
        <PostsPagination
          page={publishedPagination.page}
          limit={publishedPagination.limit}
          totalPages={publishedPagination.totalPages}
          totalDocs={publishedPagination.totalDocs}
          onPrevPage={() =>
            goTo(Math.max(1, page - 1), inProgressPage, deletedPage)
          }
          onNextPage={() => goTo(page + 1, inProgressPage, deletedPage)}
        />
      )}

      <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4 lg:max-w-4xl">
        {publishedPosts.length > 0 ? (
          publishedPosts.map((post) => (
            <PostListItemEdit key={post.id} post={post} />
          ))
        ) : (
          <li className="py-8 text-center">
            {debouncedSearch
              ? `No posts found for "${debouncedSearch}"`
              : "No published posts yet"}
          </li>
        )}
      </ul>

      {/* In progress (author only) */}
      {user && (
        <>
          <Badge className="mt-4 h-7 px-3 text-base">In Progress</Badge>

          {inProgressPagination && inProgressPagination.totalPages > 1 ? (
            <PostsPagination
              page={inProgressPagination.page}
              limit={inProgressPagination.limit}
              totalPages={inProgressPagination.totalPages}
              totalDocs={inProgressPagination.totalDocs}
              onPrevPage={() =>
                goTo(page, Math.max(1, inProgressPage - 1), deletedPage)
              }
              onNextPage={() => goTo(page, inProgressPage + 1, deletedPage)}
            />
          ) : (
            <div className="my-2" />
          )}

          <ul>
            {inProgressPosts.length > 0 ? (
              inProgressPosts.map((post) => (
                <PostListItemEdit key={post.id} post={post} />
              ))
            ) : (
              <li className="py-8 text-center">
                {debouncedSearch
                  ? `No in-progress posts found for "${debouncedSearch}"`
                  : "Nothing in progress."}
              </li>
            )}
          </ul>
        </>
      )}

      {/* Restore from bin (author only) */}
      {user && (
        <>
          <Badge className="mt-4 h-7 px-3 text-base">Restore from Bin</Badge>

          {trashedPagination && trashedPagination.totalPages > 1 && (
            <PostsPagination
              page={trashedPagination.page}
              limit={trashedPagination.limit}
              totalPages={trashedPagination.totalPages}
              totalDocs={trashedPagination.totalDocs}
              onPrevPage={() =>
                goTo(page, inProgressPage, Math.max(1, deletedPage - 1))
              }
              onNextPage={() => goTo(page, inProgressPage, deletedPage + 1)}
            />
          )}

          <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4 lg:max-w-4xl">
            {trashedPosts.length > 0 ? (
              trashedPosts.map((post: SerializedPost) => (
                <li key={post.id} className="flex items-center justify-between">
                  <Link
                    to={`/posts/${post.id}`}
                    aria-label={`Read ${post.title}`}
                  >
                    <div className="flex justify-between gap-4">
                      <AuthorForList post={post} />
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    disabled={restoreMutation.isPending}
                    onClick={() => void handleRestore(post.id)}
                    aria-label={`Restore ${post.title}`}
                    title="Restore from bin"
                    className="ml-8"
                  >
                    <LiaTrashRestoreAltSolid
                      style={{ height: 24, width: 24 }}
                    />
                  </Button>
                </li>
              ))
            ) : (
              <li className="py-8 text-center">
                {debouncedSearch
                  ? `No deleted posts found for "${debouncedSearch}"`
                  : "Bin is empty."}
              </li>
            )}
          </ul>
        </>
      )}
    </section>
  );
}
