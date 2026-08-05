import { useFavoritesPosts } from "@/api/postHooks";
import AuthorForPost from "@/components/AuthorForPost";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomNewButton from "@/components/CustomNewButton";
import CustomPdfButton from "@/components/CustomPdfButton";
import CustomPublishedButton from "@/components/CustomPublishedButton";
import LikeButton from "@/components/LikeButton";
import PostContent from "@/components/PostContent";
import TypographyH1 from "@/components/TypographyH1";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";

export default function Trending() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  /* -------------------------
     Query (5 most liked posts)
  ------------------------- */
  const { data, isFetching } = useFavoritesPosts();
  const posts = data?.docs ?? [];

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center px-4">
      {/* Header */}
      <div className="flex w-full flex-col items-center justify-between pb-2 sm:flex-row sm:justify-between sm:pb-0">
        <TypographyH1>Trending</TypographyH1>

        <div className="flex flex-wrap gap-2">
          <CustomFeedButton />
          <CustomPublishedButton />
          <CustomNewButton />
        </div>
      </div>

      <Badge className="mt-4 h-7 px-3 text-base">Top 5 Most Liked</Badge>

      {/* Fade animation on loading */}
      <div
        data-state={isFetching ? "loading" : "loaded"}
        className="w-full transition-opacity duration-200 data-[state=loaded]:opacity-100 data-[state=loading]:opacity-50"
      >
        <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6 lg:max-w-4xl">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="max-w-full p-4">
                <li>
                  <header>
                    <div className="mb-4 flex flex-col items-center gap-2 md:flex-row md:flex-nowrap md:justify-between md:gap-0">
                      <div className="flex gap-4">
                        {post.status === "published" &&
                          post.id &&
                          post.author && (
                            <LikeButton
                              postAuthorId={post.author.id}
                              postId={post.id}
                              likedBy={post.likedBy || []}
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
            <li>No trending posts yet</li>
          )}
        </ul>
      </div>
    </section>
  );
}
