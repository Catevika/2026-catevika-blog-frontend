import { getCuratedPexels, searchPexels } from "@/lib/pexels";
import { usePexelsSearchStore } from "@/stores/pexelsStore";
import type { PexelsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
 
export const usePexelsSearch = (page = 1, perPage = 15) => {
  const query = usePexelsSearchStore((s) => s.query);

  return useQuery<PexelsResponse>({
    queryKey: ["pexels", query, page, perPage],
    queryFn: async () => {
      if (query.trim()) {
        return searchPexels(query, page, perPage);
      } else {
        return getCuratedPexels(page, perPage);
      }
    },
    enabled: !!import.meta.env.VITE_PEXELS_API_KEY,
    staleTime: 5 * 60 * 1000,
  });
};
