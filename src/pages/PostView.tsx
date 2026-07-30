import { useSinglePostQuery } from "@/api/postHooks";
import AuthorForPost from "@/components/AuthorForPost";
import CommentsSection from "@/components/CommentSection";
import CustomDeleteButton from "@/components/CustomDeleteButton";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useLayoutEffect } from "react";
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

  if (!postId) {
    return (
      <section className="section">
        <p className="mb-4">Invalid post ID.</p>
        <div className="flex flex-wrap justify-center gap-0 md:flex-nowrap md:justify-start md:gap-2">
          <CustomPublishedButton />
        </div>
      </section>
    );
  }

  const {
    data: post,
    isLoading,
    isError,
  } = useSinglePostQuery(postId, user?.id);

  const isAuthor = post?.author?.id === user?.id;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </section>
    );
  }

  if (isError || !post) {
    return (
      <section className="p-8 text-center">
        <p className="form-error mb-4">Post not found</p>
        <div className="flex flex-wrap justify-center gap-0 md:flex-nowrap md:justify-start md:gap-2">
          <CustomPublishedButton />
        </div>
      </section>
    );
  }

  return (
    <section id="post-view" className="sm:p-8">
      <header>
        <div className="flex w-full flex-col items-center justify-between pb-2 sm:flex-row sm:justify-between sm:pb-0">
          <div className="flex items-center space-x-4">
            <Badge className="h-7 px-3 text-base">
              {post.status === "draft" ? "Draft" : "Published"}
            </Badge>
            {post.status === "published" ? (
              <LikeButton
                postAuthorId={post?.author?.id}
                postId={postId}
                likedBy={post.likedBy || []}
                likeCount={post.likeCount || 0}
                isAuthenticated={isAuthenticated}
              />
            ) : null}

            {/* PDF Download Button */}
            <CustomPdfButton postId={postId} postTitle={post.title} />
          </div>
          {!user ? (
            <Link
              to="/auth"
              className="mx-4 mt-2 text-sm hover:underline sm:mt-0"
            >
              <em>Log in to edit, like or comment this post</em>
            </Link>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
            <CustomFeedButton />
            <CustomTrendingButton />
            <CustomPublishedButton />
            <span className="flex flex-nowrap items-center gap-2">
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
