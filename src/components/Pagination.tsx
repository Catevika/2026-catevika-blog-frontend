import CustomButton from "@/components/CustomButton";
import type { PaginationProps } from "@/types";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function Pagination({
  handlePrevPage,
  handleNextPage,
  page,
  perPage,
  maxPages,
  data,
}: PaginationProps) {
  const isFirstPage = page === 1;

  const totalResults =
    typeof data.total_results === "number" ? data.total_results : undefined;

  // 1) Derive total pages from total_results if possible
  const totalPagesFromResults =
    totalResults !== undefined && perPage > 0
      ? Math.ceil(totalResults / perPage)
      : undefined;

  // 2) Fall back to API total_pages if provided
  const totalPagesFromApi = data.total_pages;

  // 3) As a last resort, assume at least the current page
  const fallbackPages = page;

  // 4) Choose the best available total pages
  const rawTotalPages =
    totalPagesFromResults ?? totalPagesFromApi ?? fallbackPages;

  // 5) Cap by maxPages for safety, but do not display more than exists
  const effectiveMaxPages = Math.min(rawTotalPages, maxPages);

  // Disable next if we've reached or passed last page
  const maxItemsThisPage = page * perPage;
  const noMoreItems =
    totalResults !== undefined && totalResults <= maxItemsThisPage;
  const isLastPage = page >= effectiveMaxPages || noMoreItems;

  const maxInfo =
    data.total_pages && data.total_pages > maxPages
      ? ` (${maxPages * perPage} max results shown)`
      : "";

  return (
    <nav className="w-65 flex-col px-2" aria-label="Photo pagination">
      <span className="flex items-center justify-center gap-4">
        <CustomButton
          type="button"
          onClick={handlePrevPage}
          disabled={isFirstPage}
          icon={FiChevronLeft}
          aria-label="Go to previous page"
        />
        <span className="text-lg" aria-live="polite" aria-atomic="true">
          Page {page} of {effectiveMaxPages}
        </span>

        <CustomButton
          type="button"
          onClick={handleNextPage}
          disabled={isLastPage}
          icon={FiChevronRight}
          aria-label="Go to next page"
        />
      </span>
      <span className="text-primary/70 flex items-center justify-center gap-4 pt-1">
        <em>{maxInfo}</em>
      </span>
    </nav>
  );
}

export default Pagination;
