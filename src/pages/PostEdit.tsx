// src/pages/PostEdit.tsx
import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useSinglePostQuery, useUpdatePostMutation } from "@/api/postHooks";
import { usePostDraft } from "@/hooks/usePostDraft";
import { useSlugControl } from "@/hooks/useSlugControl";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { createEmptyDraft } from "@/utils/createEmptyDraft";
import { slugifyFinal } from "@/utils/slugUtils";
import PostForm from "@/components/PostForm";
import PexelsSidebar from "@/components/PexelsSidebar";
import TypographyH1 from "@/components/TypographyH1";
import CustomPublishedButton from "@/components/CustomPublishedButton";
import CustomNewButton from "@/components/CustomNewButton";

const PostEdit = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);

  const { id: postIdParam } = useParams<{ id: string }>();
  const postId = postIdParam ?? "new";

  const {
    data: existingPost,
    isLoading,
    isError,
  } = useSinglePostQuery(postId === "new" ? "" : postId, user?.id);

  const { draft, setDraft, updateDraft } = usePostDraft(null);

  useEffect(() => {
    if (postId === "new") {
      setDraft(createEmptyDraft(user?.id));
      return;
    }
    if (existingPost && !draft) {
      setDraft(existingPost);
    }
  }, [postId, existingPost, draft, setDraft, user?.id]);

  const updatePostMutation = useUpdatePostMutation();

  const editorRef = useRef<{
    insertAtCursor?: (markdown: string) => void;
  } | null>(null);

  const insertAtEnd = useCallback(
    (markdown: string) => {
      if (editorRef.current?.insertAtCursor) {
        editorRef.current.insertAtCursor(markdown);
        return;
      }

      updateDraft((d) => ({
        content: (d.content ?? "") + "\n\n" + markdown,
      }));
    },
    [updateDraft],
  );

  const {
    slug,
    locked,
    handleTitleChange,
    handleSlugChangeFinal,
    handleManualSlugChangeLive,
    toggleSlugLocked,
    resetToAuto,
    isNew,
  } = useSlugControl({
    postId,
    draft: draft ?? undefined,
    updateDraft,
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft || !user?.id) return;

    const finalSlug = slugifyFinal(draft.slug || draft.title || "");

    const payload = {
      ...draft,
      slug: finalSlug,
      authorId: user.id,
      id: draft.id,
    };

    const saved = await updatePostMutation.mutateAsync(payload);
    setDraft(saved);
    void navigate(`/posts/${saved.id}`);
  };

  if (!isNew && isLoading && !draft) return <p>Loading…</p>;
  if (!isNew && isError && !draft) return <p>Failed to load post.</p>;
  if (!draft) return <p>Draft not available.</p>;

  return (
    <section>
      <div className="pb-2 flex-col-center md:flex-row md:flex-nowrap md:justify-between">
        <TypographyH1>{isNew ? "Create post" : "Edit post"}</TypographyH1>
        <div className="flex gap-2">
          <CustomPublishedButton />
          <CustomNewButton />
        </div>
      </div>
      <div>
        <PexelsSidebar onInsert={insertAtEnd} />

        <PostForm
          postId={postId}
          theme={theme}
          draft={draft}
          originalTitle={existingPost?.title ?? ""}
          originalContent={existingPost?.content ?? ""}
          originalStatus={existingPost?.status ?? "draft"}
          slug={slug}
          locked={locked}
          isNew={isNew}
          onResetAuto={resetToAuto}
          onTitleChange={handleTitleChange}
          onSlugChange={handleSlugChangeFinal}
          onSlugInput={handleManualSlugChangeLive}
          onToggleLocked={toggleSlugLocked}
          onSubmit={handleSubmit}
          onReset={() => setDraft(existingPost!)}
          onCancel={() => void navigate(-1)}
          onContentChange={(value) =>
            updateDraft(() => ({ content: value ?? "" }))
          }
          onStatusChange={(status) => updateDraft(() => ({ status }))}
        />
      </div>
    </section>
  );
};

export default PostEdit;
