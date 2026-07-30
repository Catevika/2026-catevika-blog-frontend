import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import CommentsErrorBoundary from "@/components/CommentsErrorBoundary";
import { renderWithProvider } from "../utils/renderWithProvider";

const createMockError = (message: string) => ({
  name: "FetchError",
  message,
});

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("CommentsErrorBoundary", () => {
  it("should render with error message", () => {
    const mockError = createMockError("Failed to fetch comments");

    renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Failed to load comments")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch comments")).toBeInTheDocument();
  });

  it("should show 'Unknown error' when error message is undefined", () => {
    const mockError = { name: "FetchError", message: undefined };

    renderWithProvider(
      <CommentsErrorBoundary error={mockError as any} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Unknown error")).toBeInTheDocument();
  });

  it("should have role='alert'", () => {
    const mockError = createMockError("Test error");

    const { container } = renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    const div = container.querySelector("#commentErrorBoundary");
    expect(div).toHaveAttribute("role", "alert");
  });

  it("should have error icon", () => {
    const mockError = createMockError("Test error");

    const { container } = renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have Try Again button", () => {
    const mockError = createMockError("Test error");

    renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should call onRetry when Try Again button is clicked", () => {
    const mockError = createMockError("Test error");
    const mockOnRetry = vi.fn();

    renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={mockOnRetry} />,
    );

    const button = screen.getByText("Try Again");
    fireEvent.click(button);

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it("should have button with type='button'", () => {
    const mockError = createMockError("Test error");

    const { container } = renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    const button = container.querySelector("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("should have button with className='plain'", () => {
    const mockError = createMockError("Test error");

    const { container } = renderWithProvider(
      <CommentsErrorBoundary error={mockError} onRetry={vi.fn()} />,
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("plain");
  });
});
