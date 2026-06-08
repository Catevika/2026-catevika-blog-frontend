import TypographyH1 from "@/components/TypographyH1";
import type { PostEditHeaderProps } from "@/types";

const PostEditHeader: React.FC<PostEditHeaderProps> = ({ isNew, status }) => {
  const title = isNew
    ? status === "draft"
      ? "Create draft"
      : "Create post"
    : status === "draft"
      ? "Edit draft"
      : "Edit post";

  return <TypographyH1>{title}</TypographyH1>;
};

export default PostEditHeader;
