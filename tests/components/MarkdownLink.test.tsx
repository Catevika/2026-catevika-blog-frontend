import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import MarkdownLink from "@/components/MarkdownLink";

afterEach(() => {
  cleanup();
});

describe("MarkdownLink", () => {
  it("renders with children and href", () => {
    render(<MarkdownLink href="https://example.com">Link Text</MarkdownLink>);

    expect(screen.getByText("Link Text")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("adds target and rel for external HTTP links", () => {
    render(<MarkdownLink href="https://example.com">External</MarkdownLink>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add target/rel for hash links", () => {
    render(<MarkdownLink href="#section">Hash Link</MarkdownLink>);

    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(link).toHaveAttribute("href", "#section");
  });

  it("does not add target/rel for relative paths", () => {
    render(<MarkdownLink href="/page">Relative</MarkdownLink>);

    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(link).toHaveAttribute("href", "/page");
  });

  it("keeps relative paths with ./ prefix", () => {
    render(<MarkdownLink href="./page">Relative</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "./page");
  });

  it("keeps relative paths with ../ prefix", () => {
    render(<MarkdownLink href="../page">Relative</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "../page");
  });

  it("normalizes protocol-relative URLs to HTTPS", () => {
    Object.defineProperty(window, "location", {
      value: { host: "localhost:3000", protocol: "https:" },
      writable: true,
    });

    render(<MarkdownLink href="//example.com/path">Link</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com/path",
    );
  });

  it("normalizes bare domains to HTTPS", () => {
    render(<MarkdownLink href="example.com">Link</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("keeps upload placeholders as-is", () => {
    render(<MarkdownLink href="upload-1234">Image</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "upload-1234");
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it("keeps upload placeholders with uppercase as-is", () => {
    render(<MarkdownLink href="upload-ABCD">Image</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "upload-ABCD");
  });

  it("keeps mailto links as-is", () => {
    render(<MarkdownLink href="mailto:test@example.com">Email</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "mailto:test@example.com",
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it("keeps tel links as-is", () => {
    render(<MarkdownLink href="tel:+1234567890">Phone</MarkdownLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "tel:+1234567890");
  });

  it("passes through additional props", () => {
    render(
      <MarkdownLink href="/page" className="custom-class" data-testid="my-link">
        Link
      </MarkdownLink>,
    );

    const link = screen.getByTestId("my-link");
    expect(link).toHaveClass("custom-class");
  });

  it("renders without href", () => {
    const { container } = render(<MarkdownLink>No href</MarkdownLink>);

    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).not.toHaveAttribute("href");
  });

  it("adds target/rel for external link on different host", () => {
    Object.defineProperty(window, "location", {
      value: { host: "localhost:3000", protocol: "https:" },
      writable: true,
    });

    render(<MarkdownLink href="https://other.com">External</MarkdownLink>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add target/rel for same-host link", () => {
    Object.defineProperty(window, "location", {
      value: { host: "localhost:3000", protocol: "https:" },
      writable: true,
    });

    render(
      <MarkdownLink href="https://localhost:3000/page">Same</MarkdownLink>,
    );

    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});
