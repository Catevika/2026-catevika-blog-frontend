import CustomButton from "@/components/CustomButton";
import type { LightBoxProps } from "@/types";
import { useCallback, useEffect, useRef } from "react";

const LightBox = ({ enlargedPhoto, handleCloseEnlarge }: LightBoxProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Use useCallback instead of useEffectEvent
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseEnlarge();
      }
    },
    [handleCloseEnlarge],
  ); // Add dependency

  // Focus trap helper: keep focus inside dialog
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-hidden") !== "true",
    );

    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      // Shift + Tab
      if (active === first || active === dialog) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  useEffect(() => {
    if (!enlargedPhoto) return;

    // Attach global Escape handler
    document.addEventListener("keydown", handleGlobalKeyDown);

    // Move focus to close button when lightbox opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = "";
    };
  }, [enlargedPhoto, handleGlobalKeyDown]);

  if (!enlargedPhoto) return null;

  const imageSrc =
    enlargedPhoto.src.large ??
    enlargedPhoto.src.medium ??
    enlargedPhoto.src.original;

  const altText = enlargedPhoto.alt ?? "Pexels photo";

  return (
    <div
      className="lightbox"
      role="presentation"
      tabIndex={0}
      onClick={handleCloseEnlarge}
      onKeyDown={(e) => {
        // Provide keyboard equivalent for onClick
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCloseEnlarge();
        }
      }}
    >
      <div
        className="lightbox-card"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Enlarged photo by ${enlargedPhoto.photographer}`}
        onKeyDown={handleDialogKeyDown}
      >
        <CustomButton
          ref={closeButtonRef}
          type="button"
          onClick={handleCloseEnlarge}
          className="text-background absolute top-2 right-2"
          aria-label="Close enlarged photo"
        />

        <img src={imageSrc} alt={altText} className="lightbox-image" />

        <p className="lightbox-author">{enlargedPhoto.photographer}</p>
      </div>
    </div>
  );
};

export default LightBox;
