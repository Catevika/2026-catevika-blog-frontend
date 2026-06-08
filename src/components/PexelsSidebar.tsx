import CustomButton from "@/components/CustomButton";
import ImageUploader from "@/components/ImageUploader";
import LightBox from "@/components/LightBox";
import Pagination from "@/components/Pagination";
import PexelsPhotoCard from "@/components/PexelsPhotoCard";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/useDebounce";
import { usePexelsSearch } from "@/hooks/usePexelsSearch";
import { usePexelsSearchStore } from "@/stores/pexelsStore";
import type { PexelsPhoto, PexelsSidebarProps } from "@/types";
import { useEffect, useId, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router";

const PexelsSidebar = ({ onInsert }: PexelsSidebarProps) => {
  const query = usePexelsSearchStore((s) => s.query);
  const setQuery = usePexelsSearchStore((s) => s.setQuery);

  const [searchInput, setSearchInput] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  const [page, setPage] = useState(1);

  const perPage = 10;
  const maxPages = 10;

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const { data, isLoading, isError, refetch } = usePexelsSearch(page, perPage);

  // Accessibility IDs
  const searchId = useId();
  const resultsId = useId();
  const statusId = useId();

  // Reset page when query changes externally
  if (prevQuery !== query) {
    setPrevQuery(query);
    setPage(1);
  }

  // Sync debounced search input to store
  useEffect(() => {
    if (debouncedSearchInput !== query) {
      setQuery(debouncedSearchInput);
    }
  }, [debouncedSearchInput, query, setQuery]);

  // Compute raw totalPages (Pagination will compute effectiveMaxPages)
  const totalPages =
    data?.total_pages ??
    (data?.total_results ? Math.ceil(data.total_results / perPage) : undefined);

  // Pagination handlers use raw totalPages
  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (typeof totalPages === "number" && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  // Lightbox state
  const [enlargedPhoto, setEnlargedPhoto] = useState<PexelsPhoto | null>(null);

  const handleOpenEnlarge = (photo: PexelsPhoto) => {
    setEnlargedPhoto(photo);
  };

  const handleCloseEnlarge = () => {
    setEnlargedPhoto(null);
  };

  // Scroll lock for lightbox
  useEffect(() => {
    if (enlargedPhoto) {
      const scrollY = window.scrollY;

      document.body.classList.add("modal-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;

      document.body.classList.remove("modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [enlargedPhoto]);

  // Markdown builder
  const makeMarkdown = (photo: PexelsPhoto) => {
    const imageUrl = photo.src.large ?? photo.src.medium ?? photo.src.original;
    const alt = photo.alt ?? "Pexels photo";

    return (
      `![${alt}](${imageUrl})\n` +
      `<span>Photo by </span>[${photo.photographer}](${photo.photographer_url})<span> on </span>[Pexels](${photo.url})\n`
    );
  };

  const handleDragStart =
    (photo: PexelsPhoto) => (event: React.DragEvent<HTMLDivElement>) => {
      const markdown = makeMarkdown(photo);
      event.dataTransfer.setData("text/plain", markdown);
      event.dataTransfer.effectAllowed = "copy";
    };

  const handleClickInsert = (photo: PexelsPhoto) => {
    if (!onInsert) return;
    onInsert(makeMarkdown(photo));
  };

  const handleDeviceEnlarge = (imageUrl: string) => {
    setEnlargedPhoto({
      id: "device",
      src: { original: imageUrl },
      alt: "Device image",
      photographer: "Anonymous",
    } as unknown as PexelsPhoto);
  };

  const handleDeviceInsert = (markdown: string) => {
    if (!onInsert) return;
    onInsert(markdown);
  };

  return (
    <aside id="pexels-sidebar" aria-label="Pexels photo search">
      <ImageUploader
        onEnlarge={handleDeviceEnlarge}
        onInsert={handleDeviceInsert}
        maxSizeMB={5}
      />

      {/* Header + search */}
      <div className="shrink-0">
        <p id="searchId" className="py-1">
          Search Photos from Pexels
        </p>

        <Field>
          <FieldLabel htmlFor={`${searchId}-input`} className="sr-only">
            Search Pexels
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <FiSearch />
            </InputGroupAddon>
            <InputGroupInput
              id={`${searchId}-input`}
              type="search"
              name="query"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Try 'nature', 'city', or 'lights'…"
              aria-describedby={statusId}
              aria-controls={resultsId}
              autoComplete="off"
              className="pexels-sidebar-input"
            />
          </InputGroup>
        </Field>
      </div>

      {/* Status messages */}
      <div
        id={statusId}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading && "Loading photos..."}
        {isError && "Error loading photos. Please try again."}

        {data?.photos &&
          data.photos.length > 0 &&
          query &&
          typeof totalPages === "number" &&
          `Found ${data.total_results} photos for "${query}". Showing page ${page} of ${totalPages}.`}

        {data?.photos &&
          data.photos.length > 0 &&
          !query &&
          typeof totalPages === "number" &&
          `Showing curated photos. Page ${page} of ${totalPages}.`}
      </div>

      {/* Errors + Pagination */}
      <div className="flex-col-2 my-2 shrink-0">
        {isError && (
          <div className="flex-col-2 items-center" role="alert">
            <p className="form-error">
              Error loading Pexels results. Please try again.
            </p>
            <CustomButton
              onClick={() => void refetch()}
              text="Retry"
              className="w-max"
              aria-label="Retry loading photos"
            />
          </div>
        )}

        {data?.photos && data.photos.length > 0 && (
          <Pagination
            page={page}
            perPage={perPage}
            maxPages={maxPages}
            data={{
              total_pages: totalPages ?? 1,
              total_results: data.total_results ?? perPage,
            }}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        )}
      </div>

      {/* Scrollable results */}
      <section
        id={resultsId}
        className="pexels-results"
        aria-label="Photo search results"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading && (
          <p className="text-center" aria-live="polite">
            Loading photos…
          </p>
        )}

        {data?.photos && data.photos.length > 0 && (
          <ul className="pexels-results-list">
            {data.photos.map((photo: PexelsPhoto) => (
              <li key={photo.id} className="shrink-0 md:flex-1">
                <PexelsPhotoCard
                  photo={photo}
                  handleDragStart={handleDragStart}
                  handleClickInsert={handleClickInsert}
                  handleOpenEnlarge={handleOpenEnlarge}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lightbox */}
      <LightBox
        enlargedPhoto={enlargedPhoto}
        handleCloseEnlarge={handleCloseEnlarge}
      />

      {/* Footer */}
      <footer className="shrink-0 pt-1">
        <p className="text-sm text-center">
          Photos provided by{" "}
          <Link
            to="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pexels
          </Link>
        </p>
      </footer>
    </aside>
  );
};

export default PexelsSidebar;
