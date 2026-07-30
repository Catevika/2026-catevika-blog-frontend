import { describe, it, expect, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import CommentsLoading from "@/components/CommentsLoading";
import { renderWithProvider } from "../utils/renderWithProvider";

afterEach(() => {
  cleanup();
});

describe("CommentsLoading", () => {
  it("renders the loading section content", () => {
    renderWithProvider(<CommentsLoading />);

    expect(
      screen.getByRole("heading", { name: "Comments" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Loading comments...")).toBeInTheDocument();
  });

  it("has a status region for loading state", () => {
    renderWithProvider(<CommentsLoading />);

    expect(
      screen.getByRole("status", { name: "Loading comments" }),
    ).toBeInTheDocument();
  });

  it("shows the live comment count placeholder", () => {
    renderWithProvider(<CommentsLoading />);

    expect(screen.getByText("...")).toHaveAttribute("aria-live", "polite");
  });

  it("has an accessible section label", () => {
    renderWithProvider(<CommentsLoading />);

    expect(
      screen.getByRole("region", { name: "Comments loading section" }),
    ).toBeInTheDocument();
  });
});
