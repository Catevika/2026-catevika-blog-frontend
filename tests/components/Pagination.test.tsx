import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { Pagination } from "@/components/Pagination";
import { renderWithProvider } from "../utils/renderWithProvider";

const defaultProps = {
  handlePrevPage: vi.fn(),
  handleNextPage: vi.fn(),
  page: 1,
  perPage: 10,
  maxPages: 5,
  data: {
    total_results: 25,
    total_pages: 3,
  },
};

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("Pagination", () => {
  describe("basic rendering", () => {
    it("should render navigation with aria-label", () => {
      renderWithProvider(<Pagination {...defaultProps} />);

      expect(screen.getByLabelText("Photo pagination")).toBeInTheDocument();
    });

    it("should render Page X of Y text", () => {
      renderWithProvider(<Pagination {...defaultProps} />);

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should render Previous button with icon", () => {
      renderWithProvider(<Pagination {...defaultProps} />);

      const prevButton = screen.getByLabelText("Go to previous page");
      expect(prevButton).toBeInTheDocument();
    });

    it("should render Next button with icon", () => {
      renderWithProvider(<Pagination {...defaultProps} />);

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe("first page state", () => {
    it("should disable Previous button when on first page", () => {
      renderWithProvider(<Pagination {...defaultProps} page={1} />);

      const prevButton = screen.getByLabelText("Go to previous page");
      expect(prevButton).toBeDisabled();
    });

    it("should enable Next button when on first page", () => {
      renderWithProvider(<Pagination {...defaultProps} page={1} />);

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("last page state", () => {
    it("should enable Previous button when not on first page", () => {
      renderWithProvider(<Pagination {...defaultProps} page={2} />);

      const prevButton = screen.getByLabelText("Go to previous page");
      expect(prevButton).not.toBeDisabled();
    });

    it("should disable Next button when on last page", () => {
      renderWithProvider(<Pagination {...defaultProps} page={3} />);

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).toBeDisabled();
    });

    it("should disable Next button when totalResults <= maxItemsThisPage", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={3}
          perPage={10}
          data={{ total_results: 25, total_pages: 3 }}
        />,
      );

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("page display", () => {
    it("should show current page number correctly", () => {
      renderWithProvider(<Pagination {...defaultProps} page={2} />);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });

    it("should show effectiveMaxPages correctly", () => {
      renderWithProvider(
        <Pagination {...defaultProps} page={1} perPage={10} />,
      );

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should use total_pages from API when total_results not provided", () => {
      renderWithProvider(
        <Pagination
          page={1}
          perPage={10}
          maxPages={5}
          handlePrevPage={vi.fn()}
          handleNextPage={vi.fn()}
          data={{ total_results: undefined, total_pages: 4 }}
        />,
      );

      expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
    });

    it("should use total_pages from API when total_results not provided", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          perPage={10}
          data={{ total_results: undefined, total_pages: 4 }}
        />,
      );

      expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
    });

    it("should fallback to current page when no total info provided", () => {
      renderWithProvider(
        <Pagination
          page={5}
          perPage={10}
          maxPages={5}
          handlePrevPage={vi.fn()}
          handleNextPage={vi.fn()}
          data={{ total_results: undefined, total_pages: 5 }}
        />,
      );

      // Fallback to current page (5)
      expect(screen.getByText("Page 5 of 5")).toBeInTheDocument();
    });
  });

  describe("maxPages capping", () => {
    it("should cap totalPages by maxPages", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          perPage={10}
          maxPages={3}
          data={{ total_results: 100, total_pages: 10 }}
        />,
      );

      // Should show 3 (maxPages) instead of 10 (total_pages)
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should show max results info when total_pages exceeds maxPages", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          perPage={10}
          maxPages={3}
          data={{ total_results: 100, total_pages: 10 }}
        />,
      );

      expect(screen.getByText("(30 max results shown)")).toBeInTheDocument();
    });

    it("should not show max results info when total_pages <= maxPages", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          perPage={10}
          maxPages={5}
          data={{ total_results: 25, total_pages: 3 }}
        />,
      );

      const maxInfo = screen.queryByText(/max results shown/);
      expect(maxInfo).not.toBeInTheDocument();
    });
  });

  describe("button clicks", () => {
    it("should call handlePrevPage when Previous button is clicked", () => {
      const handlePrevPage = vi.fn();
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={2}
          handlePrevPage={handlePrevPage}
        />,
      );

      const prevButton = screen.getByLabelText("Go to previous page");
      prevButton.click();

      expect(handlePrevPage).toHaveBeenCalled();
    });

    it("should call handleNextPage when Next button is clicked", () => {
      const handleNextPage = vi.fn();
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          handleNextPage={handleNextPage}
        />,
      );

      const nextButton = screen.getByLabelText("Go to next page");
      nextButton.click();

      expect(handleNextPage).toHaveBeenCalled();
    });

    it("should not call handlePrevPage when disabled", () => {
      const handlePrevPage = vi.fn();
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          handlePrevPage={handlePrevPage}
        />,
      );

      const prevButton = screen.getByLabelText("Go to previous page");
      prevButton.click();

      expect(handlePrevPage).not.toHaveBeenCalled();
    });

    it("should not call handleNextPage when disabled", () => {
      const handleNextPage = vi.fn();
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={3}
          handleNextPage={handleNextPage}
        />,
      );

      const nextButton = screen.getByLabelText("Go to next page");
      nextButton.click();

      expect(handleNextPage).not.toHaveBeenCalled();
    });
  });

  describe("aria attributes", () => {
    it("should have aria-live on page number span", () => {
      const { container } = renderWithProvider(
        <Pagination {...defaultProps} />,
      );

      const pageSpan = container.querySelector('[aria-live="polite"]');
      expect(pageSpan).toBeInTheDocument();
    });

    it("should have aria-atomic on page number span", () => {
      const { container } = renderWithProvider(
        <Pagination {...defaultProps} />,
      );

      const pageSpan = container.querySelector('[aria-atomic="true"]');
      expect(pageSpan).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle large total_results", () => {
      renderWithProvider(
        <Pagination
          {...defaultProps}
          page={1}
          perPage={10}
          data={{ total_results: 1000, total_pages: 100 }}
        />,
      );

      // Should cap by maxPages
      expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
      expect(screen.getByText("(50 max results shown)")).toBeInTheDocument();
    });
  });
});
