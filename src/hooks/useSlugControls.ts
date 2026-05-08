import { useCallback, useMemo, useState } from "react";
import type { Post, UseSlugControlProps } from "@/types";
import { slugifyFinal, slugifyLive } from "@/utils/slugUtils";

export const useSlugControl = ({
  postId,
  post,
  updatePost,
}: UseSlugControlProps) => {
  const isNew = postId === "new";

  const [liveSlug, setLiveSlug] = useState(post?.slug ?? "");
  const locked = post?.locked ?? true;

  const autoSlug = useMemo(
    () => slugifyFinal(post?.title ?? ""),
    [post?.title],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      if (!post) return;

      if (locked) {
        const newAuto = slugifyFinal(value);
        updatePost(() => ({ title: value, slug: newAuto }));
        setLiveSlug(newAuto);
      } else {
        updatePost(() => ({ title: value }));
      }
    },
    [post, locked, updatePost],
  );

  const handleManualSlugChangeLive = useCallback(
    (rawSlug: string) => {
      if (!post) return;

      const live = slugifyLive(rawSlug);
      updatePost(() => ({ slug: live, locked: false }));
      setLiveSlug(live);
    },
    [post, updatePost],
  );

  const handleSlugChangeFinal = useCallback(
    (rawOrLiveSlug: string) => {
      if (!post) return;

      const final = slugifyFinal(rawOrLiveSlug || post.title || "");
      updatePost(() => ({ slug: final }));
      setLiveSlug(final);
    },
    [post, updatePost],
  );

  const toggleSlugLocked = useCallback(() => {
    if (!post) return;

    updatePost((d: Post) => {
      const newLocked = !d.locked;

      if (newLocked) {
        const newAuto = slugifyFinal(d.title || "");
        setLiveSlug(newAuto);
        return { locked: true, slug: newAuto };
      }

      return { locked: false };
    });
  }, [post, updatePost]);

  const resetToAuto = useCallback(() => {
    if (!post) return;

    const newAuto = slugifyFinal(post.title || "");
    updatePost(() => ({ slug: newAuto, locked: true }));
    setLiveSlug(newAuto);
  }, [post, updatePost]);

  return {
    slug: post?.slug ?? autoSlug,
    liveSlug,
    locked,
    isNew,
    handleTitleChange,
    handleManualSlugChangeLive,
    handleSlugChangeFinal,
    toggleSlugLocked,
    resetToAuto,
  };
};
