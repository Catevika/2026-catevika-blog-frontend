// tests/components/PexelsSidebar.test.tsx
import { screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PexelsResponse, PexelsPhoto } from "@/types";
import { renderWithProvider } from "../utils/renderWithProvider";

/**
 * Inline mocks (kept inside this test file so they don't affect other suites).
 *
 * Important: vi.mock calls are placed before importing the actual hook module
 * so Vitest hoists the factories and the imported module will be the mocked one.
 */

/* -------------------------
   Stable Zustand-like store mock
   ------------------------- */
const mockSetQuery = vi.fn();
const mockSetPage = vi.fn();

vi.mock("@/stores/pexelsStore", () => {
  // single stable state object so selector calls return stable primitives
  const state = {
    query: "initial",
    page: 1,
    perPage: 10,
    setQuery: (newQuery: string) => {
      mockSetQuery(newQuery);
      state.query = newQuery;
      state.page = 1;
    },
    setPage: (newPage: number) => {
      mockSetPage(newPage);
      state.page = newPage;
    },
  };

  return {
    usePexelsSearchStore: (selector?: (s: typeof state) => any) =>
      typeof selector === "function" ? selector(state) : state,
  };
});

/* -------------------------
   Debounce mock (identity)
   ------------------------- */
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (v: string) => v,
}));

/* -------------------------
   usePexelsSearch mock factory (tests will override via vi.mocked)
   ------------------------- */
const defaultSearchMock = {
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as UseQueryResult<PexelsResponse, Error>;

vi.mock("@/hooks/usePexelsSearch", () => ({
  usePexelsSearch: vi.fn(() => defaultSearchMock),
}));

/* -------------------------
   Child component mocks (minimal DOM for interactions)
   ------------------------- */
vi.mock("@/components/ImageUploader", () => ({
  __esModule: true,
  default: ({ onEnlarge, onInsert }: any) => (
    <div data-testid="mock-image-uploader">
      <button
        data-testid="device-enlarge"
        onClick={() => onEnlarge?.("https://example.com/device.jpg")}
      >
        Device Enlarge
      </button>
      <button
        data-testid="device-insert"
        onClick={() => onInsert?.("![](device.jpg)")}
      >
        Device Insert
      </button>
    </div>
  ),
}));

vi.mock("@/components/LightBox", () => ({
  __esModule: true,
  default: ({ enlargedPhoto, handleCloseEnlarge }: any) => (
    <div data-testid="mock-lightbox">
      {enlargedPhoto ? (
        <>
          <div data-testid="lightbox-photo">{enlargedPhoto?.id ?? "photo"}</div>
          <button data-testid="lightbox-close" onClick={handleCloseEnlarge}>
            Close
          </button>
        </>
      ) : null}
    </div>
  ),
}));

vi.mock("@/components/Pagination", () => ({
  __esModule: true,
  default: ({ handlePrevPage, handleNextPage }: any) => (
    <div data-testid="mock-pagination">
      <button data-testid="pagination-prev" onClick={handlePrevPage}>
        Prev
      </button>
      <button data-testid="pagination-next" onClick={handleNextPage}>
        Next
      </button>
    </div>
  ),
}));

vi.mock("@/components/PexelsPhotoCard", () => ({
  __esModule: true,
  default: ({
    photo,
    handleDragStart,
    handleClickInsert,
    handleOpenEnlarge,
  }: any) => (
    <div data-testid={`pexels-card-${photo.id}`}>
      <div
        data-testid={`drag-${photo.id}`}
        draggable
        onDragStart={handleDragStart(photo)}
      >
        drag
      </div>
      <button
        data-testid={`insert-${photo.id}`}
        onClick={() => handleClickInsert(photo)}
      >
        Insert
      </button>
      <button
        data-testid={`enlarge-${photo.id}`}
        onClick={() => handleOpenEnlarge(photo)}
      >
        Enlarge
      </button>
    </div>
  ),
}));

vi.mock("@/components/CustomButton", () => ({
  __esModule: true,
  default: ({ onClick, text, ...rest }: any) => (
    <button {...rest} onClick={onClick}>
      {text}
    </button>
  ),
}));

/* -------------------------
   Now import the component and the mocked hook (ESM import)
   ------------------------- */
import PexelsSidebar from "@/components/PexelsSidebar";
import * as pexelsHook from "@/hooks/usePexelsSearch";
const mockedUsePexelsSearch = vi.mocked(pexelsHook.usePexelsSearch);

/* -------------------------
   Small typed helper to create UseQueryResult-like objects for tests
   ------------------------- */
function makeQueryResult(
  partial: Partial<UseQueryResult<PexelsResponse, Error>>,
): UseQueryResult<PexelsResponse, Error> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    isSuccess: false,
    status: "idle",
    refetch: async () => ({ data: undefined, error: null }) as any,
    fetchStatus: "idle",
    isFetched: false,
    isFetchedAfterMount: false,
    isRefetching: false,
    isPlaceholderData: false,
    isStale: false,
    failureCount: 0,
    failureReason: undefined,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    isLoadingError: false,
    isRefetchError: false,
    ...partial,
  } as UseQueryResult<PexelsResponse, Error>;
}

/* -------------------------
   Test helpers
   ------------------------- */
const makePhoto = (id: number): PexelsPhoto =>
  ({
    id,
    url: `https://pexels.example/${id}`,
    alt: `Alt ${id}`,
    photographer: `Photographer ${id}`,
    photographer_url: `https://pexels.example/photographer/${id}`,
    src: {
      original: `https://images.example/${id}.jpg`,
      large: undefined,
      medium: undefined,
    },
  }) as unknown as PexelsPhoto;

/* -------------------------
   Tests
   ------------------------- */
describe("PexelsSidebar", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockedUsePexelsSearch.mockImplementation(() => defaultSearchMock);
    cleanup();
  });

  it("renders header, search input and initial value from store", () => {
    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    expect(screen.getByText("Search Photos from Pexels")).toBeInTheDocument();

    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("initial");
  });

  it("shows loading state when isLoading is true", () => {
    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
        status: "pending",
      }),
    );

    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    expect(screen.getByText("Loading photos…")).toBeInTheDocument();
  });

  it("shows error and Retry button calls refetch", async () => {
    const refetch = vi.fn();
    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
        status: "error",
      }),
    );

    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    expect(
      screen.getByText("Error loading Pexels results. Please try again."),
    ).toBeInTheDocument();

    const retry = screen.getByRole("button", { name: /Retry loading photos/i });
    expect(retry).toBeInTheDocument();

    await userEvent.click(retry);
    expect(refetch).toHaveBeenCalled();
  });

  it("renders photos list and pagination when data present", () => {
    const photos = [makePhoto(1), makePhoto(2)];
    const data: PexelsResponse = {
      photos,
      total_results: 20,
      total_pages: 2,
      page: 1,
      per_page: 10,
    };

    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isSuccess: true,
        status: "success",
      }),
    );

    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    expect(screen.getByTestId("pexels-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("pexels-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-pagination")).toBeInTheDocument();
  });

  it("clicking Insert on a photo calls onInsert with markdown", async () => {
    const photos = [makePhoto(10)];
    const data: PexelsResponse = {
      photos,
      total_results: 1,
      total_pages: 1,
      page: 1,
      per_page: 10,
    };

    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isSuccess: true,
        status: "success",
      }),
    );

    const onInsert = vi.fn();
    renderWithProvider(<PexelsSidebar onInsert={onInsert} />);

    const insertBtn = screen.getByTestId("insert-10");
    await userEvent.click(insertBtn);

    expect(onInsert).toHaveBeenCalled();
    const arg = onInsert.mock.calls[0][0] as string;
    expect(arg).toContain("Photo by");
    expect(arg).toContain(photos[0].photographer);
    expect(arg).toContain(photos[0].url);
  });

  it("dragstart sets dataTransfer with markdown payload", () => {
    const photos = [makePhoto(11)];
    const data: PexelsResponse = {
      photos,
      total_results: 1,
      total_pages: 1,
      page: 1,
      per_page: 10,
    };

    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isSuccess: true,
        status: "success",
      }),
    );

    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    const dragEl = screen.getByTestId("drag-11");

    const dt: any = {
      data: {} as Record<string, string>,
      setData(type: string, val: string) {
        this.data[type] = val;
      },
      effectAllowed: "",
    };

    fireEvent.dragStart(dragEl, { dataTransfer: dt });

    expect(dt.data["text/plain"]).toBeDefined();
    expect(dt.data["text/plain"]).toContain("Photo by");
  });

  it("device enlarge and insert from ImageUploader call onInsert / open lightbox", async () => {
    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data: {
          photos: [],
          total_results: 0,
          total_pages: 0,
          page: 1,
          per_page: 10,
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isSuccess: true,
        status: "success",
      }),
    );

    const onInsert = vi.fn();
    renderWithProvider(<PexelsSidebar onInsert={onInsert} />);

    const deviceEnlarge = screen.getByTestId("device-enlarge");
    await userEvent.click(deviceEnlarge);

    expect(screen.getByTestId("lightbox-photo")).toBeInTheDocument();

    const close = screen.getByTestId("lightbox-close");
    await userEvent.click(close);
    expect(screen.queryByTestId("lightbox-photo")).not.toBeInTheDocument();

    const deviceInsert = screen.getByTestId("device-insert");
    await userEvent.click(deviceInsert);
    expect(onInsert).toHaveBeenCalledWith("![](device.jpg)");
  });

  it("pagination prev/next buttons exist and handlers do not throw", async () => {
    const photos = [makePhoto(21)];
    const data: PexelsResponse = {
      photos,
      total_results: 30,
      total_pages: 3,
      page: 1,
      per_page: 10,
    };

    mockedUsePexelsSearch.mockImplementation(() =>
      makeQueryResult({
        data,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isSuccess: true,
        status: "success",
      }),
    );

    renderWithProvider(<PexelsSidebar onInsert={undefined} />);

    const prev = screen.getByTestId("pagination-prev");
    const next = screen.getByTestId("pagination-next");

    await userEvent.click(prev);
    await userEvent.click(next);

    expect(prev).toBeInTheDocument();
    expect(next).toBeInTheDocument();
  });
});
