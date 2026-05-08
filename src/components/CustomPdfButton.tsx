import { usePdfDownload } from "@/hooks/usePdfDownLoad";
import type { CustomPdfButtonProps } from "@/types";
import { BiDownload } from "react-icons/bi";
import { Button } from "@/components/ui/button";

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
    <>
      <Button
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
        <div className="flex items-center justify-between mb-4 form-error">
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
    </>
  );
};

export default CustomPdfButton;
