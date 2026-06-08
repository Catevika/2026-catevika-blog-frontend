import type { SerializedPost, UseSlugControlProps } from "@/types";
import { slugifyFinal, slugifyLive } from "@/utils/slugUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useSlugControl = ({
  postId,
  draft,
  updateDraft,
}: UseSlugControlProps) => {
  const initializedRef = useRef(false);
  const liveSlugRef = useRef<string>("");

  const [liveSlug, setLiveSlug] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const locked = draft?.locked ?? true;
  const isNew = postId === "new";

  const autoSlug = useMemo(
    () => slugifyFinal(draft?.title ?? ""),
    [draft?.title],
  );

  /* -------------------------
     Initialization + Sync
  ------------------------- */
  useEffect(() => {
    if (!draft) return;

    const draftSlug = draft.slug || slugifyFinal(draft.title || "");

    // First initialization
    if (!initializedRef.current) {
      initializedRef.current = true;
      liveSlugRef.current = draftSlug;
      setLiveSlug(draftSlug);
      return;
    }

    // Do NOT sync while user is typing
    if (isFocused) return;

    // Only update if slug actually changed
    if (draftSlug !== liveSlugRef.current) {
      liveSlugRef.current = draftSlug;
      setLiveSlug(draftSlug);
    }
  }, [draft, isFocused]);

  /* -------------------------
     Handlers
  ------------------------- */

  const handleTitleChange = useCallback(
    (value: string) => {
      updateDraft((d: SerializedPost) => {
        const updates: Partial<SerializedPost> = { title: value };

        if (d.locked) {
          const newAuto = slugifyFinal(value);

          if (d.slug === liveSlugRef.current) {
            updates.slug = newAuto;
            liveSlugRef.current = newAuto;
            setLiveSlug(newAuto);
          }
        }

        return updates;
      });
    },
    [updateDraft],
  );

  const handleSlugChange = useCallback(
    (rawSlug: string) => {
      updateDraft(() => ({ slug: rawSlug }));
      liveSlugRef.current = rawSlug;
      setLiveSlug(rawSlug);
    },
    [updateDraft],
  );

  const handleManualSlugChangeLive = useCallback(
    (rawSlug: string) => {
      const live = slugifyLive(rawSlug);
      updateDraft(() => ({ slug: live, locked: false }));
      liveSlugRef.current = live;
      setLiveSlug(live);
    },
    [updateDraft],
  );

  const handleSlugChangeFinal = useCallback(
    (rawOrLiveSlug: string) => {
      const final = slugifyFinal(rawOrLiveSlug || (draft?.title ?? ""));
      updateDraft(() => ({ slug: final }));
      liveSlugRef.current = final;
      setLiveSlug(final);
    },
    [updateDraft, draft?.title],
  );

  const toggleSlugLocked = useCallback(() => {
    updateDraft((d: SerializedPost) => {
      const newLocked = !d.locked;
      const updates: Partial<SerializedPost> = { locked: newLocked };

      if (newLocked) {
        const newAuto = slugifyFinal(d.title || "");
        updates.slug = newAuto;
        liveSlugRef.current = newAuto;
        setLiveSlug(newAuto);
      }

      return updates;
    });
  }, [updateDraft]);

  const resetToAuto = useCallback(() => {
    const newAuto = slugifyFinal(draft?.title ?? "");
    updateDraft(() => ({ slug: newAuto, locked: true }));
    liveSlugRef.current = newAuto;
    setLiveSlug(newAuto);
  }, [updateDraft, draft?.title]);

  const resetSlugState = useCallback(() => {
    initializedRef.current = false;
    setLiveSlug("");
  }, []);

  return {
    slug: draft?.slug ?? autoSlug,
    liveSlug,
    locked,
    isNew,
    isFocused,
    setIsFocused,
    handleTitleChange,
    handleSlugChange,
    handleManualSlugChangeLive,
    handleSlugChangeFinal,
    toggleSlugLocked,
    resetToAuto,
    resetSlugState,
  };
};
