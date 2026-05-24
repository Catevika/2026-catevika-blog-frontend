import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { uploaderApi } from "@/api/uploaderApi";
import type { ImageUploadResponse, PostFormProps, PostStatus } from "@/types";
import MarkdownImage from "@/components/MarkdownImage";
import MarkdownLink from "@/components/MarkdownLink";
import PostActions from "@/components/PostActions";
import SlugField from "@/components/SlugField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import MDEditor from "@uiw/react-md-editor";
import { InputGroup, InputGroupInput } from "./ui/input-group";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// Global dragged file slot used by drag/drop between windows
export interface PostFormHandle {
  insertAtCursor?: (markdown: string) => void;
}

const PostForm = forwardRef<PostFormHandle, PostFormProps>(
  function PostForm(props, ref) {
    const {
      slug,
      theme,
      draft,
      originalTitle,
      originalContent,
      originalStatus,
      isNew,
      postId,
      locked,
      onResetAuto,
      isSaving,
      saveError,
      onTitleChange,
      onSlugChange,
      onSlugInput,
      onToggleLocked,
      onSubmit,
      onReset,
      onCancel,
      onContentChange,
      onStatusChange,
    } = props;

    const titleId = useId();
    const statusId = useId();
    const formHelpId = useId();
    const editorLabelId = useId();
    const editorHelpId = useId();
    const titleHelpId = useId();

    const formRef = useRef<HTMLFormElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const draftContentRef = useRef<string>(draft?.content ?? "");

    useEffect(() => {
      draftContentRef.current = draft?.content ?? "";
    }, [draft?.content]);

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const pendingUploadsRef = useRef<number>(0);
    const [, forceRerender] = useState(0);
    const incrementPending = useCallback(() => {
      pendingUploadsRef.current += 1;
      forceRerender((n) => n + 1);
    }, []);
    const decrementPending = useCallback(() => {
      pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current - 1);
      forceRerender((n) => n + 1);
    }, []);

    const hasUnsavedChanges =
      draft?.title !== originalTitle ||
      draft?.content !== originalContent ||
      draft?.status !== originalStatus;

    const hasTitleError = (saveError ?? "").toLowerCase().includes("title");
    const hasSlugError = (saveError ?? "").toLowerCase().includes("slug");

    const handleSaveShortcut = useCallback(
      (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "s") {
          event.preventDefault();
          if (pendingUploadsRef.current > 0) return;
          if (!isSaving && formRef.current) formRef.current.requestSubmit();
        }
      },
      [isSaving],
    );

    useEffect(() => {
      const listener = (e: KeyboardEvent) => handleSaveShortcut(e);
      document.addEventListener("keydown", listener as EventListener);
      return () =>
        document.removeEventListener("keydown", listener as EventListener);
    }, [handleSaveShortcut]);

    useEffect(() => {
      const id = `${editorLabelId}-textarea`;
      const el = document.getElementById(id) as HTMLTextAreaElement | null;
      textareaRef.current = el ?? null;
      return () => {
        if (textareaRef.current?.id === id) textareaRef.current = null;
      };
    }, [editorLabelId]);

    useEffect(() => {
      const id = `${editorLabelId}-textarea`;
      const el = document.getElementById(id) as HTMLTextAreaElement | null;
      if (el && textareaRef.current !== el) textareaRef.current = el;
    }, [editorLabelId]);

    const getCurrentContent = useCallback((): string => {
      const domValue = textareaRef.current?.value;
      if (typeof domValue === "string") return domValue;
      return draftContentRef.current;
    }, []);

    const insertAtCursor = useCallback(
      (markdown: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart ?? textarea.value.length;
          const end = textarea.selectionEnd ?? start;
          const current = textarea.value ?? "";
          const before = current.slice(0, start);
          const after = current.slice(end);
          const next = before + markdown + after;
          onContentChange?.(next);

          setTimeout(() => {
            textarea.focus();
            const pos = start + markdown.length;
            textarea.setSelectionRange(pos, pos);
          }, 0);
          return;
        }

        onContentChange?.((draft?.content ?? "") + "\n\n" + markdown);
      },
      [onContentChange, draft?.content],
    );

    useImperativeHandle(ref, () => ({ insertAtCursor }));

    const handleReset = useCallback(() => {
      if (
        draft?.title?.trim() ||
        draft?.content?.trim() ||
        draft?.slug?.trim()
      ) {
        setShowResetConfirm(true);
        return;
      }
      onReset?.();
    }, [draft?.title, draft?.content, draft?.slug, onReset]);

    const handleCancel = useCallback(() => {
      if (hasUnsavedChanges) {
        setShowCancelConfirm(true);
        return;
      }
      onCancel?.();
    }, [hasUnsavedChanges, onCancel]);

    const confirmReset = useCallback(() => {
      setShowResetConfirm(false);
      onReset?.();
    }, [onReset]);

    const confirmCancel = useCallback(() => {
      setShowCancelConfirm(false);
      onCancel?.();
    }, [onCancel]);

    const cancelAny = useCallback(() => {
      setShowResetConfirm(false);
      setShowCancelConfirm(false);
    }, []);

    const getAltText = useCallback((file: File): string => {
      if (file.name) {
        const base = file.name.replace(/\.[^/.]+$/, "");
        return base || "image";
      }
      return "image";
    }, []);

    const uploadThenInsert = useCallback(
      async (file: File, alt?: string) => {
        incrementPending();
        try {
          const resp: ImageUploadResponse = await uploaderApi.uploadImage(file);

          if (resp?.success && resp.data?.url) {
            let finalUrl: string = resp.data.url;

            if (finalUrl.startsWith("/")) {
              finalUrl = `${window.location.origin}${finalUrl}`;
            }

            const markdown = `![${alt ?? getAltText(file)}](${finalUrl})`;
            insertAtCursor("\n\n" + markdown);
            return finalUrl;
          }
        } catch (err) {
          console.error("Upload failed", err);
        } finally {
          decrementPending();
        }
        return undefined;
      },
      [insertAtCursor, incrementPending, decrementPending, getAltText],
    );

    const handleDropCapture = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const text: string = e.dataTransfer.getData("text/plain") ?? "";

        const fileFromWindow: File | undefined = window.__draggedImageFile;
        const fileFromDrop: File | undefined = e.dataTransfer.files?.[0];
        const file: File | undefined = fileFromWindow ?? fileFromDrop;

        void (async () => {
          if (text && file) {
            const alt = getAltText(file);
            const finalUrl = await uploadThenInsert(file, alt);

            if (finalUrl) {
              const finalMarkdown = `![${alt}](${finalUrl})`;
              const current = getCurrentContent();
              const updated = current.split(text).join(finalMarkdown);
              if (updated !== current) {
                onContentChange?.(updated);
              }
            }

            window.__draggedImageFile = undefined;
            return;
          }

          if (text) {
            insertAtCursor("\n\n" + text);
            return;
          }

          if (file) {
            const alt = getAltText(file);
            await uploadThenInsert(file, alt);
          }
        })();
      },
      [
        getCurrentContent,
        insertAtCursor,
        onContentChange,
        uploadThenInsert,
        getAltText,
      ],
    );

    /* -------------------------
       Slug handlers (local wrappers)
     ------------------------- */

    const handleSlugInput = useCallback(
      (value: string) => {
        onSlugInput?.(value);
      },
      [onSlugInput],
    );

    const handleSlugChange = useCallback(
      (value: string) => {
        onSlugChange?.(value);
      },
      [onSlugChange],
    );

    const handleToggleLocked = useCallback(() => {
      onToggleLocked?.();
    }, [onToggleLocked]);

    const handleResetAuto = useCallback(() => {
      // prefer parent-provided onResetAuto if present
      if (typeof onResetAuto === "function") {
        onResetAuto();
        return;
      }
      // otherwise, no-op here — SlugField will call onResetAuto prop if provided
    }, [onResetAuto]);

    /* -------------------------
       Render
     ------------------------- */

    return (
      <form
        id="post-form"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit?.(e);
        }}
        aria-label="Edit post form"
        aria-describedby={`${formHelpId} ${saveError ? "form-error" : ""}`}
        noValidate
      >
        <div id={formHelpId} className="sr-only">
          Press Control plus S or Command plus S to save your post at any time
        </div>

        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSaving && "Saving your post, please wait"}
        </div>

        {saveError && (
          <div
            id="form-error"
            role="alert"
            aria-live="assertive"
            className="form-error"
            title="save-error"
          >
            <span className="form-error">Save failed:</span>{" "}
            <span className="form-error">{saveError}</span>
          </div>
        )}

        <PostActions
          isSaving={Boolean(isSaving) || pendingUploadsRef.current > 0}
          hasUnsavedChanges={hasUnsavedChanges}
          pendingUploads={pendingUploadsRef.current}
          onSave={() => formRef.current?.requestSubmit()}
          onReset={handleReset}
          onCancel={handleCancel}
        />

        {/* Title + Status block */}
        <div className="post-create-edit-title-status">
          <Field className="post-create-edit-title-group">
            <FieldLabel htmlFor={titleId} className="font-semibold">
              Title <span>*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={titleId}
                name="title"
                type="text"
                value={draft?.title ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onTitleChange?.(e.target.value)
                }
                placeholder="Enter post title"
                disabled={Boolean(isSaving)}
                required
                aria-required="true"
                aria-invalid={hasTitleError}
                aria-describedby={
                  hasTitleError ? `${titleHelpId} form-error` : titleHelpId
                }
              />
            </InputGroup>
            <div id={titleHelpId} className="sr-only">
              Post title, required field
            </div>
          </Field>

          <div className="post-create-edit-status-group">
            <p id={statusId} className="sr-only">
              Post status
            </p>

            <div className="mt-1 lg:mt-0">
              <Select
                name="status"
                value={draft?.status ?? "draft"}
                onValueChange={(value) => onStatusChange?.(value as PostStatus)}
                aria-label="Select post status"
              >
                <SelectTrigger className="w-42 border border-input px-3 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-ring">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SlugField */}
        <div className="mb-2">
          <SlugField
            title={draft?.title ?? ""}
            slug={slug}
            locked={locked ?? false}
            onSlugInput={handleSlugInput}
            onSlugChange={handleSlugChange}
            onToggleLocked={handleToggleLocked}
            onResetAuto={handleResetAuto}
            disabled={Boolean(isSaving)}
            error={hasSlugError ? saveError : undefined}
            postId={postId}
            isNew={Boolean(isNew)}
          />
        </div>

        {/* Editor */}
        <fieldset
          className="mdEditor-container no-scrollbar"
          data-color-mode={theme}
        >
          <legend id={editorLabelId} className="sr-only">
            Post content editor
          </legend>

          <section
            aria-labelledby={editorLabelId}
            aria-describedby={editorHelpId}
            onDragOverCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                e.dataTransfer.dropEffect = "copy";
              } catch {
                // ignore
              }
            }}
            onDropCapture={handleDropCapture}
          >
            <MDEditor
              value={draft?.content ?? ""}
              onChange={(value) => onContentChange?.(String(value ?? ""))}
              height={275}
              preview="live"
              hideToolbar={false}
              previewOptions={{
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [
                  rehypeRaw,
                  rehypeKatex,
                  rehypeSlug,
                  [
                    rehypeSanitize,
                    {
                      tagNames: [
                        "p",
                        "br",
                        "strong",
                        "em",
                        "u",
                        "s",
                        "del",
                        "ins",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "ul",
                        "ol",
                        "li",
                        "code",
                        "pre",
                        "blockquote",
                        "q",
                        "hr",
                        "table",
                        "thead",
                        "tbody",
                        "tr",
                        "th",
                        "td",
                        "div",
                        "img",
                        "figure",
                        "figcaption",
                        "span",
                        "math",
                        "annotation",
                        "semantics",
                      ],
                      attributes: {
                        "*": ["className", "style", "id"],
                        a: ["href", "target", "rel", "title"],
                        img: ["src", "alt", "width", "height", "loading"],
                        th: ["colspan", "rowspan", "scope", "abbr"],
                        td: ["colspan", "rowspan"],
                        table: ["role"],
                        span: ["className", "style"],
                        math: ["*"],
                        annotation: ["*"],
                        semantics: ["*"],
                      },
                    },
                  ],
                ],
                skipHtml: false,
                components: {
                  a: MarkdownLink,
                  img: MarkdownImage,
                },
              }}
              textareaProps={{
                id: `${editorLabelId}-textarea`,
                placeholder:
                  "Write your blog post here... Supports Markdown, images from Pexels sidebar and device uploads",
                "aria-labelledby": editorLabelId,
                "aria-describedby": editorHelpId,
              }}
            />
          </section>
        </fieldset>

        <AlertDialog open={showResetConfirm}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Draft Reset</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col gap-2">
                <span>This will clear your current edits.</span>
                <span>Are you sure?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelAny} variant={"outline"}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmReset} variant={"destructive"}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showCancelConfirm}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Discard changes</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col gap-2">
                <span>You have unsaved changes.</span>
                <span>Discard them?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelAny} variant={"outline"}>
                Keep editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                variant={"destructive"}
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    );
  },
);

export default PostForm;
