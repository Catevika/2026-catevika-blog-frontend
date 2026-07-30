import LikeButton from "@/components/LikeButton";
import type { SerializedUser } from "@/types";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuth } from "../mocks/mockAuth";
import { renderWithProvider } from "../utils/renderWithProvider";
import { resetAuthStore } from "../utils/resetAuthStore";

// ---------------------------------------------------------
// Mock mutation
// ---------------------------------------------------------
const mutate = vi.fn();
vi.mock("@/api/postHooks", () => ({
  useLikePostMutation: () => ({
    mutate,
    isPending: false,
  }),
}));

// ---------------------------------------------------------
const user: SerializedUser = {
  id: "u1",
  name: "Dominique",
  email: "dom@example.com",
  role: "user",
  createdAt: "",
  updatedAt: "",
};

beforeEach(() => {
  resetAuthStore();
  mockAuth(user);
});

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

// ---------------------------------------------------------
describe("LikeButton", () => {
  it("renders like count", () => {
    renderWithProvider(
      <LikeButton
        postId="p1"
        likedBy={[]}
        likeCount={5}
        isAuthenticated={true}
        postAuthorId="other"
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls mutate when clicked", async () => {
    const userEventInstance = userEvent.setup();

    renderWithProvider(
      <LikeButton
        postId="p1"
        likedBy={[]}
        likeCount={0}
        isAuthenticated={true}
        postAuthorId="other"
      />,
    );

    await userEventInstance.click(screen.getByRole("button"));

    expect(mutate).toHaveBeenCalledWith({ postId: "p1" });
  });

  it("does NOT call mutate when user is owner", async () => {
    const userEventInstance = userEvent.setup();

    renderWithProvider(
      <LikeButton
        postId="p1"
        likedBy={[]}
        likeCount={0}
        isAuthenticated={true}
        postAuthorId="u1"
      />,
    );

    await userEventInstance.click(screen.getByRole("button"));

    expect(mutate).not.toHaveBeenCalled();
  });

  it("does NOT call mutate when not authenticated", async () => {
    const userEventInstance = userEvent.setup();
    mockAuth(null);

    renderWithProvider(
      <LikeButton
        postId="p1"
        likedBy={[]}
        likeCount={0}
        isAuthenticated={false}
        postAuthorId="other"
      />,
    );

    await userEventInstance.click(screen.getByRole("button"));

    expect(mutate).not.toHaveBeenCalled();
  });
});
