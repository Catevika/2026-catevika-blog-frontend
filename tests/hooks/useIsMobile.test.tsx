import { useIsMobile } from "@/hooks/useIsMobile";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("returns false when window width is >= 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true when window width is < 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("updates to false when window is resized to >= 768", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("updates to true when window is resized to < 768", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("removes resize listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", addSpy.mock.calls[0][1]);
  });
});
