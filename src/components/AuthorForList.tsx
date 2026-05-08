import type { SerializedPost } from "@/types";
import { formatDate } from "@/utils/formatDate";

const AuthorForList = ({ post }: { post: SerializedPost }) => {
  return (
    <div className="flex-col mb-4 text-sm">
      <div className="font-bold hover:underline">{post.title}</div>
      <div>
        by <span className="font-semibold">{post.author?.name}</span> - Last
        update:{" "}
        <span className="font-semibold">
          {formatDate(post.updatedAt)
            ? formatDate(post.updatedAt)
            : formatDate(post.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default AuthorForList;
