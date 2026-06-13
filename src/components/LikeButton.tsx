import { useLikePostMutation } from "@/api/postHooks";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import type { LikeButtonProps } from "@/types";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsChatSquareHeart } from "react-icons/bs";

const LikeButton = ({
  postId,
  likedBy,
  likeCount,
  isAuthenticated,
  postAuthorId,
}: LikeButtonProps) => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";
  const { mutate, isPending } = useLikePostMutation();

  const isOwner = userId === postAuthorId;

  const youLiked = likedBy.includes(userId);
  const othersLiked = likedBy.filter((id) => id !== userId).length > 0;

  const isDisabled = !isAuthenticated || isPending || isOwner;

  const handleLike = () => {
    if (isDisabled) return;
    mutate({ postId });
  };

  let icon;

  if (isOwner) {
    icon = othersLiked ? <BsChatSquareHeart /> : <AiOutlineHeart />;
  } else if (youLiked) {
    icon = <AiFillHeart />;
  } else if (othersLiked) {
    icon = <BsChatSquareHeart />;
  } else {
    icon = <AiOutlineHeart />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        onClick={handleLike}
        disabled={isDisabled}
        className="flex items-center rounded-md px-2 py-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-100!"
      >
        {icon}
      </Button>

      <p className="font-semibold">{likeCount}</p>
    </div>
  );
};

export default LikeButton;
