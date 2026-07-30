import { usePdfDownload } from "@/hooks/usePdfDownLoad";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../setup/server";

describe("usePdfDownload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("clearPdfError", () => {
    it("should clear pdf error", async () => {
      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.pdfError).toBe("Missing post information");
      });

      act(() => {
        result.current.clearPdfError();
      });

      await waitFor(() => {
        expect(result.current.pdfError).toBeNull();
      });
    });
  });

  describe("downloadPdf", () => {
    it("should successfully download PDF", async () => {
      const mockBlob = new Blob(["mock pdf content"], {
        type: "application/pdf",
      });

      server.use(
        http.post("/api/pdf", () => {
          return new HttpResponse(mockBlob, {
            headers: { "Content-Type": "application/pdf" },
          });
        }),
      );

      const { result } = renderHook(() => usePdfDownload());

      expect(result.current.isGeneratingPdf).toBe(false);
      expect(result.current.pdfError).toBeNull();

      await act(async () => {
        await result.current.downloadPdf("post-1", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.isGeneratingPdf).toBe(false);
        expect(result.current.pdfError).toBeNull();
      });
    });

    it("should call the public PDF endpoint without credentials", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValue(
        new Response(
          new Blob(["mock pdf content"], { type: "application/pdf" }),
          {
            status: 200,
            headers: { "Content-Type": "application/pdf" },
          },
        ),
      );

      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("post-1", "Test Post");
      });

      const [, init] = fetchSpy.mock.calls[0] ?? [];
      expect(init).toBeDefined();
      expect(init).not.toHaveProperty("credentials");
    });

    it("should set error when postId is missing", async () => {
      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.pdfError).toBe("Missing post information");
        expect(result.current.isGeneratingPdf).toBe(false);
      });
    });

    it("should set error when title is missing", async () => {
      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("post-1", "");
      });

      await waitFor(() => {
        expect(result.current.pdfError).toBe("Missing post information");
        expect(result.current.isGeneratingPdf).toBe(false);
      });
    });

    it("should handle API error with JSON message", async () => {
      server.use(
        http.post("/api/pdf", () => {
          return HttpResponse.json(
            { message: "PDF generation failed" },
            { status: 500 },
          );
        }),
      );

      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("post-1", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.isGeneratingPdf).toBe(false);
        expect(result.current.pdfError).toBe("PDF generation failed");
      });
    });

    it("should handle API error without JSON", async () => {
      server.use(
        http.post("/api/pdf", () => {
          return HttpResponse.text("Error", { status: 500 });
        }),
      );

      const { result } = renderHook(() => usePdfDownload());

      await act(async () => {
        await result.current.downloadPdf("post-1", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.isGeneratingPdf).toBe(false);
        expect(result.current.pdfError).toContain("500");
      });
    });

    it("should set isGeneratingPdf to true during download", async () => {
      server.use(
        http.post("/api/pdf", () => {
          return HttpResponse.json({ error: "Failed" }, { status: 500 });
        }),
      );

      const { result } = renderHook(() => usePdfDownload());

      expect(result.current.isGeneratingPdf).toBe(false);

      await act(async () => {
        await result.current.downloadPdf("post-1", "Test Post");
      });

      await waitFor(() => {
        expect(result.current.isGeneratingPdf).toBe(false);
        expect(result.current.pdfError).toBeTruthy();
      });
    });
  });
});
