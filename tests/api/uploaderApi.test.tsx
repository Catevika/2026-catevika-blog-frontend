import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploaderApi } from "@/api/uploaderApi";
import type { ImageUploadResponse } from "@/types";

describe("uploaderApi.uploadImage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const makeFile = (name = "test.png", size = 1000, type = "image/png") =>
    new File(["x".repeat(size)], name, { type });

  it("uploads image and returns parsed JSON on success", async () => {
    const file = makeFile();

    const mockResponse: ImageUploadResponse = {
      success: true,
      data: {
        url: "/uploads/test.png",
        filename: "test.png",
        duplicate: false,
      },
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await uploaderApi.uploadImage(file);

    expect(fetch).toHaveBeenCalledWith(
      "/api/upload/image",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: expect.any(FormData),
      }),
    );

    expect(result).toEqual(mockResponse);
  });

  it("throws error with server message when response is not ok and text() succeeds", async () => {
    const file = makeFile();

    (fetch as any).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Bad request"),
    });

    await expect(uploaderApi.uploadImage(file)).rejects.toThrow("Bad request");
  });

  it("throws generic error when response is not ok and text() fails", async () => {
    const file = makeFile();

    (fetch as any).mockResolvedValue({
      ok: false,
      text: () => Promise.reject("fail"),
    });

    await expect(uploaderApi.uploadImage(file)).rejects.toThrow(
      "Upload failed",
    );
  });

  it("returns JSON even if success=false or missing fields", async () => {
    const file = makeFile();

    const mockResponse: ImageUploadResponse = {
      success: false,
      data: undefined,
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await uploaderApi.uploadImage(file);

    expect(result).toEqual(mockResponse);
  });
});
