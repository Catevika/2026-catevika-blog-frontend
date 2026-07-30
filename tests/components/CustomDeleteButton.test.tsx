import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CustomDeleteButton from "@/components/CustomDeleteButton";
import { renderWithProvider } from "../utils/renderWithProvider";
import { mockAuth } from "../mocks/mockAuth";
import { resetAuthStore } from "../utils/resetAuthStore";
import type { SerializedUser } from "@/types";

// ---------------------------------------------------------
// Mock navigate
// ---------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<any>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---------------------------------------------------------
// Mock mutation
// ---------------------------------------------------------
const mutateAsync = vi.fn().mockResolvedValue({});
vi.mock("@/api/postHooks", () => ({
  useSoftDeletePostMutation: () => ({
    mutateAsync,
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

const baseProps = {
  postId: "p1",
  postTitle: "My Post",
  postStatus: "published",
  userId: user.id,
};

beforeEach(() => {
  resetAuthStore();
  mockAuth(user);
});

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

// ---------------------------------------------------------
describe("CustomDeleteButton", () => {
  it("renders delete button when user is author", () => {
    renderWithProvider(<CustomDeleteButton {...baseProps} authorId="u1" />);

    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
  });

  it("does NOT render delete button when user is NOT author", () => {
    renderWithProvider(<CustomDeleteButton {...baseProps} authorId="other" />);

    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
  });

  it("opens confirmation dialog", async () => {
    const userEventInstance = userEvent.setup();

    renderWithProvider(<CustomDeleteButton {...baseProps} authorId="u1" />);

    await userEventInstance.click(screen.getByTestId("delete-button"));

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("calls mutateAsync and navigates", async () => {
    const userEventInstance = userEvent.setup();

    renderWithProvider(<CustomDeleteButton {...baseProps} authorId="u1" />);

    await userEventInstance.click(screen.getByTestId("delete-button"));
    await userEventInstance.click(
      screen.getByRole("button", { name: /move to trash/i }),
    );

    expect(mutateAsync).toHaveBeenCalledWith("p1");
    expect(mockNavigate).toHaveBeenCalledWith("/posts");
  });
});
