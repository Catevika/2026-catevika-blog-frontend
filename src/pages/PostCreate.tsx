import { useCreatePostMutation } from "@/api/postHooks";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomPublishedButton from "@/components/CustomPublishedButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import PexelsSidebar from "@/components/PexelsSidebar";
import PostForm from "@/components/PostForm";
import TypographyH1 from "@/components/TypographyH1";
import { ApiError } from "@/errors/ApiError";
import { usePostDraft } from "@/hooks/usePostDraft";
import { useSlugControl } from "@/hooks/useSlugControl";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import type { Post, PostFormValues, PostStatus } from "@/types";
import { createEmptyDraft } from "@/utils/createEmptyDraft";
import { slugifyFinal } from "@/utils/slugUtils";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

const PostCreate = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);

  const { draft, setDraft, updateDraft } = usePostDraft(
    createEmptyDraft(user?.id),
  );

  const [backendSuggestion, setBackendSuggestion] = useState<string | null>(
    null,
  );

  const createPostMutation = useCreatePostMutation();

  const editorRef = useRef<{
    insertAtCursor?: (markdown: string) => void;
  } | null>(null);

  const insertAtEnd = (markdown: string) => {
    if (editorRef.current?.insertAtCursor) {
      editorRef.current.insertAtCursor(markdown);
      return;
    }

    updateDraft((d) => ({
      content: (d.content ?? "") + "\n\n" + markdown,
    }));
  };

  const {
    slug,
    locked,
    isNew,
    handleTitleChange,
    handleSlugChangeFinal,
    handleManualSlugChangeLive,
    toggleSlugLocked,
    resetToAuto,
  } = useSlugControl({
    postId: "new",
    draft: draft ?? undefined,
    updateDraft,
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft || !user?.id) return;

    const finalSlug = slugifyFinal(draft.slug || draft.title || "");

    const payload: PostFormValues = {
      title: draft.title.trim(),
      content: draft.content,
      status: draft.status,
      slug: finalSlug,
      locked: draft.locked,
      authorId: user.id,
    };

    try {
      const saved = await createPostMutation.mutateAsync(payload);
      setDraft(saved);
      void navigate(`/posts/${saved.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const data = err.data as {
          errors: { slug: string };
          suggestion?: string;
        };

        if (data.suggestion) {
          if (locked) {
            updateDraft(() => ({ slug: data.suggestion }));
            setBackendSuggestion(null); // no UI suggestion in auto-mode
          } else {
            // ⭐ MANUAL MODE: show suggestion in UI
            setBackendSuggestion(data.suggestion);
          }
        }

        return;
      }
    }
  };

  return (
    <section id="post-create-edit">
      <div className="post-create-edit-main-title">
        <TypographyH1>{isNew ? "Create post" : "Edit post"}</TypographyH1>
        <div className="flex gap-2 mb-2 md:mb-0">
          <CustomTrendingButton />
          <CustomFeedButton />
          <CustomPublishedButton />
        </div>
      </div>
      <div className="post-create-edit-container">
        <PexelsSidebar onInsert={insertAtEnd} />

        <PostForm
          ref={editorRef}
          postId="new"
          theme={theme}
          draft={draft!}
          originalTitle=""
          originalContent=""
          originalStatus="draft"
          slug={slug}
          locked={locked}
          isNew={true}
          onResetAuto={resetToAuto}
          onTitleChange={handleTitleChange}
          onSlugChange={handleSlugChangeFinal}
          onSlugInput={handleManualSlugChangeLive}
          onToggleLocked={toggleSlugLocked}
          onSubmit={handleSubmit}
          onReset={() => setDraft(createEmptyDraft(user?.id))}
          onCancel={() => void navigate(-1)}
          onContentChange={(value: Post["content"]) =>
            updateDraft(() => ({ content: value ?? "" }))
          }
          backendSuggestion={backendSuggestion}
          onStatusChange={(status: PostStatus) =>
            updateDraft(() => ({ status }))
          }
        />
      </div>
    </section>
  );
};

export default PostCreate;
