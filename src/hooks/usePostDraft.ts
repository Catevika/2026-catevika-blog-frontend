import { useCallback, useState } from "react";
import type { Post } from "@/types";

export function usePostDraft(initial: Post | null) {
  const [draft, setDraft] = useState<Post | null>(initial);

  const updateDraft = useCallback((fn: (d: Post) => Partial<Post>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, ...fn(prev) };
    });
  }, []);

  return { draft, setDraft, updateDraft };
}
