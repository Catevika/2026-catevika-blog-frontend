import type { CommentListProps, SerializedComment } from "@/types";
import { useState } from "react";
import CommentItem from "./CommentItem";

export function CommentList({ comments, postId }: CommentListProps) {
  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <MobileCommentNode
          key={comment.id}
          comment={comment}
          postId={postId}
          parent={null}
        />
      ))}
    </ul>
  );
}

function MobileCommentNode({
  comment,
  postId,
  parent,
}: {
  comment: SerializedComment;
  postId: string;
  parent: SerializedComment | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="mb-4">
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

      {/* Animated replies */}
      <div
        data-state={expanded ? "open" : "closed"}
        className={`data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-200`}
      >
        {expanded &&
          comment.replies?.map((reply) => (
            <MobileCommentNode
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
