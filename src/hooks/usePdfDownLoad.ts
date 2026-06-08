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

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF";

        try {
          const errorData: unknown = await response.json();
          console.error("🚨 PDF Generation Error:", errorData);

          if (typeof errorData === "object" && errorData !== null) {
            const ed = errorData as { message?: string; error?: string };
            errorMessage = ed.message ?? ed.error ?? errorMessage;
          } else {
            // If response JSON isn't an object, include status info
            errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
          }
        } catch {
          // If response is not JSON or parsing failed, use status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      console.log(`✅ PDF generated successfully (${blob.size} bytes)`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Sanitize filename: remove special characters, limit length
      const sanitizedTitle = title
        .replace(/[^a-z0-9\s-]/gi, "_")
        .replace(/\s+/g, "_")
        .substring(0, 100);

      a.download = `${sanitizedTitle}.pdf`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
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

      // Optional: You could also throw here if you want to handle it elsewhere
      // throw error;
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
