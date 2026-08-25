import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PostList from "@/pages/PostList";
import type { SerializedPost, SerializedUser } from "@/types";

import { renderWithProvider } from "../utils/renderWithProvider";
import { mockAuth } from "../mocks/mockAuth";
import { resetAuthStore } from "../utils/resetAuthStore";

import {
  resetPosts,
  seedPublished,
  seedInProgress,
  seedTrashed,
} from "../setup/postListHandlers";

import * as themeHook from "@/hooks/useTheme";

// ---------------------------------------------------------
// Test user
// ---------------------------------------------------------
const mockUser: SerializedUser = {
  id: "u1",
  name: "Dominique",
  email: "dom@example.com",
  role: "user",
  createdAt: "",
  updatedAt: "",
};

// ---------------------------------------------------------
function createPost(overrides: Partial<SerializedPost> = {}): SerializedPost {
  return {
    id: "p1",
    title: "Test Post",
    slug: "test-post",
    content: "Content",
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
  vi.resetModules();
  resetPosts();
  resetAuthStore();
  mockAuth(mockUser);
  vi.restoreAllMocks();

  vi.spyOn(themeHook, "useTheme").mockReturnValue({
    theme: "light",
    setTheme: vi.fn(),
    className: "light",
    dataColorMode: "light",
  });
});

afterEach(() => {
  resetPosts();
});

// ---------------------------------------------------------
describe("PostList", () => {
  it("renders published posts", async () => {
    seedPublished([createPost({ id: "1", title: "Published Post" })]);

    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    expect(await screen.findByText("Published Post")).toBeInTheDocument();
  });

  it("renders in-progress posts for logged-in users", async () => {
    seedInProgress([
      createPost({
        id: "2",
        title: "Draft Post",
        status: "draft",
        deleted: false,
      }),
    ]);

    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    expect(await screen.findByText("Draft Post")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows empty state when no in-progress posts exist", async () => {
    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    expect(await screen.findByText(/nothing in progress/i)).toBeInTheDocument();
  });

  it("renders trashed posts and allows restore", async () => {
    const user = userEvent.setup();

    seedTrashed([
      createPost({
        id: "3",
        title: "Deleted Post",
        deleted: true,
        status: "draft",
      }),
    ]);

    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    const restoreButton = await screen.findByRole("button", {
      name: /restore deleted post/i,
    });

    await user.click(restoreButton);

    expect(await screen.findByText(/bin is empty/i)).toBeInTheDocument();
    expect(screen.getByText("Deleted Post")).toBeInTheDocument();
  });

  it("filters published posts via search", async () => {
    const user = userEvent.setup();

    seedPublished([
      createPost({ id: "a1", title: "Alpha Post" }),
      createPost({ id: "b1", title: "Beta Post" }),
    ]);

    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    const searchInput = await screen.findByPlaceholderText(/search/i);

    await user.type(searchInput, "Alpha");

    expect(await screen.findByText("Alpha Post")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText("Beta Post")).not.toBeInTheDocument(),
    );
  });

  it("filters published posts by author name", async () => {
    const user = userEvent.setup();

    seedPublished([
      createPost({ id: "a1", title: "Author Post" }),
      createPost({
        id: "b1",
        title: "Other Post",
        author: {
          ...mockUser,
          id: "u2",
          name: "Another Author",
          email: "another@example.com",
        },
      }),
    ]);

    renderWithProvider(
      <PostList />,
      "/posts?page=1&inProgressPage=1&deletedPage=1",
    );

    const searchInput = await screen.findByPlaceholderText(/search/i);

    await user.type(searchInput, "Dominique");

    expect(await screen.findByText("Author Post")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Other Post")).not.toBeInTheDocument(),
    );
  });
});
