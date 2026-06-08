import { useToggleCommentLike } from "@/api/commentHooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsChatSquareHeart } from "react-icons/bs";
import type { CommentLikeButtonProps } from "../types";

export default function CommentLikeButton({
  comment,
  postId,
  className = "",
}: CommentLikeButtonProps) {
  const user = useAuthStore((s) => s.user);
  const toggleLikeMutation = useToggleCommentLike(postId, comment.id, user?.id);

  const isOwner = user?.id === comment.authorId;
  const isDisabled = isOwner || toggleLikeMutation.isPending;

  const handleLike = () => {
    if (isOwner) return;
    toggleLikeMutation.mutate();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleLike}
        disabled={isDisabled}
        className={cn(
          "flex items-center gap-2 font-medium disabled:cursor-not-allowed disabled:opacity-100!",
          className,
        )}
        aria-label={
          isOwner
            ? "Cannot like your own comment"
            : comment.liked
              ? "Unlike comment"
              : "Like comment"
        }
        aria-live="polite"
        aria-describedby={
          toggleLikeMutation.isPending ? "like-status" : undefined
        }
      >
        {isOwner ? (
          <BsChatSquareHeart
            size={24}
            className="like-IsOwner-icon"
            aria-hidden="true"
          />
        ) : comment.liked ? (
          <AiFillHeart
            size={24}
            className="like-Liked-icon"
            aria-hidden="true"
          />
        ) : (
          <AiOutlineHeart
            size={24}
            className="like-NotLiked-icon"
            aria-hidden="true"
          />
        )}
        <span>{comment.likeCount}</span>

        {toggleLikeMutation.isPending && (
          <span id="like-status" className="sr-only">
            Updating likes...
          </span>
        )}
      </button>
      {!user ? (
        <p className="text-sm sm:hidden">(Log in to like comments)</p>
      ) : null}
    </>
  );
}
