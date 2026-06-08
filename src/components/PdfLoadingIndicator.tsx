import { BiDownload } from "react-icons/bi";

interface PdfLoadingIndicatorProps {
  isGenerating: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * PDF Download Button with Loading State
 *
 * Usage in PostView:
 * <PdfLoadingIndicator
 *   isGenerating={isGeneratingPdf}
 *   onClick={handlePdfDownload}
 * />
 */
export const PdfLoadingIndicator = ({
  isGenerating,
  onClick,
  disabled = false,
}: PdfLoadingIndicatorProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isGenerating || disabled}
      className="plain relative"
      aria-label={isGenerating ? "Generating PDF..." : "Download as PDF"}
      title={isGenerating ? "Generating PDF..." : "Download as PDF"}
    >
      {isGenerating ? (
        <div className="flex items-center gap-2">
          {/* Animated spinner */}
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">Generating...</span>
        </div>
      ) : (
        <BiDownload className="h-5 w-5" />
      )}
    </button>
  );
};

export default PdfLoadingIndicator;
