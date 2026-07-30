import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import CommentHeader from "@/components/CommentHeader";
import { renderWithProvider } from "../utils/renderWithProvider";

vi.mock("./TypographyH2", () => ({
  TypographyH2: ({ children }: any) => <h2>{children}</h2>,
}));

afterEach(() => {
  cleanup();
});

describe("CommentsHeader", () => {
  it("should render with total comments count", () => {
    renderWithProvider(<CommentHeader totalComments={5} />);

    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });

  it("should render with 0 comments", () => {
    renderWithProvider(<CommentHeader totalComments={0} />);

    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("should render with large comment count", () => {
    renderWithProvider(<CommentHeader totalComments={150} />);

    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(150)")).toBeInTheDocument();
  });

  it("should have Comments as h2 element", () => {
    const { container } = renderWithProvider(
      <CommentHeader totalComments={5} />,
    );

    const h2 = container.querySelector("h2");
    expect(h2).toBeInTheDocument();
    expect(h2?.textContent).toBe("Comments");
  });

  it("should have aria-live='polite' on comment count span", () => {
    const { container } = renderWithProvider(
      <CommentHeader totalComments={5} />,
    );

    const span = container.querySelector("span[aria-live='polite']");
    expect(span).toBeInTheDocument();
  });

  it("should have correct className for root div", () => {
    const { container } = renderWithProvider(
      <CommentHeader totalComments={5} />,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("flex");
    expect(div.className).toContain("items-center");
    expect(div.className).toContain("justify-between");
  });

  it("should have correct className for count span", () => {
    const { container } = renderWithProvider(
      <CommentHeader totalComments={5} />,
    );

    const span = container.querySelector("span");
    expect(span?.className).toContain("text-muted-foreground");
    expect(span?.className).toContain("pb-1");
    expect(span?.className).toContain("text-sm");
  });
});
