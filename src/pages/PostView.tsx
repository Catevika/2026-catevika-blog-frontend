import { useSinglePostQuery } from "@/api/postHooks";
import AuthorForPost from "@/components/AuthorForPost";
import CommentsSection from "@/components/CommentSection";
import CustomDeleteButton from "@/components/CustomDeleteButton";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import CustomEditLink from "../components/CustomEditLink";
import CustomNewButton from "../components/CustomNewButton";
import CustomPdfButton from "../components/CustomPdfButton";
import CustomPublishedButton from "../components/CustomPublishedButton";
import LikeButton from "../components/LikeButton";
import PostContent from "../components/PostContent";

const PostView = () => {
  const params = useParams();
  const { postId } = params;

  const { user, isAuthenticated } = useAuthStore();

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useSinglePostQuery(postId!, user?.id);

  const isAuthor = post?.author?.id === user?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="p-8 text-center">
        <p className="form-error mb-4">
          Failed to load post
          {error instanceof Error ? `: ${error.message}` : ""}.
        </p>

        <div className="flex flex-wrap justify-center gap-0 md:flex-nowrap md:justify-start md:gap-2">
          <CustomPublishedButton />
        </div>
      </section>
    );
  }

  if (!postId) {
    return (
      <section className="section">
        <p className="mb-4">Post not found.</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section">
        <p className="mb-4">Post not found.</p>

        <div className="flex flex-wrap justify-center gap-0 md:flex-nowrap md:justify-start md:gap-2">
          <CustomPublishedButton />
        </div>
      </section>
    );
  }

  return (
    <section id="post-view" className="sm:p-8">
      <header>
        <div className="flex flex-col items-center justify-between w-full pb-2 sm:pb-0 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-4">
            <Badge className="px-3 text-base h-7">
              {post.status === "draft" ? "Draft" : "Published"}
            </Badge>
            {post.status === "published" ? (
              <LikeButton
                postAuthorId={post?.author?.id}
                postId={postId}
                liked={post.liked || false}
                likeCount={post.likeCount || 0}
                isAuthenticated={isAuthenticated}
              />
            ) : null}

            {/* PDF Download Button */}
            <CustomPdfButton postId={postId} postTitle={post.title} />
          </div>
          {!user ? (
            <Link to="/auth" className="text-sm hover:underline mt-2 sm:mt-0">
              <em>Log in to edit, like or comment this post</em>
            </Link>
          ) : null}
          <div className="flex items-center flex-wrap gap-2 mt-2 sm:mt-0">
            <CustomFeedButton />
            <CustomTrendingButton />
            <CustomPublishedButton />
            <span className="flex items-center flex-nowrap gap-2">
              <CustomNewButton />
              {user ? <CustomEditLink post={post} user={user} /> : null}
              {isAuthor ? (
                <CustomDeleteButton
                  postId={postId}
                  postTitle={post.title}
                  postStatus={post.status}
                  authorId={user?.id}
                  userId={user?.id}
                />
              ) : null}
            </span>
          </div>
        </div>

        <AuthorForPost post={post} />
      </header>

      <PostContent content={post.content} />

      <hr className="text-primary my-8" />

      {post.status === "published" ? (
        <CommentsSection postId={postId} postAuthorId={post.author?.id} />
      ) : null}
    </section>
  );
};

export default PostView;
