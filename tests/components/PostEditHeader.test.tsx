import { render, screen } from "@testing-library/react";
import PostEditHeader from "@/components/PostEditHeader";
import { describe, expect, it } from "vitest";

describe("PostEditHeader", () => {
  it("renders Create draft when isNew=true and status=draft", () => {
    render(<PostEditHeader isNew={true} status="draft" />);
    const heading = screen.getByRole("heading", { name: "Create draft" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Create draft");
  });

  it("renders Create post when isNew=true and status=published", () => {
    render(<PostEditHeader isNew={true} status="published" />);
    const heading = screen.getByRole("heading", { name: "Create post" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Create post");
  });

  it("renders Edit draft when isNew=false and status=draft", () => {
    render(<PostEditHeader isNew={false} status="draft" />);
    const heading = screen.getByRole("heading", { name: "Edit draft" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Edit draft");
  });

  it("renders Edit post when isNew=false and status=published", () => {
    render(<PostEditHeader isNew={false} status="published" />);
    const heading = screen.getByRole("heading", { name: "Edit post" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Edit post");
  });
});
