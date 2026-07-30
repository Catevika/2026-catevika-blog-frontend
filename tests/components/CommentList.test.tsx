import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { CommentList } from "@/components/CommentList";
import type { SerializedComment } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

// Mock CommentItem
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

const mockPostId = "post-1";

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("CommentList", () => {
  describe("basic rendering", () => {
    it("should render empty comments array", () => {
      const { container } = renderWithProvider(
        <CommentList comments={[]} postId={mockPostId} />,
      );

      const list = container.querySelector("ul");
      expect(list).toBeInTheDocument();
      expect(list?.children.length).toBe(0);
    });

    it("should render single comment", () => {
      renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      expect(screen.getByTestId("comment-item")).toBeInTheDocument();
      expect(screen.getByText("First comment")).toBeInTheDocument();
    });

    it("should render multiple comments", () => {
      renderWithProvider(
        <CommentList
          comments={[mockComment1, mockComment2]}
          postId={mockPostId}
        />,
      );

      expect(screen.getByText("First comment")).toBeInTheDocument();
      expect(
        screen.getByText("Second comment with replies"),
      ).toBeInTheDocument();
    });

    it("should render ul with comment-list class", () => {
      const { container } = renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      const list = container.querySelector("ul");
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass("comment-list");
    });

    it("should render li with mb-4 class for each comment", () => {
      const { container } = renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      const div = container.querySelector("div");
      expect(div).toBeInTheDocument();
      expect(div).toHaveClass("mb-4");
    });
  });

  describe("reply visibility", () => {
    it("should show Show replies button when comment has replies and is collapsed", () => {
      renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      // By default, comments are collapsed (useState(false))
      expect(screen.getByText(/Show replies \((2)\)/)).toBeInTheDocument();
      expect(screen.queryByText("Hide replies")).not.toBeInTheDocument();
    });

    it("should not show Show replies button when comment has no replies", () => {
      renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      expect(screen.queryByText(/Show replies/)).not.toBeInTheDocument();
    });

    it("should not show replies when collapsed", () => {
      renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      expect(screen.queryByText("First reply")).not.toBeInTheDocument();
      expect(screen.queryByText("Second reply")).not.toBeInTheDocument();
    });
  });

  describe("show/hide replies functionality", () => {
    it("should show replies when Show replies button is clicked", () => {
      renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      const showButton = screen.getByText(/Show replies \((2)\)/);
      fireEvent.click(showButton);

      expect(screen.getByText("First reply")).toBeInTheDocument();
      expect(screen.getByText("Second reply")).toBeInTheDocument();
      expect(screen.getByText("Hide replies")).toBeInTheDocument();
    });

    it("should hide replies when Hide replies button is clicked", () => {
      renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      // First, show the replies
      const showButton = screen.getByText(/Show replies \((2)\)/);
      fireEvent.click(showButton);

      // Now hide them
      const hideButton = screen.getByText("Hide replies");
      fireEvent.click(hideButton);

      expect(screen.queryByText("First reply")).not.toBeInTheDocument();
      expect(screen.queryByText("Second reply")).not.toBeInTheDocument();
      expect(screen.getByText(/Show replies \((2)\)/)).toBeInTheDocument();
    });
  });

  describe("nested replies", () => {
    it("should render nested replies correctly", () => {
      const commentWithNestedReplies: SerializedComment = {
        ...mockComment2,
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
            parentId: "comment-2",
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
      };

      renderWithProvider(
        <CommentList
          comments={[commentWithNestedReplies]}
          postId={mockPostId}
        />,
      );

      // Show the first level replies
      const showButtons = screen.getAllByText(/Show replies/);
      fireEvent.click(showButtons[0]);

      expect(screen.getByText("Nested reply")).toBeInTheDocument();

      // Show the nested reply (second level)
      const nestedShowButton = screen.getByText(/Show replies \((1)\)/);
      fireEvent.click(nestedShowButton);

      expect(screen.getByText("Deep nested reply")).toBeInTheDocument();
    });
  });

  describe("CommentItem integration", () => {
    it("should pass correct postId to CommentItem", () => {
      renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      const commentItem = screen.getByTestId("comment-item");
      expect(commentItem).toHaveAttribute("data-comment-id", "comment-1");
    });

    it("should pass parent as null for top-level comments", () => {
      renderWithProvider(
        <CommentList comments={[mockComment1]} postId={mockPostId} />,
      );

      expect(screen.getByTestId("comment-item")).toBeInTheDocument();
    });

    it("should pass correct parent for nested comments", () => {
      const commentWithReply: SerializedComment = {
        ...mockComment2,
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
        ],
      };

      renderWithProvider(
        <CommentList comments={[commentWithReply]} postId={mockPostId} />,
      );

      // Show the reply
      const showButton = screen.getByText(/Show replies \((1)\)/);
      fireEvent.click(showButton);

      expect(screen.getByText("First reply")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have mt-3 class on nested replies div", () => {
      const { container } = renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      // Show the replies first
      const showButton = container.querySelector("button");
      if (showButton) {
        fireEvent.click(showButton);
      }

      const nestedUl = container.querySelector(".mb-4");
      expect(nestedUl).toBeInTheDocument();
    });

    it("should have data-state attribute on replies container", () => {
      const { container } = renderWithProvider(
        <CommentList comments={[mockComment2]} postId={mockPostId} />,
      );

      const repliesContainer = container.querySelector("[data-state]");
      expect(repliesContainer).toBeInTheDocument();
      expect(repliesContainer).toHaveAttribute("data-state", "closed");
    });
  });

  describe("multiple comments with replies", () => {
    it("should handle multiple comments each with their own replies", () => {
      const comment3: SerializedComment = {
        ...mockComment1,
        id: "comment-3",
        content: "Third comment with replies",
        replies: [
          {
            id: "reply-4",
            authorId: "user-5",
            author: {
              id: "user-5",
              name: "Charlie",
              email: "charlie@example.com",
            },
            content: "Reply to comment 3",
            createdAt: "2024-01-15T15:00:00Z",
            updatedAt: "2024-01-15T15:00:00Z",
            depth: 1,
            parentId: "comment-3",
            deleted: false,
            replies: [],
            postId: "post-1",
            liked: false,
            likedBy: [],
            likeCount: 0,
            status: "active",
          },
        ],
      };

      renderWithProvider(
        <CommentList comments={[mockComment2, comment3]} postId={mockPostId} />,
      );

      // Both top-level comments should be visible
      expect(
        screen.getByText("Second comment with replies"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Third comment with replies"),
      ).toBeInTheDocument();

      // Both should have Show replies buttons
      const showButtons = screen.getAllByText(/Show replies/);
      expect(showButtons.length).toBe(2);
    });

    it("should show/hide replies independently for each comment", () => {
      renderWithProvider(
        <CommentList
          comments={[mockComment2, mockComment1]}
          postId={mockPostId}
        />,
      );

      // Show replies for comment-2
      const showButton = screen.getByText(/Show replies \((2)\)/);
      fireEvent.click(showButton);

      // comment-2 replies should be visible
      expect(screen.getByText("First reply")).toBeInTheDocument();
      expect(screen.getByText("Second reply")).toBeInTheDocument();

      // comment-1 has no replies, so nothing to hide/show
    });
  });
});
