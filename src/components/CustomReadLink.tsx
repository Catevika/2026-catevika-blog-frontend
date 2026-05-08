import { LiaBookOpenSolid } from "react-icons/lia";
import { Link } from "react-router";
import type { SerializedPost } from "@/types";

const CustomReadLink = ({ post }: { post: SerializedPost }) => {
  return (
    <Link to={`/posts/${post.id}`} aria-label={`Read ${post.title}`}>
      <LiaBookOpenSolid />
    </Link>
  );
};

export default CustomReadLink;
