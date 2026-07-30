// tests/components/PexelsPhotoCard.test.tsx
import { screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import PexelsPhotoCard from "@/components/PexelsPhotoCard";
import type { PexelsPhoto } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

const makePhoto = (id = 1): PexelsPhoto =>
  ({
    id,
    url: `https://pexels.example/${id}`,
    alt: `Alt ${id}`,
    photographer: `Photographer ${id}`,
    photographer_url: `https://pexels.example/photographer/${id}`,
    src: {
      medium: `https://images.example/${id}-medium.jpg`,
      large: `https://images.example/${id}-large.jpg`,
      original: `https://images.example/${id}-original.jpg`,
    },
  }) as unknown as PexelsPhoto;

describe("PexelsPhotoCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders image with correct src and alt", () => {
    const photo = makePhoto(5);

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={() => () => {}}
        handleClickInsert={() => {}}
        handleOpenEnlarge={() => {}}
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", photo.src.medium);
    expect(img).toHaveAttribute("alt", photo.alt);
  });

  it("clicking the image calls handleOpenEnlarge(photo)", async () => {
    const photo = makePhoto(7);
    const onEnlarge = vi.fn();

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={() => () => {}}
        handleClickInsert={() => {}}
        handleOpenEnlarge={onEnlarge}
      />,
    );

    const imgButton = screen.getByRole("button", {
      name: `Enlarge photo by ${photo.photographer}`,
    });

    await userEvent.click(imgButton);

    expect(onEnlarge).toHaveBeenCalledWith(photo);
  });

  it("pressing Enter or Space on the image triggers enlarge", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(8);
    const onEnlarge = vi.fn();

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={() => () => {}}
        handleClickInsert={() => {}}
        handleOpenEnlarge={onEnlarge}
      />,
    );

    const imgButton = screen.getByRole("button", {
      name: `Enlarge photo by ${photo.photographer}`,
    });

    // Must focus the button for keyboard events to reach it
    imgButton.focus();
    expect(imgButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onEnlarge).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onEnlarge).toHaveBeenCalledTimes(2);
  });

  it("clicking Insert calls handleClickInsert(photo)", async () => {
    const photo = makePhoto(9);
    const onInsert = vi.fn();

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={() => () => {}}
        handleClickInsert={onInsert}
        handleOpenEnlarge={() => {}}
      />,
    );

    const insertBtn = screen.getByRole("button", {
      name: `Insert photo by ${photo.photographer} into editor`,
    });

    await userEvent.click(insertBtn);

    expect(onInsert).toHaveBeenCalledWith(photo);
  });

  it("pressing Enter or Space on the card triggers insert", async () => {
    const user = userEvent.setup();
    const photo = makePhoto(10);
    const onInsert = vi.fn();

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={() => () => {}}
        handleClickInsert={onInsert}
        handleOpenEnlarge={() => {}}
      />,
    );

    const card = screen.getByRole("article");

    // Must focus the card for keyboard events to reach it
    card.focus();
    expect(card).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onInsert).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onInsert).toHaveBeenCalledTimes(2);
  });

  it("dragstart calls handleDragStart(photo) and sets dataTransfer", () => {
    const photo = makePhoto(11);
    const dragFn = vi.fn(() => (e: any) => {
      e.dataTransfer.setData("text/plain", "dragged");
    });

    renderWithProvider(
      <PexelsPhotoCard
        photo={photo}
        handleDragStart={dragFn}
        handleClickInsert={() => {}}
        handleOpenEnlarge={() => {}}
      />,
    );

    const card = screen.getByRole("article");

    const dt: any = {
      data: {},
      setData(type: string, val: string) {
        this.data[type] = val;
      },
    };

    fireEvent.dragStart(card, { dataTransfer: dt });

    expect(dragFn).toHaveBeenCalledWith(photo);
    expect(dt.data["text/plain"]).toBe("dragged");
  });
});
