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
    <section className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-between w-full pb-2 sm:pb-0 sm:flex-row sm:justify-between">
        <TypographyH1>Trending</TypographyH1>

        <div className="flex flex-wrap gap-2">
          <CustomFeedButton />
          <CustomPublishedButton />
          <CustomNewButton />
        </div>
      </div>

      <Badge className="px-3 mt-4 text-base h-7">Top 5 Most Liked</Badge>

      {/* Fade animation on loading */}
      <div
        data-state={isFetching ? "loading" : "loaded"}
        className="
          transition-opacity duration-200
          data-[state=loading]:opacity-50
          data-[state=loaded]:opacity-100
          w-full
        "
      >
        <ul className="flex flex-col gap-4 mt-4 w-full">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <li>
                  <header>
                    <div className="flex flex-col items-center gap-2 mb-4 md:flex-row md:flex-nowrap md:justify-between md:gap-0">
                      <div className="flex gap-4">
                        {post.status === "published" &&
                          post.id &&
                          post.author && (
                            <LikeButton
                              postAuthorId={post.author.id}
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
            <li>No trending posts yet</li>
          )}
        </ul>
      </div>
    </section>
  );
}
