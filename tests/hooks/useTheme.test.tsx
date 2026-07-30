import { useTheme } from "@/hooks/useTheme";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.removeAttribute("data-color-mode");
    document.body.removeAttribute("data-color-mode");

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("initial theme", () => {
    it("returns 'dark' when localStorage has 'dark'", () => {
      localStorageMock.getItem.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("dark");
      expect(result.current.className).toBe("dark");
      expect(result.current.dataColorMode).toBe("dark");
    });

    it("returns 'light' when localStorage has 'light'", () => {
      localStorageMock.getItem.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("light");
      expect(result.current.className).toBe("light");
      expect(result.current.dataColorMode).toBe("light");
    });

    it("defaults to 'light' when localStorage is empty", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("light");
    });

    it("defaults to 'dark' when matchMedia prefers dark", () => {
      localStorageMock.getItem.mockReturnValue(null);

      window.matchMedia = vi.fn((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("dark");
    });

    it("defaults to 'light' when localStorage has invalid value", () => {
      localStorageMock.getItem.mockReturnValue("invalid");

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("light");
    });
  });

  describe("setTheme", () => {
    it("changes theme to 'dark'", () => {
      localStorageMock.getItem.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
      expect(result.current.className).toBe("dark");
      expect(result.current.dataColorMode).toBe("dark");
    });

    it("changes theme to 'light'", () => {
      localStorageMock.getItem.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.theme).toBe("light");
      expect(result.current.className).toBe("light");
      expect(result.current.dataColorMode).toBe("light");
    });
  });

  describe("DOM updates", () => {
    it("updates html class and data-color-mode attributes", () => {
      localStorageMock.getItem.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.body.getAttribute("data-color-mode")).toBe("light");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "light");

      act(() => {
        result.current.setTheme("dark");
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.body.getAttribute("data-color-mode")).toBe("dark");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    });
  });
});
