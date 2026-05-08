import type { SerializedPost } from "@/types";
import { formatDate } from "@/utils/formatDate";

const AuthorForPost = ({ post }: { post: SerializedPost }) => {
  return (
    <div id="author" className="flex-col-2 mb-4 items-center text-sm">
      <h1>{post.title}</h1>
      <p>
        by <span className="font-bold">{post.author?.name}</span> - Last update:{" "}
        <span className="font-bold">
          {formatDate(post.updatedAt)
            ? formatDate(post.updatedAt)
            : formatDate(post.createdAt)}
        </span>
      </p>
    </div>
  );
};
export default AuthorForPost;
