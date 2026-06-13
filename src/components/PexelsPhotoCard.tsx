import { Button } from "@/components/ui/button";
import type { PexelsPhotoCardProps } from "@/types";

const PexelsPhotoCard = ({
  photo,
  handleDragStart,
  handleClickInsert,
  handleOpenEnlarge,
}: PexelsPhotoCardProps) => {
  const imageSrc = photo.src.medium ?? photo.src.large ?? photo.src.original;
  const altText = photo.alt ?? "Photo from Pexels";
  const photographerName = photo.photographer || "Pexels";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Enter/Space: insert
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClickInsert(photo);
    }
  };

  return (
    <article
      className="photo-card"
      onDragStart={handleDragStart(photo)}
      onKeyDown={handleKeyDown}
      aria-label={`${altText} by ${photographerName}. Press Enter or Space to insert.`}
    >
      {/* Image - clickable to open lightbox */}
      <Button
        type="button"
        className="photo-card-image"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenEnlarge(photo);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            handleOpenEnlarge(photo);
          }
        }}
        aria-label={`Enlarge photo by ${photographerName}`}
      >
        <img draggable src={imageSrc} alt={altText} />
      </Button>

      {/* Footer with photographer + insert button */}
      <div className="flex items-center justify-between p-1 pt-0">
        <span className="truncate">{photographerName}</span>
        <Button
          type="button"
          onClick={() => handleClickInsert(photo)}
          aria-label={`Insert photo by ${photographerName} into editor`}
        >
          Insert
        </Button>
      </div>
    </article>
  );
};

export default PexelsPhotoCard;
