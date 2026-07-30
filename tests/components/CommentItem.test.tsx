import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CommentItem from "@/components/CommentItem";
import { useAuthStore } from "@/stores/authStore";
import {
  useUpdateComment,
  useDeleteComment,
  useCreateComment,
  useToggleCommentLike,
} from "@/api/commentHooks";
import { formatDate } from "@/utils/formatDate";
import type { SerializedComment } from "@/types";

// Mock the hooks
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/api/commentHooks", () => ({
  useUpdateComment: vi.fn(),
  useDeleteComment: vi.fn(),
  useCreateComment: vi.fn(),
  useToggleCommentLike: vi.fn(),
}));

vi.mock("@/utils/formatDate", () => ({
  formatDate: vi.fn(),
}));

// Mock CommentLikeButton
vi.mock("./CommentLikeButton", () => ({
  CommentLikeButton: vi.fn(() => <div data-testid="like-button">Like</div>),
}));

const mockComment: SerializedComment = {
  id: "comment-1",
  authorId: "user-1",
  author: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
  },
  content: "This is a test comment",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  depth: 1,
  parentId: null,
  deleted: false,
  replies: [],
  postId: "post-1",
  liked: false,
  likedBy: [],
  likeCount: 0,
  status: "active",
};

const mockPostId = "post-1";

describe("CommentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth store - user is the comment author
    vi.mocked(useAuthStore).mockReturnValue((user: { id: string } | null) =>
      user?.id === "user-1" ? { id: "user-1", name: "John Doe" } : null,
    );

    // Mock hooks - use type assertion to bypass complex TanStack Query types
    vi.mocked(useUpdateComment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useDeleteComment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useCreateComment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useToggleCommentLike).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    // Mock formatDate
    vi.mocked(formatDate).mockReturnValue("Jan 15, 2024");
  });

  afterEach(() => {
    cleanup(); // Clear DOM after each test
  });

  describe("basic rendering", () => {
    it("should render comment author name", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render comment content", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.getByText("This is a test comment")).toBeInTheDocument();
    });

    it("should render formatted date", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
    });

    it("should render author avatar with first letter", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.getByText("J")).toBeInTheDocument();
    });
  });

  describe("reply context", () => {
    it("should show reply context when parent is provided", () => {
      const parentComment: SerializedComment = {
        ...mockComment,
        author: { id: "user-2", name: "Jane Doe", email: "jane@example.com" },
      };
      render(
        <CommentItem
          comment={mockComment}
          postId={mockPostId}
          parent={parentComment}
        />,
      );
      expect(screen.getByText("↳ Replying to")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("should not show reply context when parent is null", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.queryByText("↳ Replying to")).not.toBeInTheDocument();
    });
  });

  describe("permissions", () => {
    it("should show edit and delete buttons when user is comment author", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.getByText("Reply")).toBeInTheDocument();
      expect(
        container.querySelector('[data-variant="destructive"]'),
      ).toBeInTheDocument();
    });

    it("should not show edit and delete buttons when user is not comment author", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-2",
        name: "Jane Doe",
      });

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(
        container.querySelector('[data-variant="destructive"]'),
      ).not.toBeInTheDocument();
    });
  });

  describe("reply functionality", () => {
    it("should show reply form when Reply button is clicked", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const replyButton = screen.getByText("Reply");
      fireEvent.click(replyButton);

      expect(screen.getByText("Cancel Reply")).toBeInTheDocument();
    });

    it("should hide reply form when Cancel Reply is clicked", () => {
      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const replyButton = screen.getByText("Reply");
      fireEvent.click(replyButton);

      const cancelButton = screen.getByText("Cancel Reply");
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Cancel Reply")).not.toBeInTheDocument();
    });

    it("should not show reply button when depth is 5 or more", () => {
      const deepComment: SerializedComment = { ...mockComment, depth: 5 };

      render(
        <CommentItem comment={deepComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.queryByText("Reply")).not.toBeInTheDocument();
    });
  });

  describe("deleted comment", () => {
    it("should render [deleted] text when comment is deleted and has replies", () => {
      const deletedComment: SerializedComment = {
        ...mockComment,
        deleted: true,
        replies: [
          {
            id: "reply-1",
            author: { id: "user-3", name: "Jane", email: "jane@example.com" },
            authorId: "user-3",
            content: "reply content",
            postId: "post-1",
            liked: false,
            likedBy: [],
            likeCount: 0,
            status: "active",
            parentId: null,
            depth: 2,
            deleted: false,
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
          },
        ],
      };

      render(
        <CommentItem
          comment={deletedComment}
          postId={mockPostId}
          parent={null}
        />,
      );

      expect(screen.getByText("[deleted]")).toBeInTheDocument();
    });

    it("should not render anything when comment is deleted and has no replies", () => {
      const deletedComment: SerializedComment = {
        ...mockComment,
        deleted: true,
        replies: [],
      };

      const { container } = render(
        <CommentItem
          comment={deletedComment}
          postId={mockPostId}
          parent={null}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("loading state", () => {
    it("should show loading skeleton when update is pending", () => {
      vi.mocked(useUpdateComment).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as any);

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(
        container.querySelector(".comment-item.loading"),
      ).toBeInTheDocument();
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("should show loading skeleton when delete is pending", () => {
      vi.mocked(useDeleteComment).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as any);

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(
        container.querySelector(".comment-item.loading"),
      ).toBeInTheDocument();
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("delete modal", () => {
    it("should not show delete modal initially", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(screen.queryByText("Move to trash")).not.toBeInTheDocument();
    });

    it("should show delete modal when delete button is clicked", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const deleteButton = container.querySelector(
        '[data-variant="destructive"]',
      );
      fireEvent.click(deleteButton!);

      expect(screen.getByText("Move to trash")).toBeInTheDocument();
      expect(
        screen.getByText(
          "This will permanently delete your comment. Are you sure?",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });

    it("should call delete mutation when Delete button in modal is clicked", () => {
      const deleteMutate = vi.fn();
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });
      vi.mocked(useDeleteComment).mockReturnValue({
        mutate: deleteMutate,
        isPending: false,
      } as any);

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const deleteButton = container.querySelector(
        '[data-variant="destructive"]',
      );
      fireEvent.click(deleteButton!);

      const deleteConfirmButton = screen.getByRole("button", {
        name: "Delete",
      });
      fireEvent.click(deleteConfirmButton);

      expect(deleteMutate).toHaveBeenCalledWith("comment-1");
    });

    it("should close modal when Cancel button is clicked", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const deleteButton = container.querySelector(
        '[data-variant="destructive"]',
      );
      fireEvent.click(deleteButton!);

      expect(screen.getByText("Move to trash")).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Move to trash")).not.toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    it("should not show edit form initially", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      expect(
        screen.queryByPlaceholderText("Edit your comment..."),
      ).not.toBeInTheDocument();
    });

    it("should show edit form when edit button is clicked", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        id: "user-1",
        name: "John Doe",
      });

      const { container } = render(
        <CommentItem comment={mockComment} postId={mockPostId} parent={null} />,
      );

      const editButton = container.querySelector('[data-variant="ghost"]');
      fireEvent.click(editButton!);

      expect(
        screen.getByPlaceholderText("Edit your comment..."),
      ).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have bg-accent class when depth is 1", () => {
      const depth1Comment: SerializedComment = { ...mockComment, depth: 1 };

      const { container } = render(
        <CommentItem
          comment={depth1Comment}
          postId={mockPostId}
          parent={null}
        />,
      );

      expect(container.querySelector(".bg-accent\\/5")).toBeInTheDocument();
    });

    it("should not have bg-accent class when depth is not 1", () => {
      const depth2Comment: SerializedComment = { ...mockComment, depth: 2 };

      const { container } = render(
        <CommentItem
          comment={depth2Comment}
          postId={mockPostId}
          parent={null}
        />,
      );

      expect(container.querySelector(".bg-accent\\/5")).not.toBeInTheDocument();
    });
  });
});
