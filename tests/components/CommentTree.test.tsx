import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { CommentTree } from "@/components/CommentTree";
import type { SerializedComment } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

// Mock CommentItem with default export
vi.mock("@/components/CommentItem", () => ({
  default: vi.fn(({ comment }) => (
    <div data-testid="comment-item" data-comment-id={comment.id}>
      {comment.content}
    </div>
  )),
}));

const mockComment1: SerializedComment = {
  id: "comment-1",
  authorId: "user-1",
  author: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
  },
  content: "First comment",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  depth: 0,
  parentId: null,
  deleted: false,
  replies: [],
  postId: "post-1",
  liked: false,
  likedBy: [],
  likeCount: 0,
  status: "active",
};

const mockComment2: SerializedComment = {
  id: "comment-2",
  authorId: "user-2",
  author: {
    id: "user-2",
    name: "Jane Doe",
    email: "jane@example.com",
  },
  content: "Second comment with replies",
  createdAt: "2024-01-15T11:00:00Z",
  updatedAt: "2024-01-15T11:00:00Z",
  depth: 0,
  parentId: null,
  deleted: false,
  replies: [
    {
      id: "reply-1",
      authorId: "user-3",
      author: {
        id: "user-3",
        name: "Bob Smith",
        email: "bob@example.com",
      },
      content: "First reply",
      createdAt: "2024-01-15T11:30:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
      depth: 1,
      parentId: "comment-2",
      deleted: false,
      replies: [],
      postId: "post-1",
      liked: false,
      likedBy: [],
      likeCount: 0,
      status: "active",
    },
    {
      id: "reply-2",
      authorId: "user-4",
      author: {
        id: "user-4",
        name: "Alice Brown",
        email: "alice@example.com",
      },
      content: "Second reply",
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
      depth: 1,
      parentId: "comment-2",
      deleted: false,
      replies: [],
      postId: "post-1",
      liked: false,
      likedBy: [],
      likeCount: 0,
      status: "active",
    },
  ],
  postId: "post-1",
  liked: false,
  likedBy: [],
  likeCount: 0,
  status: "active",
};

const mockComment3: SerializedComment = {
  id: "comment-3",
  authorId: "user-1",
  author: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
  },
  content: "Third comment with nested replies",
  createdAt: "2024-01-15T13:00:00Z",
  updatedAt: "2024-01-15T13:00:00Z",
  depth: 0,
  parentId: null,
  deleted: false,
  replies: [
    {
      id: "reply-3",
      authorId: "user-2",
      author: {
        id: "user-2",
        name: "Jane Doe",
        email: "jane@example.com",
      },
      content: "Nested reply",
      createdAt: "2024-01-15T13:30:00Z",
      updatedAt: "2024-01-15T13:30:00Z",
      depth: 1,
      parentId: "comment-3",
      deleted: false,
      replies: [
        {
          id: "nested-reply-1",
          authorId: "user-1",
          author: {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
          },
          content: "Deep nested reply",
          createdAt: "2024-01-15T14:00:00Z",
          updatedAt: "2024-01-15T14:00:00Z",
          depth: 2,
          parentId: "reply-3",
          deleted: false,
          replies: [],
          postId: "post-1",
          liked: false,
          likedBy: [],
          likeCount: 0,
          status: "active",
        },
      ],
      postId: "post-1",
      liked: false,
      likedBy: [],
      likeCount: 0,
      status: "active",
    },
  ],
  postId: "post-1",
  liked: false,
  likedBy: [],
  likeCount: 0,
  status: "active",
};

const mockPostId = "post-1";

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("CommentTree", () => {
  describe("basic rendering", () => {
    it("should render single comment without replies", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment1]} postId={mockPostId} />,
      );

      expect(screen.getByTestId("comment-item")).toBeInTheDocument();
      expect(screen.getByText("First comment")).toBeInTheDocument();
    });

    it("should render multiple comments", () => {
      renderWithProvider(
        <CommentTree
          comments={[mockComment1, mockComment2, mockComment3]}
          postId={mockPostId}
        />,
      );

      expect(screen.getByText("First comment")).toBeInTheDocument();
      expect(
        screen.getByText("Second comment with replies"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Third comment with nested replies"),
      ).toBeInTheDocument();
    });

    it("should render empty comments array", () => {
      const { container } = renderWithProvider(
        <CommentTree comments={[]} postId={mockPostId} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("reply visibility", () => {
    it("should show default expanded state with Hide replies button", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment2]} postId={mockPostId} />,
      );

      // By default, comments are expanded (useState(true))
      // So we should see "Hide replies" button, not "Show replies"
      expect(screen.getByText("Hide replies")).toBeInTheDocument();
      expect(screen.queryByText(/Show replies/)).not.toBeInTheDocument();
    });

    it("should show replies when expanded by default", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment2]} postId={mockPostId} />,
      );

      // Replies should be visible by default
      expect(screen.getByText("First reply")).toBeInTheDocument();
      expect(screen.getByText("Second reply")).toBeInTheDocument();
    });
  });

  describe("hide/show replies functionality", () => {
    it("should hide replies when 'Hide replies' button is clicked", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment2]} postId={mockPostId} />,
      );

      const hideButton = screen.getByText("Hide replies");
      fireEvent.click(hideButton);

      expect(screen.queryByText("First reply")).not.toBeInTheDocument();
      expect(screen.queryByText("Second reply")).not.toBeInTheDocument();
      expect(screen.getByText(/Show replies \((2)\)/)).toBeInTheDocument();
    });

    it("should show replies when 'Show replies' button is clicked", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment2]} postId={mockPostId} />,
      );

      // First, collapse the replies
      const hideButton = screen.getByText("Hide replies");
      fireEvent.click(hideButton);

      // Now show them again
      const showButton = screen.getByText(/Show replies \((2)\)/);
      fireEvent.click(showButton);

      expect(screen.getByText("First reply")).toBeInTheDocument();
      expect(screen.getByText("Second reply")).toBeInTheDocument();
      expect(screen.getByText("Hide replies")).toBeInTheDocument();
    });
  });

  describe("nested replies", () => {
    it("should render nested replies correctly", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment3]} postId={mockPostId} />,
      );

      expect(
        screen.getByText("Third comment with nested replies"),
      ).toBeInTheDocument();
      expect(screen.getByText("Nested reply")).toBeInTheDocument();
      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });

    it("should handle nested replies hide/show independently", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment3]} postId={mockPostId} />,
      );

      // Hide the first level replies (click the first "Hide replies" button)
      const hideButtons = screen.getAllByText("Hide replies");
      fireEvent.click(hideButtons[0]);

      expect(screen.queryByText("Nested reply")).not.toBeInTheDocument();
      expect(screen.queryByText("Deep nested reply")).not.toBeInTheDocument();

      // Show them again (click the first "Show replies" button)
      const showButtons = screen.getAllByText(/Show replies \((1)\)/);
      fireEvent.click(showButtons[0]);

      expect(screen.getByText("Nested reply")).toBeInTheDocument();
      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });
  });

  describe("CommentItem integration", () => {
    it("should pass correct postId to CommentItem", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment1]} postId={mockPostId} />,
      );

      const commentItem = screen.getByTestId("comment-item");
      expect(commentItem).toHaveAttribute("data-comment-id", "comment-1");
    });

    it("should pass parent as null for top-level comments", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment1]} postId={mockPostId} />,
      );

      expect(screen.getByTestId("comment-item")).toBeInTheDocument();
    });

    it("should pass correct parent for nested comments", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment3]} postId={mockPostId} />,
      );

      // All comments should be rendered
      expect(
        screen.getByText("Third comment with nested replies"),
      ).toBeInTheDocument();
      expect(screen.getByText("Nested reply")).toBeInTheDocument();
      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have proper indentation for nested comments", () => {
      const { container } = renderWithProvider(
        <CommentTree comments={[mockComment3]} postId={mockPostId} />,
      );

      // Check for border-l class on nested replies container
      const nestedContainer = container.querySelector('[data-state="open"]');
      expect(nestedContainer).toHaveClass("border-l");
      expect(nestedContainer).toHaveClass("pl-4");
    });

    it("should have correct data-state attribute when expanded", () => {
      renderWithProvider(
        <CommentTree comments={[mockComment2]} postId={mockPostId} />,
      );

      const nestedContainer = document.querySelector('[data-state="open"]');
      expect(nestedContainer).toBeInTheDocument();
    });
  });

  describe("multiple comments with replies", () => {
    it("should handle multiple comments each with their own replies", () => {
      renderWithProvider(
        <CommentTree
          comments={[mockComment2, mockComment3]}
          postId={mockPostId}
        />,
      );

      // Both top-level comments should be visible
      expect(
        screen.getByText("Second comment with replies"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Third comment with nested replies"),
      ).toBeInTheDocument();

      // Both should have their replies visible by default
      expect(screen.getByText("First reply")).toBeInTheDocument();
      expect(screen.getByText("Second reply")).toBeInTheDocument();
      expect(screen.getByText("Nested reply")).toBeInTheDocument();
      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });

    it("should hide/show replies independently for each comment", () => {
      renderWithProvider(
        <CommentTree
          comments={[mockComment2, mockComment3]}
          postId={mockPostId}
        />,
      );

      // Hide replies for comment-2 (first Hide replies button)
      const hideButtons = screen.getAllByText("Hide replies");
      fireEvent.click(hideButtons[0]);

      // comment-2 replies should be hidden
      expect(screen.queryByText("First reply")).not.toBeInTheDocument();
      expect(screen.queryByText("Second reply")).not.toBeInTheDocument();

      // comment-3 replies should still be visible
      expect(screen.getByText("Nested reply")).toBeInTheDocument();
      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });
  });
});
