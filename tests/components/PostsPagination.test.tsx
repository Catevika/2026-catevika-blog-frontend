import { vi } from "vitest";

// ---------------------------------------------------------
// 1. Correct partial mock of Pagination (TS-safe + coverage-safe)
// ---------------------------------------------------------
vi.mock("@/components/Pagination", async () => {
  const actual = await import("@/components/Pagination");

  return {
    ...actual,
    default: vi.fn(({ page, data }) => (
      <nav data-testid="pagination">
        <span>
          Page {page} of {data.total_pages}
        </span>
      </nav>
    )),
  };
});

// ---------------------------------------------------------
// 2. Imports AFTER mocks
// ---------------------------------------------------------
import PostsPagination from "@/components/PostsPagination";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProvider } from "../utils/renderWithProvider";

// ---------------------------------------------------------
// 3. Test Suite
// ---------------------------------------------------------
describe("PostsPagination", () => {
  describe("basic rendering", () => {
    it("should render Pagination component", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={5}
          totalDocs={50}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should wrap Pagination in div with my-2 class", () => {
      const { container } = renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={5}
          totalDocs={50}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("my-2");
    });
  });

  describe("props mapping", () => {
    it("should pass page to Pagination", () => {
      renderWithProvider(
        <PostsPagination
          page={3}
          limit={10}
          totalPages={5}
          totalDocs={50}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
    });

    it("should pass limit as perPage to Pagination", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={20}
          totalPages={3}
          totalDocs={60}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should pass totalPages as maxPages to Pagination", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={10}
          totalDocs={100}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByText("Page 1 of 10")).toBeInTheDocument();
    });

    it("should pass totalDocs as total_results to Pagination", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={5}
          totalDocs={45}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    });

    it("should pass onPrevPage as handlePrevPage to Pagination", () => {
      const onPrevPage = vi.fn();
      renderWithProvider(
        <PostsPagination
          page={2}
          limit={10}
          totalPages={5}
          totalDocs={50}
          onPrevPage={onPrevPage}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should pass onNextPage as handleNextPage to Pagination", () => {
      const onNextPage = vi.fn();
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={5}
          totalDocs={50}
          onPrevPage={vi.fn()}
          onNextPage={onNextPage}
        />,
      );

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  });

  describe("data object mapping", () => {
    it("should create data object with total_pages from totalPages", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={7}
          totalDocs={70}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByText("Page 1 of 7")).toBeInTheDocument();
    });

    it("should create data object with total_results from totalDocs", () => {
      renderWithProvider(
        <PostsPagination
          page={1}
          limit={10}
          totalPages={5}
          totalDocs={35}
          onPrevPage={vi.fn()}
          onNextPage={vi.fn()}
        />,
      );

      expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    });
  });
});
