import { useSoftDeletePostMutation } from "@/api/postHooks";
import { useAuthStore } from "@/stores/authStore";
import type { CustomDeleteButtonProps } from "@/types";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

const CustomDeleteButton = ({ postId, authorId }: CustomDeleteButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const softDeleteMutation = useSoftDeletePostMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!postId) return;

    setShowDeleteConfirm(false);
    try {
      await softDeleteMutation.mutateAsync(postId);
      void navigate("/posts");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const isOwnPost = user?.id && authorId === user?.id;
  const isPending = softDeleteMutation.isPending;

  return (
    <>
      {isOwnPost && !isPending && (
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={isPending || !isOwnPost}
          aria-label="Delete post"
          title="Move to trash"
          data-testid="delete-button"
        >
          <LuTrash2 style={{ height: 24, width: 24 }} className="p-0" />
        </Button>
      )}

      <AlertDialog open={showDeleteConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <span>This will clear your current edits.</span>
              <span>Are you sure?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} variant={"outline"}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={void confirmDelete}
              variant={"destructive"}
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomDeleteButton;
