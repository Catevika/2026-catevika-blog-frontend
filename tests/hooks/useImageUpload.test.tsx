import { uploaderApi } from "@/api/uploaderApi";
import { useImageUpload } from "@/api/uploaderHooks";
import type { ImageUploadResponse } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

vi.mock("@/api/uploaderApi", () => ({
  uploaderApi: {
    uploadImage: vi.fn(),
  },
}));

let queryClient: QueryClient;

function createWrapper() {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, {
      client: queryClient,
      children,
    });

  return { wrapper };
}

const makeFile = (name = "test.png", size = 1000, type = "image/png") =>
  new File(["x".repeat(size)], name, { type });

describe("useImageUpload", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    cleanup();
  });

  it("calls onSuccess and invalidates posts on successful upload", async () => {
    const file = makeFile();
    const onSuccess = vi.fn();

    const mockResponse: ImageUploadResponse = {
      success: true,
      data: { url: "/img.png", filename: "img.png", duplicate: false },
    };

    (uploaderApi.uploadImage as unknown as Mock).mockResolvedValue(
      mockResponse,
    );

    const { wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useImageUpload({ onSuccess }), {
      wrapper,
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("/img.png", "img.png");
    });

    expect(invalidateSpy).toHaveBeenCalled();
    const arg = invalidateSpy.mock.calls[0]?.[0];

    if (Array.isArray(arg)) {
      expect(arg).toEqual(["posts"]);
    } else if (typeof arg === "string") {
      expect(arg).toBe("posts");
    } else {
      expect(arg).toEqual({ queryKey: ["posts"] });
    }
  });

  it("logs duplicate message when duplicate=true", async () => {
    const file = makeFile();
    const onSuccess = vi.fn();

    const mockResponse: ImageUploadResponse = {
      success: true,
      data: { url: "/img.png", filename: "img.png", duplicate: true },
    };

    (uploaderApi.uploadImage as unknown as Mock).mockResolvedValue(
      mockResponse,
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useImageUpload({ onSuccess }), {
      wrapper,
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "🎯 Using existing image:",
        "img.png",
      );
    });
  });

  it("does nothing when upload succeeds but url is empty", async () => {
    const file = makeFile();
    const onSuccess = vi.fn();

    const mockResponse: ImageUploadResponse = {
      success: true,
      data: { url: "", duplicate: false },
    };

    (uploaderApi.uploadImage as unknown as Mock).mockResolvedValue(
      mockResponse,
    );

    const { wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useImageUpload({ onSuccess }), {
      wrapper,
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("logs error on upload failure", async () => {
    const file = makeFile();

    (uploaderApi.uploadImage as unknown as Mock).mockRejectedValue(
      new Error("fail"),
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useImageUpload(), { wrapper });

    await result.current.mutateAsync(file).catch(() => {});

    expect(errorSpy).toHaveBeenCalledWith("Image upload failed:", "fail");
  });

  it("retry logic: no retry on 400 or 413 errors", () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useImageUpload(), { wrapper });

    const retry = (result.current as any).retry;

    expect(retry(0, new Error("400 Bad Request"))).toBe(false);
    expect(retry(0, new Error("413 Payload Too Large"))).toBe(false);
  });

  it("retry logic: retry once on non-client errors", () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useImageUpload(), { wrapper });

    const retry = (result.current as any).retry;

    expect(retry(0, new Error("Network error"))).toBe(true);
    expect(retry(1, new Error("Network error"))).toBe(false);
  });
});
