import { TfiPencil } from "react-icons/tfi";
import { Link } from "react-router";
import type { SerializedPost, SerializedUser } from "@/types";

const CustomEditLink = ({
  post,
  user,
}: {
  post: SerializedPost;
  user: SerializedUser;
}) => {
  const userId = user.id;

  return (
    <Link
      to={`/posts/${post.id}/edit`}
      aria-label="Edit"
      className={
        userId && post?.author?.id === userId
          ? ""
          : "text-transparent cursor-default pointer-events-none"
      }
    >
      <TfiPencil style={{ height: 20, width: 20 }} />
    </Link>
  );
};

export default CustomEditLink;
