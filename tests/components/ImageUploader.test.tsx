// tests/components/ImageUploader.test.tsx
import { screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageUploader from "@/components/ImageUploader";
import { uploaderApi } from "@/api/uploaderApi";
import { renderWithProvider } from "../utils/renderWithProvider";

// Mock uploaderApi
vi.mock("@/api/uploaderApi", () => ({
  uploaderApi: {
    uploadImage: vi.fn(),
  },
}));

// Helper to create a fake File
const makeFile = (name = "photo.png", size = 1000, type = "image/png") =>
  new File(["x".repeat(size)], name, { type });

const noop = () => {};

describe("ImageUploader", () => {
  beforeEach(() => {
    window.__draggedImageFile = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.__draggedImageFile = undefined;
    cleanup();
  });

  it("renders upload prompt when no preview", () => {
    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);
    expect(screen.getByText("Upload JPG, JPEG or PNG")).toBeInTheDocument();
  });

  it("selects a valid file and shows preview", async () => {
    const user = userEvent.setup();
    const file = makeFile("test.png");

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    // Correct way to get the file input
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, file);

    const img = await screen.findByRole("img", { name: "Preview" });
    expect(img).toBeInTheDocument();
    expect(window.__draggedImageFile).toBe(file);
  });

  it("shows error for invalid file type", async () => {
    const file = makeFile("bad.gif", 1000, "image/gif");

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    // Directly trigger the change event on the hidden file input
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Only JPG, JPEG and PNG images allowed");
  });

  it("shows error for file too large", async () => {
    const file = makeFile("big.png", 6 * 1024 * 1024); // 6MB

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Max 5MB file size exceeded");
  });

  it("handles drag-and-drop file selection", () => {
    const file = makeFile("drop.png");

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    const dropZone = screen.getByRole("button", { name: /Upload JPG/i });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByRole("img", { name: "Preview" })).toBeInTheDocument();
    expect(window.__draggedImageFile).toBe(file);
  });

  it("dragstart sets markdown placeholder and stores file globally", () => {
    const file = makeFile("drag.png");

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    // Select file via direct change on the hidden input
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // Now the preview button exists
    const dragBtn = screen.getByRole("button", {
      name: /Drag to editor or click to enlarge/i,
    });

    const dt: any = {
      data: {},
      setData(type: string, val: string) {
        this.data[type] = val;
      },
    };

    fireEvent.dragStart(dragBtn, { dataTransfer: dt });

    expect(dt.data["text/plain"]).toContain("![drag]");
    expect(window.__draggedImageFile).toBe(file);
  });

  it("clicking preview triggers onEnlarge", async () => {
    const user = userEvent.setup();
    const file = makeFile("zoom.png");
    const onEnlarge = vi.fn();

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={onEnlarge} />);

    // Select file via direct change event
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // Now the preview button exists
    const previewBtn = await screen.findByRole("button", {
      name: /Drag to editor or click to enlarge/i,
    });

    await user.click(previewBtn);

    expect(onEnlarge).toHaveBeenCalled();
  });

  it("reset clears preview and global dragged file", async () => {
    const user = userEvent.setup();
    const file = makeFile("reset.png");

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    // Select file via direct change event
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // Preview should now exist
    expect(
      await screen.findByRole("img", { name: "Preview" }),
    ).toBeInTheDocument();
    expect(window.__draggedImageFile).toBe(file);

    // Click Reset
    const resetBtn = screen.getByRole("button", { name: "Reset" });
    await user.click(resetBtn);

    // Preview removed
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    // Global dragged file cleared
    expect(window.__draggedImageFile).toBeUndefined();
  });

  it("Insert uploads file and calls onInsert with markdown", async () => {
    const user = userEvent.setup();
    const file = makeFile("insert.png");
    const onInsert = vi.fn();

    (uploaderApi.uploadImage as any).mockResolvedValue({
      success: true,
      data: { url: "/uploads/insert.png" },
    });

    renderWithProvider(<ImageUploader onInsert={onInsert} onEnlarge={noop} />);

    // Select file via direct change event
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    const insertBtns = await screen.findAllByRole("button", {
      name: "Insert",
    });

    const insertBtn = insertBtns[0];
    await user.click(insertBtn);

    expect(onInsert).toHaveBeenCalledWith(
      expect.stringContaining("![insert]("),
    );
  });

  it("Insert shows error when upload fails", async () => {
    const user = userEvent.setup();
    const file = makeFile("fail.png");

    (uploaderApi.uploadImage as any).mockRejectedValue(new Error("fail"));

    renderWithProvider(<ImageUploader onInsert={noop} onEnlarge={noop} />);

    // Select file via direct change event
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    const insertBtns = await screen.findAllByRole("button", { name: "Insert" });

    const insertBtn = insertBtns[0];
    await user.click(insertBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Upload failed");
  });
});
