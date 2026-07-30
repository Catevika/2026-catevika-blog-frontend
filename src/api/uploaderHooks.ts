import { uploaderApi } from "@/api/uploaderApi";
import type { ImageUploadResponse, UseImageUploadProps } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useImageUpload = ({
  onSuccess,
  onError,
}: UseImageUploadProps = {}) => {
  const queryClient = useQueryClient();

  const retry = (failureCount: number, error: Error) => {
    if (error.message.includes("400") || error.message.includes("413")) {
      return false;
    }

    return failureCount < 1;
  };

  const mutation = useMutation<ImageUploadResponse, Error, File>({
    mutationFn: uploaderApi.uploadImage,
    onSuccess: async (data: ImageUploadResponse) => {
      if (data.success && data.data?.url) {
        const {
          url: imageUrl,
          filename: fileName = imageUrl.split("/").pop() ?? "image",
          duplicate,
        } = data.data;

        if (duplicate) {
          console.log("🎯 Using existing image:", fileName);
        }

        onSuccess?.(imageUrl, fileName);
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    },
    onError: (error: Error) => {
      console.error("Image upload failed:", error.message);
      onError?.();
    },
    retry,
  });

  return {
    ...mutation,
    retry,
  };
};
