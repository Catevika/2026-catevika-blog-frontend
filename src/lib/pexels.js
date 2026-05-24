import { createClient } from "pexels";
import { z } from "zod";

const PexelsSrcSchema = z.object({
  original: z.url(),
  large: z.url().optional(),
  medium: z.url().optional(),
});

export const PexelsPhotoSchema = z.object({
  id: z.number(),
  url: z.url(),
  alt: z.string().optional().default("Pexels photo"),
  photographer: z.string(),
  photographer_url: z.url(),
  src: PexelsSrcSchema,
});

const PexelsSearchResponseSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  // Treat these as optional because curated/search can differ
  total_results: z.number().optional(),
  total_pages: z.number().optional(),
  photos: z.array(PexelsPhotoSchema),
  next_page: z.string().optional(),
  prev_page: z.string().optional(),
});

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const client = createClient(API_KEY);

export async function searchPexels(query, page = 1, perPage = 15) {
  const data = await client.photos.search({
    query: query || "computer",
    page,
    per_page: perPage,
  });

  return PexelsSearchResponseSchema.parse(data);
}

export async function getCuratedPexels(page = 1, perPage = 15) {
  const data = await client.photos.curated({
    page,
    per_page: perPage,
  });

  return PexelsSearchResponseSchema.parse(data);
}
