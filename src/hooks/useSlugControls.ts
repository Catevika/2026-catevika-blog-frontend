import { useCallback, useMemo, useState } from "react";
import type { Post, UseSlugControlProps } from "@/types";
import { slugifyFinal, slugifyLive } from "@/utils/slugUtils";

export const useSlugControl = ({
  postId,
  draft,
  updateDraft,
}: UseSlugControlProps) => {
  const isNew = postId === "new";

  const [liveSlug, setLiveSlug] = useState(draft?.slug ?? "");
  const locked = draft?.locked ?? true;

  const autoSlug = useMemo(
    () => slugifyFinal(draft?.title ?? ""),
    [draft?.title],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      if (!draft) return;

      if (locked) {
        const newAuto = slugifyFinal(value);
        updateDraft(() => ({ title: value, slug: newAuto }));
        setLiveSlug(newAuto);
      } else {
        updateDraft(() => ({ title: value }));
      }
    },
    [draft, locked, updateDraft],
  );

  const handleManualSlugChangeLive = useCallback(
    (rawSlug: string) => {
      if (!draft) return;

      const live = slugifyLive(rawSlug);
      updateDraft(() => ({ slug: live, locked: false }));
      setLiveSlug(live);
    },
    [draft, updateDraft],
  );

  const handleSlugChangeFinal = useCallback(
    (rawOrLiveSlug: string) => {
      if (!draft) return;

      const final = slugifyFinal(rawOrLiveSlug || draft.title || "");
      updateDraft(() => ({ slug: final }));
      setLiveSlug(final);
    },
    [draft, updateDraft],
  );

  const toggleSlugLocked = useCallback(() => {
    if (!draft) return;

    updateDraft((d: Post) => {
      const newLocked = !d.locked;

      if (newLocked) {
        const newAuto = slugifyFinal(d.title || "");
        setLiveSlug(newAuto);
        return { locked: true, slug: newAuto };
      }

      return { locked: false };
    });
  }, [draft, updateDraft]);

  const resetToAuto = useCallback(() => {
    if (!draft) return;

    const newAuto = slugifyFinal(draft.title || "");
    updateDraft(() => ({ slug: newAuto, locked: true }));
    setLiveSlug(newAuto);
  }, [draft, updateDraft]);

  return {
    slug: draft?.slug ?? autoSlug,
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
