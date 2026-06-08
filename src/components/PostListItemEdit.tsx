import AuthorForList from "@/components/AuthorForList";
import CustomEditLink from "@/components/CustomEditLink";
import { useAuthStore } from "@/stores/authStore";
import type { SerializedPost } from "@/types";
import { Link } from "react-router";

const PostListItem = ({ post }: { post: SerializedPost }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <li className="flex items-center justify-between">
      <Link
        to={`/posts/${post.id}`}
        aria-label={`Read ${post.title}`}
        className="mr-2"
      >
        <div className="flex items-center justify-between gap-4">
          <AuthorForList post={post} />
        </div>
      </Link>
      {user && <CustomEditLink post={post} user={user} />}
    </li>
  );
};

export default PostListItem;
