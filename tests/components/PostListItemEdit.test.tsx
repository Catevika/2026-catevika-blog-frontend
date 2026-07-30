import PostListItem from "@/components/PostListItemEdit";
import type { SerializedPost, SerializedUser } from "@/types";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockAuth } from "../mocks/mockAuth";
import { renderWithProvider } from "../utils/renderWithProvider";
import { resetAuthStore } from "../utils/resetAuthStore";

// mock user
const mockUser: SerializedUser = {
  id: "u1",
  name: "Dominique",
  email: "dom@example.com",
  role: "user",
  createdAt: "",
  updatedAt: "",
};

function createPost(overrides: Partial<SerializedPost> = {}): SerializedPost {
  return {
    id: "p1",
    title: "My Post",
    slug: "my-post",
    content: "",
    locked: false,
    status: "published",
    deleted: false,
    likeCount: 0,
    liked: false,
    likedBy: [],
    author: mockUser,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

beforeEach(() => {
  resetAuthStore();
  mockAuth(mockUser);
});

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

// ---------------------------------------------------------
describe("PostListItemEdit", () => {
  it("renders a link to the post", () => {
    const post = createPost();

    renderWithProvider(<PostListItem post={post} />);

    const link = screen.getByRole("link", { name: /read my post/i });
    expect(link).toHaveAttribute("href", "/posts/p1");
  });

  it("renders the author's name", () => {
    const post = createPost();

    renderWithProvider(<PostListItem post={post} />);

    expect(screen.getByText("Dominique")).toBeInTheDocument();
  });

  it("renders CustomEditLink when user is authenticated", () => {
    const post = createPost();

    renderWithProvider(<PostListItem post={post} />);

    expect(screen.getByRole("link", { name: /edit/i })).toBeInTheDocument();
  });
});
