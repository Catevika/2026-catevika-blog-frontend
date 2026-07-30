import { describe, it, expect, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import MarkdownImage from "@/components/MarkdownImage";
import { renderWithProvider } from "../utils/renderWithProvider";

afterEach(() => {
  cleanup();
});

describe("MarkdownImage", () => {
  it("should render with src and alt", () => {
    renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" alt="Test image" />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(img).toHaveAttribute("alt", "Test image");
  });

  it("should render with empty alt when alt is not provided", () => {
    const { container } = renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" />,
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
  });

  it("should have correct className", () => {
    renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" alt="Test" />,
    );

    const img = screen.getByRole("img");
    expect(img.className).toContain("my-2");
    expect(img.className).toContain("h-auto");
    expect(img.className).toContain("max-h-50");
    expect(img.className).toContain("max-w-full");
    expect(img.className).toContain("rounded-md");
    expect(img.className).toContain("object-cover");
    expect(img.className).toContain("md:max-h-100");
  });

  it("should have style for centered block display", () => {
    renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" alt="Test" />,
    );

    const img = screen.getByRole("img");
    expect(img.style.display).toBe("block");
    expect(img.style.marginLeft).toBe("auto");
    expect(img.style.marginRight).toBe("auto");
  });

  it("should have loading='eager' attribute", () => {
    renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" alt="Test" />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("should have decoding='async' attribute", () => {
    renderWithProvider(
      <MarkdownImage src="https://example.com/image.jpg" alt="Test" />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("decoding", "async");
  });

  it("should hide image on error", () => {
    const { container } = renderWithProvider(
      <MarkdownImage src="https://example.com/broken.jpg" alt="Broken" />,
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();

    // Simulate error
    const errorEvent = new Event("error", { bubbles: true });
    img?.dispatchEvent(errorEvent);

    expect(img?.style.display).toBe("none");
  });

  it("should accept additional props", () => {
    const { container } = renderWithProvider(
      <MarkdownImage
        src="https://example.com/image.jpg"
        alt="Test"
        data-testid="custom-image"
        title="Custom title"
      />,
    );

    const img = container.querySelector("img[data-testid='custom-image']");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("title", "Custom title");
  });
});
