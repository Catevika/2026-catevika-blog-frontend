import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProvider } from "../utils/renderWithProvider";
import type { SerializedComment, SerializedUser } from "@/types";

// ---------------------------------------------------------
// 1. SAFE TOP-LEVEL MOCKS (no top-level variable references)
// ---------------------------------------------------------
vi.mock("@/api/commentApi", () => {
  const getCommentsTree: Mock<
    (postId: string, userId?: string) => Promise<SerializedComment[]>
  > = vi.fn();

  return { getCommentsTree };
});

vi.mock("@/api/commentHooks", () => ({
  useCreateComment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// ---------------------------------------------------------
// 2. Mock child components (safe, self-contained)
// ---------------------------------------------------------
vi.mock("@/components/CommentFormSection", () => ({
  default: () => <div data-testid="form-section" />,
}));

vi.mock("@/components/CommentHeader", () => ({
  default: ({ totalComments }: { totalComments: number }) => (
    <div data-testid="header">Total: {totalComments}</div>
  ),
}));

vi.mock("@/components/CommentsErrorBoundary", () => ({
  default: ({ error }: { error: unknown }) => (
    <div data-testid="error-boundary">{String(error)}</div>
  ),
}));

vi.mock("@/components/CommentsLoading", () => ({
  default: () => <div data-testid="loading" />,
}));

vi.mock("@/components/NoCommentsYet", () => ({
  default: () => <div data-testid="no-comments" />,
}));

vi.mock("@/components/CommentTree", () => ({
  CommentTree: () => <div data-testid="tree" />,
}));

vi.mock("@/components/CommentList", () => ({
  CommentList: () => <div data-testid="list" />,
}));

// ---------------------------------------------------------
// 3. Import AFTER mocks
// ---------------------------------------------------------
import CommentSection from "@/components/CommentSection";
import { useAuthStore } from "@/stores/authStore";
import { getCommentsTree } from "@/api/commentApi";

// ---------------------------------------------------------
// 4. Strict mock helpers
// ---------------------------------------------------------
const makeMockUser = (id = "u2"): SerializedUser => ({
  id,
  name: "User2",
  email: "u2@example.com",
  role: "user",
  createdAt: "",
  updatedAt: "",
});

const makeMockComment = (id = "c1"): SerializedComment => ({
  id,
  content: "Hello",
  postId: "p1",
  authorId: "u2",
  author: makeMockUser("u2"),
  liked: false,
  likedBy: [],
  likeCount: 0,
  status: "ok",
  parentId: null,
  depth: 0,
  replies: [],
  deleted: false,
  createdAt: "",
  updatedAt: "",
});

// ---------------------------------------------------------
// 5. Setup
// ---------------------------------------------------------
beforeEach(() => {
  const user: SerializedUser = {
    id: "u1",
    name: "User",
    email: "user@example.com",
    role: "user",
    createdAt: "",
    updatedAt: "",
  };

  useAuthStore.setState({ user });
  vi.clearAllMocks();
});

// ---------------------------------------------------------
// 6. Tests
// ---------------------------------------------------------
describe("CommentSection", () => {
  it("renders loading state when fetching", () => {
    (getCommentsTree as Mock).mockReturnValue(new Promise(() => {}));

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders error boundary on error", async () => {
    (getCommentsTree as Mock).mockRejectedValue(new Error("Boom"));

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    await waitFor(() =>
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument(),
    );
  });

  it("renders NoCommentsYet when no comments and user logged out", async () => {
    useAuthStore.setState({ user: null });

    (getCommentsTree as Mock).mockResolvedValue([]);

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    await waitFor(() =>
      expect(screen.getByTestId("no-comments")).toBeInTheDocument(),
    );
  });

  it("renders CommentTree on desktop when comments exist", async () => {
    (getCommentsTree as Mock).mockResolvedValue([makeMockComment()]);

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    await waitFor(() => expect(screen.getByTestId("tree")).toBeInTheDocument());
  });

  // ---------------------------------------------------------
  // ⭐ MOBILE TEST — uses vi.doMock (NOT hoisted)
  // ---------------------------------------------------------
  it("renders CommentList on mobile", async () => {
    vi.doMock("@/hooks/useIsMobile", () => ({
      useIsMobile: () => true,
    }));

    const CommentSectionMobile = (await import("@/components/CommentSection"))
      .default;

    (getCommentsTree as Mock).mockResolvedValue([makeMockComment()]);

    renderWithProvider(<CommentSectionMobile postId="p1" postAuthorId="u1" />);

    await waitFor(() => expect(screen.getByTestId("list")).toBeInTheDocument());
  });

  it("renders CommentFormSection when logged in", async () => {
    (getCommentsTree as Mock).mockResolvedValue([]);

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    await waitFor(() =>
      expect(screen.getByTestId("form-section")).toBeInTheDocument(),
    );
  });

  it("renders login prompt when logged out and comments exist", async () => {
    useAuthStore.setState({ user: null });

    (getCommentsTree as Mock).mockResolvedValue([makeMockComment()]);

    renderWithProvider(<CommentSection postId="p1" postAuthorId="u1" />);

    await waitFor(() =>
      expect(screen.getByText(/Join the conversation/i)).toBeInTheDocument(),
    );
  });
});
