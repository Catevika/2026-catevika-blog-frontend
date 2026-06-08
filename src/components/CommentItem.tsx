import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/api/commentHooks";
import CommentForm from "@/components/CommentForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { CommentItemProps } from "@/types";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import CommentLikeButton from "./CommentLikeButton";
import { Button } from "./ui/button";

export default function CommentItem({
  comment,
  postId,
  parent,
}: CommentItemProps) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id; // your frontend user ID

  const [isEditing, setIsEditing] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [editContent] = useState(comment.content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateCommentMutation = useUpdateComment(postId, comment.id);
  const deleteCommentMutation = useDeleteComment(postId);
  const createReplyMutation = useCreateComment(postId);

  /* -------------------------------------------------------
     DELETE CONFIRM
  ------------------------------------------------------- */
  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    deleteCommentMutation.mutate(comment.id);
  };

  /* -------------------------------------------------------
     LOADING STATE
  ------------------------------------------------------- */
  if (updateCommentMutation.isPending || deleteCommentMutation.isPending) {
    return (
      <div className="comment-item loading">
        <div className="bg-secondary h-32 animate-pulse rounded-md"></div>
      </div>
    );
  }

  /* -------------------------------------------------------
     DELETED COMMENT RENDERING
  ------------------------------------------------------- */
  if (comment.deleted) {
    // If it has replies, show "[deleted]" so the tree structure stays visible
    if (comment.replies && comment.replies.length > 0) {
      return <div className="py-2 text-muted-foreground italic">[deleted]</div>;
    }

    // If no replies → render nothing
    return null;
  }

  /* -------------------------------------------------------
     EDIT MODE
  ------------------------------------------------------- */
  if (isEditing) {
    return (
      <CommentForm
        key="edit-form"
        initialContent={editContent}
        parentId={postId}
        onSubmit={(data) => {
          updateCommentMutation.mutate({ content: data.content });
          setIsEditing(false);
        }}
        isLoading={updateCommentMutation.isPending}
        placeholder="Edit your comment..."
        onClose={() => setIsEditing(false)}
      />
    );
  }

  /* -------------------------------------------------------
     PERMISSIONS
  ------------------------------------------------------- */
  const canDelete = userId && comment.authorId === userId;

  return (
    <>
      <article
        id="commentItem"
        className={cn(
          `rounded-md p-6 transition-all hover:shadow-md`,
          comment.depth === 1 ? "bg-accent/5" : "bg-none",
        )}
      >
        {/* Header */}
        <header className="flex-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="font-semibold">
                {comment.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-md font-semibold">{comment.author.name}</h4>
              <time className="text-sm">{formatDate(comment.createdAt)}</time>
            </div>
          </div>
        </header>

        {/* Reply context */}
        {parent && (
          <div className="text-xs text-muted-foreground mb-2">
            ↳ Replying to{" "}
            <span className="font-medium">{parent.author.name}</span>
          </div>
        )}

        {/* Content */}
        <div className="mb-6 max-w-none text-md leading-relaxed">
          {comment.content}
        </div>

        {/* Actions */}
        <footer className="flex items-center gap-4 text-sm">
          <CommentLikeButton comment={comment} postId={postId} />

          <div className="flex items-center gap-2">
            {canDelete && (
              <>
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                >
                  <LuPencil />
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  variant="destructive"
                >
                  <LuTrash2 />
                </Button>
              </>
            )}

            {comment.depth < 5 && (
              <Button type="button" onClick={() => setShowReply(!showReply)}>
                {showReply ? "Cancel Reply" : "Reply"}
              </Button>
            )}
          </div>
        </footer>

        {/* Reply Form */}
        {showReply && comment.depth < 5 && (
          <div className="mt-4">
            <CommentForm
              parentId={comment.id}
              onSubmit={createReplyMutation.mutate}
              isLoading={createReplyMutation.isPending}
            />
          </div>
        )}
      </article>

      {/* Delete Modal */}
      <AlertDialog open={showDeleteModal}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
