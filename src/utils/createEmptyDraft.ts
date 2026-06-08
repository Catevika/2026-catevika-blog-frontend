import type { SerializedPost } from "@/types";

export const createEmptyDraft = (userId?: string): SerializedPost => ({
  id: "",
  title: "",
  slug: "",
  locked: true,
  content: "",
  status: "draft",
  deleted: false,
  author: {
    id: userId ?? "",
    name: "",
    email: "",
  },
  liked: false,
  likedBy: [],
  likeCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
