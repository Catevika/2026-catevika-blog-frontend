import { Textarea } from "@/components/ui/textarea";
import type { CommentFormProps } from "@/types";
import { useState } from "react";
import { Button } from "./ui/button";

const CommentForm = ({
  initialContent = "",
  parentId,
  onSubmit,
  isLoading,
  placeholder = parentId ? "Write a reply..." : "Add a comment...",
  onClose,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim(), ...(parentId && { parentId }) });
      setContent("");
    }
  };

  const handleCancel = () => {
    setContent("");
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-0 flex-1 flex-col gap-2"
    >
      <Textarea
        id="comment"
        name="comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 4}
        maxLength={5000}
        className="mb-0 w-full"
      />
      <p className="mt-2 ml-auto text-sm">
        Message length:{" "}
        <span className="text-muted-foreground">{content.length}/5000</span>
      </p>

      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel Text
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? "Posting..." : parentId ? "Send Reply" : "Send Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
