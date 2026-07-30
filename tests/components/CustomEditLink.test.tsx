import CustomEditLink from "@/components/CustomEditLink";
import type { SerializedPost, SerializedUser } from "@/types";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuth } from "../mocks/mockAuth";
import { renderWithProvider } from "../utils/renderWithProvider";
import { resetAuthStore } from "../utils/resetAuthStore";

const user: SerializedUser = {
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
    author: user,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

beforeEach(() => {
  resetAuthStore();
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // Clear DOM after each test
});

describe("CustomEditLink", () => {
  it("renders edit link", () => {
    mockAuth(user);
    const post = createPost();

    renderWithProvider(<CustomEditLink post={post} user={user} />);

    const link = screen.getByRole("link", { name: /edit/i });
    expect(link).toHaveAttribute("href", "/posts/p1/edit");
  });

  it("is visible when user is author", () => {
    mockAuth(user);
    const post = createPost({ author: user });

    renderWithProvider(<CustomEditLink post={post} user={user} />);

    expect(screen.getByRole("link", { name: /edit/i })).not.toHaveClass(
      "text-transparent",
    );
  });

  it("is hidden when user is NOT author", () => {
    mockAuth(user);
    const post = createPost({
      author: { id: "other", name: "Other", email: "other@example.com" },
    });

    renderWithProvider(<CustomEditLink post={post} user={user} />);

    expect(screen.getByRole("link", { name: /edit/i })).toHaveClass(
      "text-transparent",
    );
  });
});
