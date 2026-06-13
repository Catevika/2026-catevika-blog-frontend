import type { SerializedPost } from "@/types";
import { formatDate } from "@/utils/formatDate";
import { Link } from "react-router";

const AuthorForPost = ({ post }: { post: SerializedPost }) => {
  return (
    <div id="author" className="my-4 flex-col text-sm">
      <Link to={`/posts/${post.id}`} className="font-bold hover:underline">
        {post.title}
      </Link>
      <p>
        by <span className="font-semibold">{post.author?.name}</span> - Last
        update:{" "}
        <span className="font-semibold">
          {formatDate(post.updatedAt)
            ? formatDate(post.updatedAt)
            : formatDate(post.createdAt)}
        </span>
      </p>
    </div>
  );
};
export default AuthorForPost;
