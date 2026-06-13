import CommentForm from "@/components/CommentForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommentFormSectionProps } from "@/types";

const CommentFormSection = ({
  isPostAuthor,
  createCommentMutation,
}: CommentFormSectionProps) => {
  return (
    <Card id="commentFormSection">
      <CardHeader className="flex items-center gap-2">
        <CardTitle>Leave a comment</CardTitle>
        {isPostAuthor && (
          <Badge className="h-7 px-3 text-base">Post Author</Badge>
        )}
      </CardHeader>
      <CommentForm
        onSubmit={createCommentMutation.mutate}
        isLoading={createCommentMutation.isPending}
      />
    </Card>
  );
};

export default CommentFormSection;
