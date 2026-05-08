import { useCallback, useState } from "react";

export const usePdfDownload = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const clearPdfError = useCallback(() => {
    setPdfError(null);
  }, []);

  const downloadPdf = useCallback(async (postId: string, title: string) => {
    if (!postId || !title) {
      setPdfError("Missing post information");
      return;
    }

    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      console.log(`📄 Generating PDF for post: ${postId}`);

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, title }),
      });

      // Handle auth-specific statuses first
      if (response.status === 401) {
        throw new Error("You must be logged in to export this post");
      }
      if (response.status === 403) {
        throw new Error("You are not authorized to export this post");
      }

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF";

        try {
          // Define the expected error shape
          const errorData: unknown = await response.json();

          // Narrow the type safely
          if (
            typeof errorData === "object" &&
            errorData !== null &&
            ("message" in errorData || "error" in errorData)
          ) {
            const typed = errorData as { message?: string; error?: string };
            console.error("🚨 PDF Generation Error:", typed);
            errorMessage = typed.message ?? typed.error ?? errorMessage;
          } else {
            // JSON exists but doesn't match expected shape
            errorMessage = `${errorMessage} (Unexpected error format)`;
          }
        } catch {
          // JSON parsing failed entirely
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      console.log(`✅ PDF generated successfully (${blob.size} bytes)`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const sanitizedTitle = title
        .replace(/[^a-z0-9\s-]/gi, "_")
        .replace(/\s+/g, "_")
        .substring(0, 100);

      a.download = `${sanitizedTitle}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`📥 PDF download triggered: ${sanitizedTitle}.pdf`);
    } catch (error) {
      console.error("❌ PDF Download Failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating the PDF";

      setPdfError(errorMessage);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, []);

  return {
    downloadPdf,
    isGeneratingPdf,
    pdfError,
    clearPdfError,
  };
};
