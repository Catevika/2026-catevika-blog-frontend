import { useLikePostMutation } from "@/api/postHooks";
import { useAuthStore } from "@/stores/authStore";
import type { LikeButtonProps } from "@/types";
import { BsChatSquareHeart } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { AiFillHeart } from "react-icons/ai";
import { Button } from "@/components/ui/button";

const LikeButton = ({
  postId,
  liked,
  likeCount,
  isAuthenticated,
  postAuthorId,
}: LikeButtonProps) => {
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending } = useLikePostMutation();

  const isOwner = user?.id === postAuthorId;
  const isDisabled = !isAuthenticated || isPending || isOwner;

  const handleLike = () => {
    if (isOwner) return;
    mutate({ postId });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        title={
          !isAuthenticated
            ? "Login to like"
            : isOwner
              ? "Cannot like your own post"
              : ""
        }
        onClick={handleLike}
        disabled={isDisabled}
        className="flex items-center rounded-md py-1 px-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-100!"
        aria-label={
          isOwner
            ? "Cannot like your own post"
            : liked
              ? "Unlike post"
              : "Like post"
        }
      >
        {isOwner ? (
          <BsChatSquareHeart />
        ) : liked ? (
          <AiFillHeart />
        ) : (
          <AiOutlineHeart />
        )}
      </Button>
      <p className="font-semibold">{likeCount}</p>
    </div>
  );
};

export default LikeButton;
