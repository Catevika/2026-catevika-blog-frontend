import { useState } from "react";
import { vi } from "vitest";

// Mock input-group from shadcn ui for "onTitleChange"
vi.mock("@/components/ui/input-group", () => {
  type Props = React.InputHTMLAttributes<HTMLInputElement>;

  const toStringValue = (v: Props["value"]): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.join(",");
    return String(v);
  };

  const InputGroup: React.FC<React.ComponentProps<"div">> = ({
    children,
    ...rest
  }) => {
    return (
      <div data-testid="input-group" {...rest}>
        {children}
      </div>
    );
  };

  // Controlled input mock that initializes once and forwards real events
  const InputGroupInput: React.FC<Props> = ({
    value: initialValue,
    onChange,
    placeholder,
    ...rest
  }) => {
    const [value, setValue] = useState<string>(() =>
      toStringValue(initialValue),
    );
    return (
      <input
        data-testid="title-input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          onChange?.(e);
        }}
        placeholder={placeholder}
        {...rest}
      />
    );
  };

  // Minimal other exports used by PostForm
  const InputGroupAddon: React.FC<React.ComponentProps<"div">> = (props) => (
    <div {...props} />
  );
  const InputGroupButton: React.FC<any> = (props) => <button {...props} />;
  const InputGroupText: React.FC<any> = (props) => <span {...props} />;
  const InputGroupTextarea: React.FC<React.ComponentProps<"textarea">> = (
    props,
  ) => <textarea {...props} />;

  return {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
  };
});

import PostForm from "@/components/PostForm";
import type { PostFormHandle, PostFormProps, SerializedPost } from "@/types";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/* -------------------------------------------------
   Minimal, fully typed mocks
------------------------------------------------- */

// SlugField mock
vi.mock("@/components/SlugField", () => ({
  default: vi.fn(() => <div data-testid="slug-field">SlugField</div>),
}));

// PostActions mock (must expose buttons)
vi.mock("@/components/PostActions", () => ({
  default: vi.fn(
    ({
      onSave,
      onReset,
      onCancel,
    }: {
      onSave: () => void;
      onReset: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="post-actions">
        <button onClick={onSave}>Save</button>
        <button onClick={onReset}>Reset</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ),
  ),
}));

// MDEditor mock
vi.mock("@uiw/react-md-editor", () => {
  type MDEditorProps = {
    value: string;
    onChange?: (value: string) => void;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  };

  const MDEditor = ({ value, onChange, textareaProps }: MDEditorProps) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...textareaProps}
    />
  );

  return { default: MDEditor };
});

// shadcn Select mock → native select
vi.mock("@/components/ui/select", () => {
  type SelectProps = {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  };

  type ChildrenProps = { children: React.ReactNode };

  type SelectItemProps = {
    value: string;
    children: React.ReactNode;
  };

  return {
    Select: ({ value, onValueChange, children }: SelectProps) => (
      <select
        data-testid="status-select"
        tabIndex={-1}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    ),
    SelectTrigger: ({ children }: ChildrenProps) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: ChildrenProps) => <>{children}</>,
    SelectGroup: ({ children }: ChildrenProps) => <>{children}</>,
    SelectLabel: ({ children }: ChildrenProps) => (
      <optgroup label={String(children)} />
    ),
    SelectItem: ({ value, children }: SelectItemProps) => (
      <option value={value}>{children}</option>
    ),
  };
});

/* -------------------------------------------------
   Helpers
------------------------------------------------- */

function createMockPost(
  title = "Test Post",
  content = "Test content",
  status: "draft" | "published" = "draft",
): SerializedPost {
  return {
    id: "1",
    title,
    content,
    slug: "test-post",
    status,
    author: {
      id: "user-1",
      name: "Test Author",
      email: "test@example.com",
    },
    locked: false,
    deleted: false,
    likeCount: 0,
    liked: false,
    likedBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyPost(): SerializedPost {
  return {
    id: "empty-1",
    title: "",
    content: "",
    slug: "",
    status: "draft",
    author: { id: "", name: "", email: "" },
    locked: true,
    deleted: false,
    likeCount: 0,
    liked: false,
    likedBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------
   Global cleanup
------------------------------------------------- */

afterEach(() => {
  cleanup();
});

/* -------------------------------------------------
   Test suite
------------------------------------------------- */

describe("PostForm", () => {
  const mockOnTitleChange = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnSlugInput = vi.fn();
  const mockOnSlugChange = vi.fn();
  const mockOnToggleLocked = vi.fn();
  const mockOnResetAuto = vi.fn();
  const mockOnContentChange = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);

    // jsdom does not implement requestSubmit
    (HTMLFormElement.prototype as any).requestSubmit = vi.fn();
  });

  function renderPostForm(overrides?: Partial<PostFormProps>) {
    const props: PostFormProps = {
      slug: "test-post",
      locked: false,
      theme: "light",
      draft: createMockPost(),
      originalTitle: "Test Post",
      originalContent: "Test content",
      originalStatus: "draft",
      isNew: true,
      postId: "new",
      onTitleChange: mockOnTitleChange,
      onStatusChange: mockOnStatusChange,
      onSlugInput: mockOnSlugInput,
      onSlugChange: mockOnSlugChange,
      onToggleLocked: mockOnToggleLocked,
      onResetAuto: mockOnResetAuto,
      onContentChange: mockOnContentChange,
      onReset: mockOnReset,
      onCancel: mockOnCancel,
      onSubmit: mockOnSubmit,
      ...overrides,
    };

    return render(<PostForm {...props} />);
  }

  /* -------------------------------------------------
     Rendering
  ------------------------------------------------- */

  describe("rendering", () => {
    it("renders form", () => {
      renderPostForm();
      expect(
        screen.getByRole("form", { name: "Edit post form" }),
      ).toBeInTheDocument();
    });

    it("renders title input", () => {
      renderPostForm();
      expect(
        screen.getByPlaceholderText("Enter post title"),
      ).toBeInTheDocument();
    });

    it("renders slug field", () => {
      renderPostForm();
      expect(screen.getByTestId("slug-field")).toBeInTheDocument();
    });

    it("renders markdown editor", () => {
      renderPostForm();
      expect(screen.getByTestId("md-editor")).toBeInTheDocument();
    });

    it("renders post actions", () => {
      renderPostForm();
      expect(screen.getByTestId("post-actions")).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------
     Title input
  ------------------------------------------------- */

  describe("title input", () => {
    it("displays draft title", () => {
      renderPostForm();
      expect(screen.getByPlaceholderText("Enter post title")).toHaveValue(
        "Test Post",
      );
    });

    it("calls onTitleChange when typing", async () => {
      const user = userEvent.setup();

      renderPostForm();

      const input = screen.getByPlaceholderText("Enter post title");

      await user.clear(input);
      await user.type(input, "New title");

      expect(mockOnTitleChange).toHaveBeenLastCalledWith("New title");
    });
  });

  /* -------------------------------------------------
     Status select
  ------------------------------------------------- */

  describe("status select", () => {
    it("shows draft", () => {
      renderPostForm();
      expect(screen.getByTestId("status-select")).toHaveValue("draft");
    });

    it("calls onStatusChange", async () => {
      renderPostForm();
      const select = screen.getByTestId("status-select");
      await userEvent.selectOptions(select, "published");
      expect(mockOnStatusChange).toHaveBeenCalledWith("published");
    });
  });

  /* -------------------------------------------------
     Reset dialog
  ------------------------------------------------- */

  describe("reset confirmation dialog", () => {
    it("opens dialog when draft has content", async () => {
      renderPostForm();
      await userEvent.click(screen.getByText("Reset"));
      expect(screen.getByText("Confirm Draft Reset")).toBeInTheDocument();
    });

    it("does not open when draft empty", async () => {
      renderPostForm({
        draft: createEmptyPost(),
        originalTitle: "",
        originalContent: "",
      });

      await userEvent.click(screen.getByText("Reset"));
      expect(screen.queryByText("Confirm Draft Reset")).not.toBeInTheDocument();
    });

    it("calls onReset when confirming", async () => {
      renderPostForm();
      await userEvent.click(screen.getByText("Reset"));
      await userEvent.click(screen.getAllByText("Reset")[1]);
      expect(mockOnReset).toHaveBeenCalled();
    });

    it("closes dialog when cancelling", async () => {
      renderPostForm();
      await userEvent.click(screen.getByText("Reset"));
      await userEvent.click(screen.getAllByText("Cancel")[1]);
      expect(screen.queryByText("Confirm Draft Reset")).not.toBeInTheDocument();
    });
  });

  /* -------------------------------------------------
     Cancel dialog
  ------------------------------------------------- */

  describe("cancel confirmation dialog", () => {
    it("opens when unsaved changes", async () => {
      renderPostForm({ draft: createMockPost("Modified Title") });
      await userEvent.click(screen.getByText("Cancel"));
      expect(screen.getByText("Confirm Discard changes")).toBeInTheDocument();
    });

    it("calls onCancel when confirming", async () => {
      renderPostForm({ draft: createMockPost("Modified Title") });
      await userEvent.click(screen.getByText("Cancel"));
      await userEvent.click(screen.getByText("Discard"));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("closes dialog when cancelling", async () => {
      renderPostForm({ draft: createMockPost("Modified Title") });
      await userEvent.click(screen.getByText("Cancel"));
      await userEvent.click(screen.getByText("Keep editing"));
      expect(
        screen.queryByText("Confirm Discard changes"),
      ).not.toBeInTheDocument();
    });
  });

  /* -------------------------------------------------
     Form submission
  ------------------------------------------------- */

  describe("form submission", () => {
    it("calls onSubmit", async () => {
      renderPostForm();
      await userEvent.click(screen.getByText("Save"));
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------
     Keyboard shortcuts
  ------------------------------------------------- */

  describe("Ctrl+S shortcut", () => {
    it("submits form on Ctrl+S by calling requestSubmit", async () => {
      // polyfill already present in your setup
      const user = userEvent.setup();

      // spy on the native requestSubmit so we can assert it was invoked
      const requestSubmitSpy = vi.spyOn(
        HTMLFormElement.prototype,
        "requestSubmit",
      );

      // render your component and ensure any props/state allow submission
      // e.g., renderPostForm({ onSubmit: mockOnSubmit }) or however you render it
      renderPostForm();

      // optional: wait for UI to be ready
      await screen.findByText("Save");

      // ensure activeElement is safe for user-event interception
      document.body.focus();

      // send Ctrl+S using userEvent
      await user.keyboard("{Control>}{s}{/Control>}");

      // assert requestSubmit was called
      await waitFor(() => {
        expect(requestSubmitSpy).toHaveBeenCalled();
      });

      // cleanup spy
      requestSubmitSpy.mockRestore();
    });

    it("does not submit when isSaving", async () => {
      renderPostForm({ isSaving: true });
      await userEvent.keyboard("{Ctrl>}s{/Ctrl}");
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------
     Imperative handle
  ------------------------------------------------- */

  describe("insertAtCursor", () => {
    it("exposes insertAtCursor", async () => {
      const ref = { current: null as PostFormHandle | null };

      render(
        <PostForm
          ref={ref}
          slug="test-post"
          locked={false}
          theme="light"
          draft={createMockPost()}
          originalTitle="Test Post"
          originalContent="Test content"
          originalStatus="draft"
          isNew={true}
          postId="new"
          onTitleChange={mockOnTitleChange}
          onStatusChange={mockOnStatusChange}
          onSlugInput={mockOnSlugInput}
          onSlugChange={mockOnSlugChange}
          onToggleLocked={mockOnToggleLocked}
          onResetAuto={mockOnResetAuto}
          onContentChange={mockOnContentChange}
          onReset={mockOnReset}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />,
      );

      await waitFor(() => expect(ref.current).not.toBeNull());
      expect(ref.current!.insertAtCursor).toBeDefined();
    });

    it("calls onContentChange", async () => {
      const ref = { current: null as PostFormHandle | null };

      render(
        <PostForm
          ref={ref}
          slug="test-post"
          locked={false}
          theme="light"
          draft={createMockPost()}
          originalTitle="Test Post"
          originalContent="Test content"
          originalStatus="draft"
          isNew={true}
          postId="new"
          onTitleChange={mockOnTitleChange}
          onStatusChange={mockOnStatusChange}
          onSlugInput={mockOnSlugInput}
          onSlugChange={mockOnSlugChange}
          onToggleLocked={mockOnToggleLocked}
          onResetAuto={mockOnResetAuto}
          onContentChange={mockOnContentChange}
          onReset={mockOnReset}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />,
      );

      // Wait until the imperative handle is attached
      await waitFor(() => {
        expect(ref.current).not.toBeNull();
        expect(ref.current?.insertAtCursor).toBeDefined();
      });

      // Narrow the type: we now KNOW insertAtCursor exists
      const handle = ref.current as Required<PostFormHandle>;

      handle.insertAtCursor("![img](url)");

      await waitFor(() => {
        expect(mockOnContentChange).toHaveBeenCalled();
      });
    });
  });
});
