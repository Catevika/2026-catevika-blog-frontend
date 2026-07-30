import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlugField from "@/components/SlugField";
import type { SlugFieldProps } from "@/types";

// Mock useSlugAvailability hook
vi.mock("@/hooks/useSlugAvailability", () => ({
  useSlugAvailability: vi.fn(() => ({
    loading: false,
    available: true,
    suggestion: null,
    error: null,
  })),
}));

describe("SlugField", () => {
  const mockOnSlugInput = vi.fn();
  const mockOnSlugChange = vi.fn();
  const mockOnToggleLocked = vi.fn();
  const mockOnResetAuto = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  function renderSlugField(propsOverrides?: Partial<SlugFieldProps>) {
    const props: SlugFieldProps = {
      title: "My Post Title",
      slug: "my-post-title",
      locked: false,
      isNew: true,
      postId: "new",
      onSlugInput: mockOnSlugInput,
      onSlugChange: mockOnSlugChange,
      onToggleLocked: mockOnToggleLocked,
      onResetAuto: mockOnResetAuto,
      ...propsOverrides,
    };
    return render(<SlugField {...props} />);
  }

  // ---------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------

  describe("rendering", () => {
    it("renders slug input and Reset button", () => {
      renderSlugField();

      expect(
        screen.getByPlaceholderText("Edit slug else auto"),
      ).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("shows slug label with asterisk", () => {
      renderSlugField();
      expect(screen.getByText("Slug *")).toBeInTheDocument();
    });

    it("shows locked indicator", () => {
      renderSlugField({ locked: true });
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });

    it("shows unlocked indicator", () => {
      renderSlugField();
      expect(screen.getByText("🔓")).toBeInTheDocument();
    });

    it("shows auto mode message when locked", () => {
      renderSlugField({ locked: true, title: "My Post Title" });

      expect(
        screen.getByText("Auto mode — slug will follow title:"),
      ).toBeInTheDocument();
      expect(screen.getByText("My Post Title")).toBeInTheDocument();
    });

    it("shows manual mode message when unlocked", () => {
      renderSlugField();
      expect(screen.getByText("Manual mode")).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------
  // effectiveValue
  // ---------------------------------------------------------

  describe("effectiveValue", () => {
    it("displays autoSlug when locked", () => {
      renderSlugField({ locked: true, slug: "custom-slug" });

      const input = screen.getByPlaceholderText("Edit slug else auto");
      expect(input).toHaveValue("my-post-title");
    });

    it("displays rawInput when unlocked", () => {
      renderSlugField({ slug: "custom-slug" });

      const input = screen.getByPlaceholderText("Edit slug else auto");
      expect(input).toHaveValue("custom-slug");
    });
  });

  // ---------------------------------------------------------
  // Input handling
  // ---------------------------------------------------------

  describe("input handling", () => {
    it("calls onSlugInput when typing", async () => {
      renderSlugField();

      const input = screen.getByPlaceholderText("Edit slug else auto");
      await userEvent.clear(input);
      await userEvent.type(input, "new-slug");

      expect(mockOnSlugInput).toHaveBeenCalledWith("new-slug");
    });

    it("updates rawInput when typing", async () => {
      renderSlugField();

      const input = screen.getByPlaceholderText("Edit slug else auto");
      await userEvent.clear(input);
      await userEvent.type(input, "new-slug");

      expect(input).toHaveValue("new-slug");
    });

    it("calls onToggleLocked when typing in locked state", async () => {
      renderSlugField({ locked: true });

      const input = screen.getByPlaceholderText("Edit slug else auto");
      await userEvent.type(input, "n");

      expect(mockOnToggleLocked).toHaveBeenCalled();
    });

    it("calls onSlugChange on blur", async () => {
      renderSlugField();

      const input = screen.getByPlaceholderText("Edit slug else auto");
      await userEvent.clear(input);
      await userEvent.type(input, "new-slug");

      await userEvent.tab(); // triggers blur

      expect(mockOnSlugChange).toHaveBeenCalledWith("new-slug");
    });
  });

  // ---------------------------------------------------------
  // Reset button
  // ---------------------------------------------------------

  describe("Reset button", () => {
    it("calls onResetAuto when clicked", async () => {
      renderSlugField({ slug: "custom-slug" });

      await userEvent.click(screen.getByText("Reset"));
      expect(mockOnResetAuto).toHaveBeenCalled();
    });

    it("sets input to auto slug when clicked", async () => {
      renderSlugField({ slug: "custom-slug" });

      await userEvent.click(screen.getByText("Reset"));

      const input = screen.getByPlaceholderText("Edit slug else auto");
      expect(input).toHaveValue("my-post-title");
    });

    it("calls onSlugInput with auto slug when clicked", async () => {
      renderSlugField({ slug: "custom-slug" });

      await userEvent.click(screen.getByText("Reset"));
      expect(mockOnSlugInput).toHaveBeenCalledWith("my-post-title");
    });

    it("calls onSlugChange with auto slug when clicked", async () => {
      renderSlugField({ slug: "custom-slug" });

      await userEvent.click(screen.getByText("Reset"));
      expect(mockOnSlugChange).toHaveBeenCalledWith("my-post-title");
    });

    it("focuses input when clicked", async () => {
      renderSlugField({ slug: "custom-slug" });

      await userEvent.click(screen.getByText("Reset"));

      const input = screen.getByPlaceholderText("Edit slug else auto");
      expect(input).toHaveFocus();
    });

    it("is disabled when disabled prop is true", () => {
      renderSlugField({ disabled: true });
      expect(screen.getByText("Reset")).toBeDisabled();
    });
  });

  // ---------------------------------------------------------
  // Disabled state
  // ---------------------------------------------------------

  describe("input disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      renderSlugField({ disabled: true });
      expect(screen.getByPlaceholderText("Edit slug else auto")).toBeDisabled();
    });

    it("is not disabled when disabled prop is false", () => {
      renderSlugField({ disabled: false });
      expect(
        screen.getByPlaceholderText("Edit slug else auto"),
      ).not.toBeDisabled();
    });
  });

  // ---------------------------------------------------------
  // Error display
  // ---------------------------------------------------------

  describe("error display", () => {
    it("shows error message", () => {
      renderSlugField({ error: "Slug is invalid" });
      expect(screen.getByText("Slug is invalid")).toBeInTheDocument();
    });

    it("sets aria-invalid=true", () => {
      renderSlugField({ error: "Slug is invalid" });
      expect(
        screen.getByPlaceholderText("Edit slug else auto"),
      ).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-invalid=false when no error", () => {
      renderSlugField();
      expect(
        screen.getByPlaceholderText("Edit slug else auto"),
      ).toHaveAttribute("aria-invalid", "false");
    });

    it("adds form-error class", () => {
      renderSlugField({ error: "Slug is invalid" });
      expect(screen.getByPlaceholderText("Edit slug else auto")).toHaveClass(
        "form-error",
      );
    });
  });
});
