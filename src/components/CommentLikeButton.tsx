import { useToggleCommentLike } from "@/api/commentHooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsChatSquareHeart } from "react-icons/bs";
import type { CommentLikeButtonProps } from "../types";

export default function CommentLikeButton({
  comment,
  postId,
  parent,
  className = "",
}: CommentLikeButtonProps) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

  const toggleLikeMutation = useToggleCommentLike(
    postId,
    comment.id,
    userId,
    parent?.id ?? null,
  );

  const isAuthor = userId === comment.authorId;

  // Normalize likedBy to strings
  const likedBy = comment.likedBy.map((id) => id.toString());

  const youLiked = likedBy.includes(userId);
  const othersLiked = likedBy.filter((id) => id !== userId).length > 0;

  const isDisabled = toggleLikeMutation.isPending || isAuthor;

  const handleLike = () => {
    if (isAuthor) return;
    toggleLikeMutation.mutate();
  };

  let icon;

  if (isAuthor) {
    icon = othersLiked ? (
      <BsChatSquareHeart size={24} />
    ) : (
      <AiOutlineHeart size={24} />
    );
  } else if (youLiked) {
    icon = <AiFillHeart size={24} />;
  } else if (othersLiked) {
    icon = <BsChatSquareHeart size={24} />;
  } else {
    icon = <AiOutlineHeart size={24} />;
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isDisabled}
      className={cn(
        "flex items-center gap-2 font-medium disabled:cursor-not-allowed disabled:opacity-100!",
        className,
      )}
    >
      {icon}
      <span>{likedBy.length}</span>
    </button>
  );
}
