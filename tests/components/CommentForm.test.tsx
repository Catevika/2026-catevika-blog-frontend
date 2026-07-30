import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import CommentForm from "@/components/CommentForm";
import type { CommentFormProps } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

const defaultProps: CommentFormProps = {
  onSubmit: vi.fn(),
  isLoading: false,
};

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("CommentForm", () => {
  describe("basic rendering", () => {
    it("should render with default placeholder for new comment", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Add a comment..."),
      ).toBeInTheDocument();
    });

    it("should render with reply placeholder when parentId is provided", () => {
      renderWithProvider(
        <CommentForm {...defaultProps} parentId="comment-1" />,
      );

      expect(
        screen.getByPlaceholderText("Write a reply..."),
      ).toBeInTheDocument();
    });

    it("should render textarea with correct rows for new comment", () => {
      const { container } = renderWithProvider(
        <CommentForm {...defaultProps} />,
      );

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("rows", "4");
    });

    it("should render textarea with correct rows for reply", () => {
      const { container } = renderWithProvider(
        <CommentForm {...defaultProps} parentId="comment-1" />,
      );

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("rows", "2");
    });

    it("should render message length indicator", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      expect(screen.getByText("Message length:")).toBeInTheDocument();
      expect(screen.getByText("0/5000")).toBeInTheDocument();
    });

    it("should render Cancel button", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      expect(screen.getByText("Cancel Text")).toBeInTheDocument();
    });

    it("should render Submit button with correct text for new comment", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      expect(screen.getByText("Send Comment")).toBeInTheDocument();
    });

    it("should render Submit button with correct text for reply", () => {
      renderWithProvider(
        <CommentForm {...defaultProps} parentId="comment-1" />,
      );

      expect(screen.getByText("Send Reply")).toBeInTheDocument();
    });
  });

  describe("content input", () => {
    it("should update content when typing in textarea", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "Test comment" } });

      expect(textarea).toHaveValue("Test comment");
      expect(screen.getByText("Message length:")).toBeInTheDocument();
      expect(screen.getByText("12/5000")).toBeInTheDocument();
    });

    it("should start with initialContent if provided", () => {
      renderWithProvider(
        <CommentForm {...defaultProps} initialContent="Pre-filled content" />,
      );

      const textarea = screen.getByPlaceholderText("Add a comment...");
      expect(textarea).toHaveValue("Pre-filled content");
      expect(screen.getByText("18/5000")).toBeInTheDocument();
    });

    it("should disable submit button when content is empty", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const submitButton = screen.getByText("Send Comment");
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when content is only whitespace", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "   " } });

      const submitButton = screen.getByText("Send Comment");
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when content has text", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "Test comment" } });

      const submitButton = screen.getByText("Send Comment");
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("submit functionality", () => {
    it("should call onSubmit with trimmed content when form is submitted", () => {
      const handleSubmit = vi.fn();
      renderWithProvider(
        <CommentForm {...defaultProps} onSubmit={handleSubmit} />,
      );

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "  Test comment  " } });

      const submitButton = screen.getByText("Send Comment");
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledWith({ content: "Test comment" });
    });

    it("should call onSubmit with content and parentId when replying", () => {
      const handleSubmit = vi.fn();
      renderWithProvider(
        <CommentForm
          {...defaultProps}
          parentId="comment-1"
          onSubmit={handleSubmit}
        />,
      );

      const textarea = screen.getByPlaceholderText("Write a reply...");
      fireEvent.change(textarea, { target: { value: "Reply content" } });

      const submitButton = screen.getByText("Send Reply");
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledWith({
        content: "Reply content",
        parentId: "comment-1",
      });
    });

    it("should clear content after successful submission", () => {
      const handleSubmit = vi.fn();
      renderWithProvider(
        <CommentForm {...defaultProps} onSubmit={handleSubmit} />,
      );

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "Test comment" } });

      const submitButton = screen.getByText("Send Comment");
      fireEvent.click(submitButton);

      expect(textarea).toHaveValue("");
      expect(screen.getByText("0/5000")).toBeInTheDocument();
    });

    it("should not call onSubmit when content is empty", () => {
      const handleSubmit = vi.fn();
      renderWithProvider(
        <CommentForm {...defaultProps} onSubmit={handleSubmit} />,
      );

      const submitButton = screen.getByText("Send Comment");
      fireEvent.click(submitButton);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("cancel functionality", () => {
    it("should call onClose when Cancel button is clicked", () => {
      const handleClose = vi.fn();
      renderWithProvider(
        <CommentForm {...defaultProps} onClose={handleClose} />,
      );

      const cancelButton = screen.getByText("Cancel Text");
      fireEvent.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it("should clear content when Cancel button is clicked", () => {
      const handleClose = vi.fn();
      renderWithProvider(
        <CommentForm {...defaultProps} onClose={handleClose} />,
      );

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "Test comment" } });

      const cancelButton = screen.getByText("Cancel Text");
      fireEvent.click(cancelButton);

      expect(textarea).toHaveValue("");
      expect(screen.getByText("0/5000")).toBeInTheDocument();
    });

    it("should clear content even if onClose is not provided", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add a comment...");
      fireEvent.change(textarea, { target: { value: "Test comment" } });

      const cancelButton = screen.getByText("Cancel Text");
      fireEvent.click(cancelButton);

      expect(textarea).toHaveValue("");
    });
  });

  describe("loading state", () => {
    it("should show Posting... text when isLoading is true", () => {
      renderWithProvider(<CommentForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Posting...")).toBeInTheDocument();
    });

    it("should disable Cancel button when isLoading is true", () => {
      renderWithProvider(<CommentForm {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByText("Cancel Text");
      expect(cancelButton).toBeDisabled();
    });

    it("should disable submit button when isLoading is true", () => {
      renderWithProvider(<CommentForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByText("Posting...");
      expect(submitButton).toBeDisabled();
    });
  });

  describe("custom placeholder", () => {
    it("should use custom placeholder when provided", () => {
      renderWithProvider(
        <CommentForm {...defaultProps} placeholder="Write your thoughts..." />,
      );

      expect(
        screen.getByPlaceholderText("Write your thoughts..."),
      ).toBeInTheDocument();
    });

    it("should use custom placeholder even when parentId is provided", () => {
      renderWithProvider(
        <CommentForm
          {...defaultProps}
          parentId="comment-1"
          placeholder="Custom placeholder"
        />,
      );

      // Custom placeholder is used when explicitly provided
      expect(
        screen.getByPlaceholderText("Custom placeholder"),
      ).toBeInTheDocument();
    });
  });

  describe("textarea attributes", () => {
    it("should have correct id and name attributes", () => {
      const { container } = renderWithProvider(
        <CommentForm {...defaultProps} />,
      );

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("id", "comment");
      expect(textarea).toHaveAttribute("name", "comment");
    });

    it("should have maxLength of 5000", () => {
      const { container } = renderWithProvider(
        <CommentForm {...defaultProps} />,
      );

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("maxLength", "5000");
    });

    it("should update length indicator as user types", () => {
      renderWithProvider(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add a comment...");

      fireEvent.change(textarea, { target: { value: "A" } });
      expect(screen.getByText("1/5000")).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: "ABC" } });
      expect(screen.getByText("3/5000")).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: "" } });
      expect(screen.getByText("0/5000")).toBeInTheDocument();
    });
  });
});
