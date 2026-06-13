import type { ImageUploadResponse } from "@/types";

export const uploaderApi = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const message =
        (await response.text().catch(() => null)) ?? "Upload failed";
      throw new Error(message);
    }

    return (await response.json()) as ImageUploadResponse;
  },
};
