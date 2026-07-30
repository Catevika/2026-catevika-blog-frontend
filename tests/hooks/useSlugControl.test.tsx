import { useSlugControl } from "@/hooks/useSlugControl";
import type { SerializedPost } from "@/types";
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createMockPost(
  title: string,
  slug?: string,
  locked = true,
): SerializedPost {
  return {
    id: "1",
    title,
    content: "",
    slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
    status: "draft",
    author: {
      id: "user-1",
      name: "Test Author",
      email: "test@example.com",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locked,
    likeCount: 0,
    liked: false,
    likedBy: [],
    deleted: false,
  };
}

describe("useSlugControl", () => {
  const mockUpdateDraft = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDraft.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("initialization", () => {
    it("initializes with draft slug when provided", () => {
      const draft = createMockPost("My Post Title", "my-post-title");

      const { result } = renderHook(() =>
        useSlugControl({ postId: "new", draft, updateDraft: mockUpdateDraft }),
      );

      expect(result.current.slug).toBe("my-post-title");
      expect(result.current.liveSlug).toBe("my-post-title");
      expect(result.current.isNew).toBe(true);
    });

    it("initializes with auto-generated slug when slug is empty", () => {
      const draft = createMockPost("My Post Title");
      draft.slug = "";

      const { result } = renderHook(() =>
        useSlugControl({ postId: "new", draft, updateDraft: mockUpdateDraft }),
      );

      expect(result.current.slug).toBe("");
      expect(result.current.liveSlug).toBe("my-post-title");
    });

    it("sets isNew to true when postId is 'new'", () => {
      const draft = createMockPost("Test");

      const { result } = renderHook(() =>
        useSlugControl({ postId: "new", draft, updateDraft: mockUpdateDraft }),
      );

      expect(result.current.isNew).toBe(true);
    });

    it("sets isNew to false when postId is not 'new'", () => {
      const draft = createMockPost("Test");

      const { result } = renderHook(() =>
        useSlugControl({ postId: "123", draft, updateDraft: mockUpdateDraft }),
      );

      expect(result.current.isNew).toBe(false);
    });

    it("initializes locked from draft", () => {
      const draftLocked = createMockPost("Test", "test", true);
      const draftUnlocked = createMockPost("Test", "test", false);

      const { result: lockedResult } = renderHook(() =>
        useSlugControl({
          postId: "new",
          draft: draftLocked,
          updateDraft: mockUpdateDraft,
        }),
      );

      const { result: unlockedResult } = renderHook(() =>
        useSlugControl({
          postId: "new",
          draft: draftUnlocked,
          updateDraft: mockUpdateDraft,
        }),
      );

      expect(lockedResult.current.locked).toBe(true);
      expect(unlockedResult.current.locked).toBe(false);
    });
  });
});
