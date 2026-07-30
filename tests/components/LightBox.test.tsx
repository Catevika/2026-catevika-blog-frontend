// tests/components/LightBox.test.tsx
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LightBox from "@/components/LightBox";
import type { PexelsPhoto } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

const makePhoto = (id = 1): PexelsPhoto =>
  ({
    id,
    alt: `Alt ${id}`,
    photographer: `Photographer ${id}`,
    photographer_url: "",
    url: "",
    src: {
      large: `https://example.com/${id}-large.jpg`,
      medium: `https://example.com/${id}-medium.jpg`,
      original: `https://example.com/${id}-original.jpg`,
    },
  }) as unknown as PexelsPhoto;

describe("LightBox", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
    cleanup();
  });

  it("renders nothing when enlargedPhoto is null", () => {
    const { container } = renderWithProvider(
      <LightBox enlargedPhoto={null} handleCloseEnlarge={() => {}} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders image and photographer when enlargedPhoto is provided", () => {
    const photo = makePhoto(10);

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={() => {}} />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", photo.src.large);
    expect(screen.getByText(photo.photographer)).toBeInTheDocument();
  });

  it("focuses the close button when opened", () => {
    const photo = makePhoto(2);

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={() => {}} />,
    );

    const closeBtn = screen.getByRole("button", {
      name: "Close enlarged photo",
    });

    expect(closeBtn).toHaveFocus();
  });

  it("prevents body scroll while open and restores it on close", () => {
    const photo = makePhoto(3);
    const { rerender } = renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={() => {}} />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<LightBox enlargedPhoto={null} handleCloseEnlarge={() => {}} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when clicking the backdrop", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(4);
    const onClose = vi.fn();

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={onClose} />,
    );

    const backdrop = screen.getByRole("presentation");
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT close when clicking inside the dialog", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(5);
    const onClose = vi.fn();

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={onClose} />,
    );

    const dialog = screen.getByRole("dialog");
    await user.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when clicking the close button", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(6);
    const onClose = vi.fn();

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={onClose} />,
    );

    const closeBtn = screen.getByRole("button", {
      name: "Close enlarged photo",
    });

    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when pressing Escape (global listener)", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(7);
    const onClose = vi.fn();

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={onClose} />,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when pressing Enter or Space on the backdrop", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(8);
    const onClose = vi.fn();

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={onClose} />,
    );

    const backdrop = screen.getByRole("presentation");
    backdrop.focus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps focus trapped inside dialog when tabbing", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(9);

    renderWithProvider(
      <LightBox enlargedPhoto={photo} handleCloseEnlarge={() => {}} />,
    );

    screen.getByRole("dialog");
    const closeBtn = screen.getByRole("button", {
      name: "Close enlarged photo",
    });

    // First focus is already on close button
    expect(closeBtn).toHaveFocus();

    // Tab should loop to first focusable element (close button)
    await user.tab();
    expect(closeBtn).toHaveFocus();

    // Shift+Tab should also loop
    await user.tab({ shift: true });
    expect(closeBtn).toHaveFocus();
  });
});
