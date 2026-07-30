import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostActions from "@/components/PostActions";

describe("PostActions", () => {
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnReset.mockClear();
    mockOnCancel.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  function renderPostActions(propsOverrides?: any) {
    return render(
      <PostActions
        isSaving={false}
        hasUnsavedChanges={false}
        pendingUploads={0}
        onSave={mockOnSave}
        onReset={mockOnReset}
        onCancel={mockOnCancel}
        {...propsOverrides}
      />,
    );
  }

  describe("rendering", () => {
    it("renders Cancel, Reset, and Save buttons", () => {
      renderPostActions();

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("displays 'Saving...' text when isSaving is true", () => {
      renderPostActions({ isSaving: true });

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("displays 'Save' text when isSaving is false", () => {
      renderPostActions();

      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("has correct aria-label when isSaving is true", () => {
      renderPostActions({ isSaving: true });

      const saveButton = screen.getByText("Saving...");
      expect(saveButton).toHaveAttribute("aria-label", "Saving post");
    });

    it("has correct aria-label when isSaving is false", () => {
      renderPostActions();

      const saveButton = screen.getByText("Save");
      expect(saveButton).toHaveAttribute("aria-label", "Save post (Ctrl+S)");
    });

    it("has aria-busy=true when isSaving is true", () => {
      renderPostActions({ isSaving: true });

      const saveButton = screen.getByText("Saving...");
      expect(saveButton).toHaveAttribute("aria-busy", "true");
    });

    it("has title attribute on Save button", () => {
      renderPostActions();

      const saveButton = screen.getByText("Save");
      expect(saveButton).toHaveAttribute(
        "title",
        "Save post (Ctrl+S or Cmd+S)",
      );
    });
  });

  describe("button disabled state", () => {
    it("disables all buttons when isSaving is true", () => {
      renderPostActions({ isSaving: true });

      expect(screen.getByText("Cancel")).toBeDisabled();
      expect(screen.getByText("Saving...")).toBeDisabled();
      expect(screen.getByText("Reset")).toBeDisabled();
    });

    it("enables all buttons when isSaving is false", () => {
      renderPostActions();

      expect(screen.getByText("Cancel")).not.toBeDisabled();
      expect(screen.getByText("Save")).not.toBeDisabled();
      expect(screen.getByText("Reset")).not.toBeDisabled();
    });
  });

  describe("button clicks", () => {
    it("calls onCancel when Cancel button is clicked", async () => {
      renderPostActions();

      await userEvent.click(screen.getByText("Cancel"));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onReset when Reset button is clicked", async () => {
      renderPostActions();

      await userEvent.click(screen.getByText("Reset"));
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it("does not call onCancel when isSaving is true", async () => {
      renderPostActions({ isSaving: true });

      await userEvent.click(screen.getByText("Cancel"));
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it("does not call onReset when isSaving is true", async () => {
      renderPostActions({ isSaving: true });

      await userEvent.click(screen.getByText("Reset"));
      expect(mockOnReset).not.toHaveBeenCalled();
    });
  });

  describe("button types", () => {
    it("has type=button on Cancel button", () => {
      renderPostActions();

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toHaveAttribute("type", "button");
    });

    it("has type=reset on Reset button", () => {
      renderPostActions();

      const resetButton = screen.getByText("Reset");
      expect(resetButton).toHaveAttribute("type", "reset");
    });

    it("has type=submit on Save button", () => {
      renderPostActions();

      const saveButton = screen.getByText("Save");
      expect(saveButton).toHaveAttribute("type", "submit");
    });
  });
});
