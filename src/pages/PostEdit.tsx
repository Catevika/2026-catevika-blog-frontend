import {
  useCreatePostMutation,
  useSinglePostQuery,
  useUpdatePostMutation,
} from "@/api/postHooks";
import CustomFeedButton from "@/components/CustomFeedButton";
import CustomNewButton from "@/components/CustomNewButton";
import CustomPublishedButton from "@/components/CustomPublishedButton";
import CustomTrendingButton from "@/components/CustomTrendingButton";
import PexelsSidebar from "@/components/PexelsSidebar";
import PostEditHeader from "@/components/PostEditHeader";
import PostForm from "@/components/PostForm";
import { useSlugControl } from "@/hooks/useSlugControl";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import type { PostStatus, SerializedPost } from "@/types";
import { createEmptyDraft } from "@/utils/createEmptyDraft";
import { slugifyFinal } from "@/utils/slugUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

const PostEdit = () => {
  const { theme } = useTheme();
  const { id: postIdParam } = useParams<{ id: string }>();
  const postId = postIdParam ?? "new";
  const isNew = postId === "new";

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const {
    data: existingPost,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = useSinglePostQuery(isNew ? "" : postId, user?.id);

  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();

  const [draft, setDraft] = useState<SerializedPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateDraft = useCallback(
    (fn: (draft: SerializedPost) => Partial<SerializedPost>) => {
      setDraft((prev) => {
        if (!prev) return prev;
        return { ...prev, ...fn(prev) };
      });
    },
    [],
  );

  const {
    slug,
    locked,
    handleTitleChange,
    handleSlugChangeFinal,
    handleManualSlugChangeLive,
    toggleSlugLocked,
    resetSlugState,
    resetToAuto,
  } = useSlugControl({
    postId,
    draft: draft ?? undefined,
    updateDraft,
  });

  const editorRef = useRef<{
    insertAtCursor?: (markdown: string) => void;
  } | null>(null);

  const insertAtEnd = (markdown: string) => {
    if (editorRef.current?.insertAtCursor) {
      editorRef.current.insertAtCursor(markdown);
      return;
    }
    updateDraft((d) => ({ content: (d.content ?? "") + "\n\n" + markdown }));
  };

  const resetDraft = useCallback(() => {
    setDraft(createEmptyDraft(user?.id));
    resetSlugState();
  }, [resetSlugState, user?.id]);

  useEffect(() => {
    if (isNew) {
      queueMicrotask(() => {
        setDraft((prev) => prev ?? createEmptyDraft(user?.id));
      });
      return;
    }

    if (existingPost && !draft) {
      queueMicrotask(() => {
        setDraft(existingPost);
      });
    }
  }, [isNew, existingPost, draft, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    queueMicrotask(() => {
      setDraft((prev) => {
        if (!prev) return prev;
        if (prev.author.id === user.id) return prev;

        return {
          ...prev,
          author: {
            ...(prev.author ?? {
              id: user.id,
              name: user.name,
              email: user.email,
            }),
          },
        };
      });
    });
  }, [user]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError(null);

    if (!draft) {
      setSaveError("Draft is not ready yet.");
      return;
    }

    if (!draft.title?.trim()) {
      setSaveError("Title cannot be empty");
      return;
    }

    if (!user?.id) {
      setSaveError("You must be logged in to save a post.");
      return;
    }

    setIsSaving(true);

    try {
      const finalSlug = slugifyFinal(draft.slug || draft.title || "");

      const payload: Partial<SerializedPost> = {
        title: draft.title.trim(),
        content: draft.content,
        status: draft.status,
        slug: finalSlug,
        locked: draft.locked,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };

      let savedPost: SerializedPost;

      if (isNew) {
        savedPost = await createPostMutation.mutateAsync(payload);
      } else {
        savedPost = await updatePostMutation.mutateAsync({
          ...(draft ?? {}),
          ...payload,
          id: draft?.id || postId,
        });
      }

      setDraft(savedPost);
      resetSlugState();
      void navigate(`/posts/${savedPost.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && isLoadingPost && !draft) {
    return (
      <section className="section">
        <p>Loading post...</p>
      </section>
    );
  }

  if (!isNew && isPostError && !draft) {
    return (
      <section className="section">
        <p>Failed to load post.</p>
        <CustomPublishedButton />
      </section>
    );
  }

  if (!draft) {
    return (
      <section className="section">
        <p>Draft not available.</p>
      </section>
    );
  }

  return (
    <section id="post-create-edit">
      <div className="pb-2 flex-col-center md:flex-row md:flex-nowrap md:justify-between">
        <PostEditHeader isNew={isNew} status={draft.status} />

        <div className="flex gap-2">
          <CustomTrendingButton />
          <CustomFeedButton />
          <CustomPublishedButton />
          {!isNew && <CustomNewButton />}
        </div>
      </div>

      <div className="post-create-edit-container">
        <PexelsSidebar onInsert={insertAtEnd} />

        <PostForm
          ref={editorRef}
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
          isSaving={isSaving}
          saveError={saveError}
          onTitleChange={handleTitleChange}
          onSlugChange={handleSlugChangeFinal}
          onSlugInput={handleManualSlugChangeLive}
          onToggleLocked={toggleSlugLocked}
          onSubmit={handleSubmit}
          onReset={resetDraft}
          onCancel={() => void navigate(-1)}
          onContentChange={(value) =>
            updateDraft(() => ({ content: value ?? "" }))
          }
          onStatusChange={(status: PostStatus) =>
            updateDraft(() => ({ status }))
          }
        />
      </div>
    </section>
  );
};

export default PostEdit;
