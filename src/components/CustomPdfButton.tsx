import { Button } from "@/components/ui/button";
import { usePdfDownload } from "@/hooks/usePdfDownLoad";
import type { CustomPdfButtonProps } from "@/types";
import { BiDownload } from "react-icons/bi";

const CustomPdfButton = ({ postId, postTitle }: CustomPdfButtonProps) => {
  const { downloadPdf, isGeneratingPdf, pdfError, clearPdfError } =
    usePdfDownload();

  const handlePdfDownload = () => {
    if (postId && postTitle) {
      void downloadPdf(postId, postTitle);
    }
  };

  const handleClearError = () => {
    clearPdfError();
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant="default"
        onClick={handlePdfDownload}
        disabled={isGeneratingPdf}
        aria-label="Download PDF"
        title={isGeneratingPdf ? "Generating PDF..." : "Download as PDF"}
      >
        {isGeneratingPdf ? (
          <span className="flex items-center gap-2">
            <BiDownload className="animate-pulse" />
            Generating...
          </span>
        ) : (
          <BiDownload />
        )}
      </Button>

      {/* PDF Error Display - renders only when error exists */}
      {pdfError && (
        <div className="form-error mb-4 flex flex-col items-center justify-between">
          <span>{pdfError}</span>
          <button
            type="button"
            onClick={handleClearError}
            className="text-sm underline"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomPdfButton;
