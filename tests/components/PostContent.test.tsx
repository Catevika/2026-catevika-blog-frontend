import PostContent from "@/components/PostContent";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("PostContent", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes script tags from post markdown", () => {
    const { container } = render(
      <PostContent content={'<script>alert("unsafe")</script>\n\n# Safe content'} />,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Safe content" })).toBeInTheDocument();
    expect(screen.queryByText('alert("unsafe")')).not.toBeInTheDocument();
  });

  it("renders GFM task-list checkboxes and unordered list items", () => {
    const { container } = render(
      <PostContent
        content={"- [ ] Pending task\n- [x] Completed task\n- Regular item"}
      />,
    );

    expect(container.querySelectorAll("ul li")).toHaveLength(3);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked();
  });

  it("renders ordered list items", () => {
    const { container } = render(
      <PostContent content={"1. First item\n2. Second item"} />,
    );

    expect(container.querySelectorAll("ol > li")).toHaveLength(2);
  });
});
