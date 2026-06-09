import { getCommentsTree } from "@/api/commentApi";
import { useCreateComment } from "@/api/commentHooks";
import CommentFormSection from "@/components/CommentFormSection";
import CommentsHeader from "@/components/CommentHeader";
import { CommentList } from "@/components/CommentList"; // <-- mobile list
import CommentsErrorBoundary from "@/components/CommentsErrorBoundary";
import CommentsLoading from "@/components/CommentsLoading";
import { CommentTree } from "@/components/CommentTree"; // <-- desktop tree
import NoCommentsYet from "@/components/NoCommentsYet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useIsMobile"; // <-- device detection
import { useAuthStore } from "@/stores/authStore";
import type {
  CommentsSectionProps,
  FetchError,
  SerializedComment,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

const CommentsSection = ({ postId, postAuthorId }: CommentsSectionProps) => {
  const isMobile = useIsMobile();

  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const isLoggedIn = !!user;
  const isPostAuthor = userId === postAuthorId;

  const createCommentMutation = useCreateComment(postId, userId);

  const {
    data: comments,
    isPending: isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SerializedComment[], FetchError>({
    queryKey: ["comments", postId, userId],
    queryFn: () => getCommentsTree(postId, userId),
    staleTime: 5 * 60 * 1000,
  });

  const totalComments = comments?.length ?? 0;
  const hasComments = totalComments > 0;

  if (isLoading && !hasComments) {
    return <CommentsLoading />;
  }

  return (
    <div id="commentsSection" className="mx-2 md:mx-4">
      {!isLoggedIn && hasComments && (
        <div className="mb-8 text-center" aria-live="polite">
          <Card>
            <CardHeader className="mb-4 flex items-center gap-3">
              <CardTitle>Join the conversation</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-lg">
              <Link to="/auth" className="hover:underline mt-2 sm:mt-0">
                <em>Log in</em>
              </Link>{" "}
              to share your thoughts and engage with the community.
            </CardContent>
          </Card>
        </div>
      )}

      <CommentsHeader totalComments={totalComments} />

      {isError && (
        <CommentsErrorBoundary error={error} onRetry={() => void refetch()} />
      )}

      {isLoggedIn && (
        <CommentFormSection
          isPostAuthor={isPostAuthor}
          createCommentMutation={createCommentMutation}
        />
      )}

      {hasComments && comments ? (
        isMobile ? (
          // MOBILE → flat list + show/hide replies
          <CommentList comments={comments} postId={postId} />
        ) : (
          // DESKTOP → full nested tree
          <CommentTree comments={comments} postId={postId} />
        )
      ) : !isLoggedIn ? (
        <NoCommentsYet isLoggedIn={isLoggedIn} />
      ) : null}
    </div>
  );
};

export default CommentsSection;
