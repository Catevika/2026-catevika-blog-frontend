// src/utils/createEmptyDraft.ts
import type { Post } from "@/types";

export const createEmptyDraft = (authorId?: string): Post => ({
  id: "",
  title: "",
  slug: "",
  locked: true,
  content: "",
  status: "draft",
  deleted: false,
  authorId: authorId ?? "",
  author: {
    id: authorId ?? "",
    name: "",
    email: "",
  },
  liked: false,
  likedBy: [],
  likeCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
