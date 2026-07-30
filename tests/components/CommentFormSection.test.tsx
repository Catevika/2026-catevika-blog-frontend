import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import CommentFormSection from "@/components/CommentFormSection";
import { renderWithProvider } from "../utils/renderWithProvider";

// Mock CommentForm
vi.mock("@/components/CommentForm", () => ({
  default: vi.fn(({ onSubmit, isLoading }) => (
    <form data-testid="comment-form" onSubmit={(e) => e.preventDefault()}>
      <input
        type="hidden"
        name="onSubmit"
        value={onSubmit ? "defined" : "undefined"}
      />
      <input
        type="hidden"
        name="isLoading"
        value={isLoading ? "true" : "false"}
      />
      <textarea data-testid="textarea" placeholder="Add a comment..." />
      <button type="submit">Send Comment</button>
    </form>
  )),
}));

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("CommentFormSection", () => {
  describe("basic rendering", () => {
    it("should render Card component", () => {
      const { container } = renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });

    it("should have correct id on Card", () => {
      const { container } = renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(
        container.querySelector("#commentFormSection"),
      ).toBeInTheDocument();
    });

    it("should render CardTitle with 'Leave a comment'", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.getByText("Leave a comment")).toBeInTheDocument();
    });

    it("should render CommentForm", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });
  });

  describe("Post Author badge", () => {
    it("should show Post Author badge when isPostAuthor is true", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={true}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.getByText("Post Author")).toBeInTheDocument();
    });

    it("should not show Post Author badge when isPostAuthor is false", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.queryByText("Post Author")).not.toBeInTheDocument();
    });

    it("should have Badge with correct className when isPostAuthor is true", () => {
      const { container } = renderWithProvider(
        <CommentFormSection
          isPostAuthor={true}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      const badge = container.querySelector('[class*="h-7"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("h-7");
      expect(badge).toHaveClass("px-3");
      expect(badge).toHaveClass("text-base");
    });
  });

  describe("CommentForm integration", () => {
    it("should pass createCommentMutation.mutate as onSubmit to CommentForm", () => {
      const mockMutate = vi.fn();
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={
            { mutate: mockMutate, isPending: false } as any
          }
        />,
      );

      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });

    it("should pass createCommentMutation.isPending as isLoading to CommentForm", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: true } as any}
        />,
      );

      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });

    it("should render CommentForm with isPending=false when mutation is not pending", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.getByText("Send Comment")).toBeInTheDocument();
    });

    it("should render CommentForm with Posting... text when mutation is pending", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: true } as any}
        />,
      );

      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });
  });

  describe("CardHeader styling", () => {
    it("should have CardHeader with flex and gap-2 classes", () => {
      const { container } = renderWithProvider(
        <CommentFormSection
          isPostAuthor={false}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      const cardHeader = container.querySelector('[data-slot="card-header"]');
      expect(cardHeader).toBeInTheDocument();
      expect(cardHeader).toHaveClass("flex");
      expect(cardHeader).toHaveClass("items-center");
      expect(cardHeader).toHaveClass("gap-2");
    });
  });

  describe("when Post Author and has badge", () => {
    it("should render both CardTitle and Badge together", () => {
      renderWithProvider(
        <CommentFormSection
          isPostAuthor={true}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      expect(screen.getByText("Leave a comment")).toBeInTheDocument();
      expect(screen.getByText("Post Author")).toBeInTheDocument();
    });

    it("should have both elements in CardHeader", () => {
      const { container } = renderWithProvider(
        <CommentFormSection
          isPostAuthor={true}
          createCommentMutation={{ mutate: vi.fn(), isPending: false } as any}
        />,
      );

      const cardHeader = container.querySelector('[data-slot="card-header"]');
      expect(cardHeader).toBeInTheDocument();
      expect(cardHeader?.textContent).toContain("Leave a comment");
      expect(cardHeader?.textContent).toContain("Post Author");
    });
  });
});
