import { Button } from "@/components/ui/button";
import type { PostActionsProps } from "@/types";

export default function PostActions({
  isSaving,
  onReset,
  onCancel,
}: PostActionsProps) {
  return (
    <fieldset
      className="post-create-edit-actions"
      aria-label="Post editing actions"
    >
      <Button
        variant="secondary"
        type="button"
        onClick={onCancel}
        disabled={Boolean(isSaving)}
        aria-label="Cancel editing and go back"
      >
        Cancel
      </Button>
      <Button
        type="reset"
        variant="destructive"
        onClick={onReset}
        disabled={Boolean(isSaving)}
        aria-label="Reset form to original values"
      >
        Reset
      </Button>
      <Button
        type="submit"
        variant="default"
        disabled={isSaving}
        aria-label={isSaving ? "Saving post" : "Save post (Ctrl+S)"}
        aria-busy={isSaving}
        title="Save post (Ctrl+S or Cmd+S)"
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </fieldset>
  );
}
