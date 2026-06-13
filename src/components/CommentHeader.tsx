import type { CommentsHeaderProps } from "@/types";
import TypographyH2 from "./TypographyH2";

const CommentsHeader = ({ totalComments }: CommentsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TypographyH2>Comments</TypographyH2>
        <span aria-live="polite" className="text-muted-foreground pb-1 text-sm">
          ({totalComments})
        </span>
      </div>
    </div>
  );
};

export default CommentsHeader;
