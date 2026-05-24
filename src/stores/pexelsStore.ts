import type { PexelsSearchState } from "@/types";
import { create } from "zustand";

export const usePexelsSearchStore = create<PexelsSearchState>()((set) => ({
  query: "",
  page: 1,
  perPage: 10,

  setQuery: (newQuery) =>
    set(() => ({
      query: newQuery,
      page: 1,
    })),

  setPage: (newPage) => set({ page: newPage }),
}));
