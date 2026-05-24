import { useEffect, useRef, useState } from "react";
import { slugifyFinal } from "@/utils/slugUtils";
import { useDebounce } from "@/hooks/useDebounce";
import type { SlugAvailability } from "@/types";

export const useSlugAvailability = (
  value: string,
  options?: {
    checkUrl?: string;
    debounceMs?: number;
    excludeId?: string | undefined;
  },
) => {
  const {
    checkUrl = `${import.meta.env.VITE_APP_URL}/api/posts/check-slug`,
    debounceMs = 400,
    excludeId,
  } = options ?? {};

  const [state, setState] = useState<SlugAvailability>({
    loading: false,
    available: null,
    suggestion: null,
    error: null,
  });

  const debounced = useDebounce(slugifyFinal((value || "").trim()), debounceMs);

  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, [debounced, value, checkUrl, excludeId]);

  useEffect(() => {
    const slugToCheck = debounced;

    if (!slugToCheck) {
      queueMicrotask(() => {
        if (activeRef.current) {
          setState({
            loading: false,
            available: null,
            suggestion: null,
            error: null,
          });
        }
      });
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const check = async () => {
      queueMicrotask(() => {
        if (activeRef.current) {
          setState((prev) => ({ ...prev, loading: true, error: null }));
        }
      });

      try {
        const params = new URLSearchParams({ slug: slugToCheck });
        if (excludeId) params.append("excludeId", excludeId);

        const resp = await fetch(`${checkUrl}?${params.toString()}`, {
          method: "GET",
          signal,
        });

        const result = (await resp.json()) as SlugAvailability;

        if (signal.aborted || !activeRef.current) return;

        if (result.available) {
          queueMicrotask(() => {
            if (activeRef.current) {
              setState({
                loading: false,
                available: true,
                suggestion: null,
                error: null,
              });
            }
          });
          return;
        }

        // Generate suggestion
        let counter = 2;
        let suggestion = `${slugToCheck}-${counter}`;

        while (true) {
          const params2 = new URLSearchParams({ slug: suggestion });
          if (excludeId) params2.append("excludeId", excludeId);

          const resp2 = await fetch(`${checkUrl}?${params2.toString()}`, {
            method: "GET",
            signal,
          });

          const data2 = (await resp2.json()) as SlugAvailability;

          if (signal.aborted || !activeRef.current) return;

          if (data2.available) break;

          counter++;
          suggestion = `${slugToCheck}-${counter}`;
        }

        queueMicrotask(() => {
          if (activeRef.current) {
            setState({
              loading: false,
              available: false,
              suggestion,
              error: null,
            });
          }
        });
      } catch (err) {
        if (signal.aborted || !activeRef.current) return;

        const message = err instanceof Error ? err.message : "Check failed";

        queueMicrotask(() => {
          if (activeRef.current) {
            setState({
              loading: false,
              available: null,
              suggestion: null,
              error: message,
            });
          }
        });
      }
    };

    void check();

    return () => controller.abort();
  }, [debounced, value, checkUrl, excludeId]);

  return state;
};
