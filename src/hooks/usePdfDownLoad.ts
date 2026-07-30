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
            errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
          }
        } catch {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      console.log(`✅ PDF generated successfully (${blob.size} bytes)`);

      const sanitizedTitle = title
        .replace(/[^a-z0-9\s-]/gi, "_")
        .replace(/\s+/g, "_")
        .substring(0, 100);

      const filename = `${sanitizedTitle}.pdf`;
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      console.log(`📥 PDF download triggered: ${filename}`);
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
