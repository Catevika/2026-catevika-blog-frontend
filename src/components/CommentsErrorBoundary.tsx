import type { CommentsErrorBoundaryProps } from "@/types";
import { LuTriangleAlert } from "react-icons/lu";

const CommentsErrorBoundary = ({
  error,
  onRetry,
}: CommentsErrorBoundaryProps) => {
  return (
    <div id="commentErrorBoundary" role="alert">
      <div className="flex items-center gap-2">
        <LuTriangleAlert className="text-danger h-5 w-5" />
        <div>
          <h3 className="text-lg font-semibold">Failed to load comments</h3>
          <p className="form-error">{error?.message ?? "Unknown error"}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="plain"
          disabled={false}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default CommentsErrorBoundary;
