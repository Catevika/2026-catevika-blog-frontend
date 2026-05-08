import { useFeedPostsQuery } from "@/api/postHooks";
import CustomPublishedButton from "@/components/CustomPublishedButton";
import CustomNewButton from "@/components/CustomNewButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import PostsPagination from "@/components/PostsPagination";
import { useAuthStore } from "@/stores/authStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import type { PaginatedPost, PostsResponse, SerializedPost } from "@/types";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import LikeButton from "@/components/LikeButton";
import CustomPdfButton from "@/components/CustomPdfButton";
import AuthorForPost from "@/components/AuthorForPost";
import PostContent from "@/components/PostContent";
import TypographyH1 from "@/components/TypographyH1";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

export default function Feed() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  useScrollRestoration();

  const page = Number(searchParams.get("page") ?? 1);

  const limit = DEFAULT_LIMIT;

  /* -------------------------
     Queries
  ------------------------- */
  const feedQuery = useFeedPostsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  /* -------------------------
     Derived lists (safely narrowed)
  ------------------------- */

  const feedData = feedQuery.data;
  const feedPosts: SerializedPost[] = isPaginatedPost(feedData)
    ? feedData.docs
    : [];
  const feedPagination = isPaginatedPost(feedData)
    ? feedData.pagination
    : undefined;

  /* -------------------------
    URL sync
 ------------------------- */

  const initializedRef = useRef(false);

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page || 1),
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
  }, [page, searchInput, setSearchParams, searchParams]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  const goTo = useCallback(
    (newPage: number) => {
      const params: Record<string, string> = {
        page: String(newPage),
      };
      if (searchInput) params.search = searchInput;

      void navigate(`?${new URLSearchParams(params).toString()}`, {
        replace: true,
      });
    },
    [navigate, searchInput],
  );

  /* -------------------------
     UI
  ------------------------- */

  return (
    <section className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center justify-between w-full pb-2 sm:pb-0 sm:flex-row sm:justify-between">
        <TypographyH1>Feed</TypographyH1>

        <div className="flex flex-wrap gap-2">
          <CustomTrendingButton />
          <CustomPublishedButton />
          <CustomNewButton />
        </div>
      </div>

      <InputGroup className="max-w-2/3">
        <InputGroupInput
          id="search"
          type="search"
          placeholder="Search posts..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <InputGroupAddon>
          <FiSearch />
        </InputGroupAddon>
      </InputGroup>

      <Badge className="px-3 mt-4 text-base h-7">Published</Badge>

      {/* Pagination */}
      {feedPagination && feedPagination.totalPages > 1 && (
        <PostsPagination
          page={feedPagination.page}
          limit={feedPagination.limit}
          totalPages={feedPagination.totalPages}
          totalDocs={feedPagination.totalDocs}
          onPrevPage={() => goTo(Math.max(1, page - 1))}
          onNextPage={() => goTo(page + 1)}
        />
      )}

      <ul className="flex flex-col gap-4">
        {feedPosts.length > 0 ? (
          feedPosts.map((post) => (
            <Card key={post.id} className="p-4">
              <li>
                <header>
                  <div className="flex flex-col items-center gap-2 mb-4 md:flex-row md:flex-nowrap md:justify-between md:gap-0">
                    <div className="flex gap-4">
                      {post.status === "published" &&
                        post.id &&
                        post.author && (
                          <LikeButton
                            postAuthorId={post.author.id.toString()}
                            postId={post.id}
                            liked={post.liked || false}
                            likeCount={post.likeCount || 0}
                            isAuthenticated={isAuthenticated}
                          />
                        )}
                      {post.id && (
                        <CustomPdfButton
                          postId={post.id}
                          postTitle={post.title}
                        />
                      )}
                    </div>
                  </div>

                  <AuthorForPost post={post} />
                </header>

                <PostContent content={post.content} />
              </li>
            </Card>
          ))
        ) : (
          <li>
            {searchInput
              ? `No posts found for "${searchInput}"`
              : "No published posts yet"}
          </li>
        )}
      </ul>
    </section>
  );
}
