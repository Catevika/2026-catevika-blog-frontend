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
});
