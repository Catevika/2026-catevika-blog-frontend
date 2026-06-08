import type { CommentsHeaderProps } from "@/types";
import { LuRotateCw } from "react-icons/lu";
import TypographyH2 from "./TypographyH2";
import { Button } from "./ui/button";

const CommentsHeader = ({
  totalComments,
  isFetching,
  onRefresh,
}: CommentsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TypographyH2>Comments</TypographyH2>
        <span aria-live="polite" className="pb-1 text-sm text-muted-foreground">
          ({totalComments})
        </span>
      </div>
      <Button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="flex-center gap-2 mb-2"
        aria-label="Refresh comments"
      >
        {isFetching ? (
          <>
            <LuRotateCw size={24} /> Refreshing...
          </>
        ) : (
          <>
            <LuRotateCw size={24} /> Refresh
          </>
        )}
      </Button>
    </div>
  );
};

export default CommentsHeader;
