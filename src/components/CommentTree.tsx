import { useState } from "react";
import type {
  CommentNodeProps,
  CommentTreeProps,
  SerializedComment,
} from "@/types";
import CommentItem from "./CommentItem";

export function CommentTree({ comments, postId }: CommentTreeProps) {
  return (
    <>
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          postId={postId}
          parent={null}
        />
      ))}
    </>
  );
}

function CommentNode({
  comment,
  postId,
  parent,
}: CommentNodeProps & { parent: SerializedComment | null }) {
  const [expanded, setExpanded] = useState(true);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <CommentItem comment={comment} postId={postId} parent={parent} />

      {hasReplies && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm text-blue-500 hover:underline"
        >
          {`Show replies (${comment.replies?.length})`}
        </button>
      )}

      {hasReplies && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="text-sm text-blue-500 hover:underline"
        >
          Hide replies
        </button>
      )}

      {/* Animated nested replies */}
      <div
        data-state={expanded ? "open" : "closed"}
        className={`data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up ml-4 overflow-hidden border-l pl-4 transition-all duration-200`}
      >
        {expanded &&
          comment.replies?.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              parent={comment}
            />
          ))}
      </div>
    </div>
  );
}
