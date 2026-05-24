import type { ImageUploadResponse } from "@/types";

export const uploaderApi = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json() as Promise<ImageUploadResponse>;
  },
};
