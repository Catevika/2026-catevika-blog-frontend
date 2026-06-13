import { uploaderApi } from "@/api/uploaderApi";
import { Button } from "@/components/ui/button";
import type { ImageUploaderProps } from "@/types";
import type React from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { TbPhoto } from "react-icons/tb";

// Unique placeholder ID (kept for drag placeholder generation)
function makePlaceholderId() {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onEnlarge,
  onInsert,
  maxSizeMB = 5,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadingRef = useRef(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      const mime = (file.type || "").toLowerCase();
      if (!mime.startsWith("image/"))
        return "Only JPG, JPEG and PNG images allowed";
      if (!(mime === "image/jpeg" || mime === "image/png"))
        return "Only JPG, JPEG and PNG images allowed";
      if (file.size > maxSizeMB * 1024 * 1024)
        return `Max ${maxSizeMB}MB file size exceeded`;
      return null;
    },
    [maxSizeMB],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Keep file globally so PostEditForm can upload it on drop
      window.__draggedImageFile = file;

      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch {
          // not used
        }
      }

      const blobUrl = URL.createObjectURL(file);
      setPreview(blobUrl);
      setSelectedFile(file);
      setError(null);
    },
    [preview, validateFile],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {
      // not used
    }
  }, []);

  // Drag from sidebar → set dragged file and provide a markdown placeholder (editor will upload on drop)
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (!selectedFile) return;

      const id = makePlaceholderId();
      const placeholder = `image:${id}`;
      const filename = selectedFile.name.split(".")[0] || "image";
      const markdown = `![${filename}](${placeholder})`;

      try {
        e.dataTransfer.setData("text/plain", markdown);
        e.dataTransfer.effectAllowed = "copy";
      } catch {
        // not used
      }

      // Keep the file available for the drop target to pick up and upload
      window.__draggedImageFile = selectedFile;
    },
    [selectedFile],
  );

  // Insert button → upload file first, then call onInsert with real markdown
  const insertUploadAndInsert = useCallback(async () => {
    if (!selectedFile || !onInsert) return;

    // Prevent double uploads
    if (uploadingRef.current) return;
    uploadingRef.current = true;

    try {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Upload via uploaderApi
      const resp = await uploaderApi.uploadImage(selectedFile);

      if (resp?.success && resp.data?.url) {
        let finalUrl = resp.data.url;
        // Make absolute so editor preview is unambiguous
        if (finalUrl.startsWith("/")) {
          finalUrl = `${window.location.origin}${finalUrl}`;
        }

        const filename = selectedFile.name.split(".")[0] || "image";
        const markdown = `![${filename}](${finalUrl})`;

        // Call the provided onInsert handler with the real markdown
        onInsert(markdown);
      } else {
        setError("Upload succeeded but no URL returned");
        console.error("upload response", resp);
      }
    } catch (err) {
      console.error("Upload failed", err);
      setError("Upload failed. Try again.");
    } finally {
      uploadingRef.current = false;
    }
  }, [selectedFile, onInsert, validateFile]);

  const reset = useCallback(() => {
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {
        // not used
      }
    }
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.__draggedImageFile = undefined;
  }, [preview]);

  return (
    <section>
      {preview ? (
        <article className="photo-card" aria-label="Image preview">
          <button
            type="button"
            className="photo-card-image"
            onClick={() => onEnlarge?.(preview)}
            onDragStart={handleDragStart}
            draggable
            aria-label="Drag to editor or click to enlarge"
          >
            <img src={preview} alt="Preview" loading="lazy" />
          </button>

          <div className="mb-1 flex justify-between px-1 py-0">
            <Button type="button" variant="destructive" onClick={reset}>
              Reset
            </Button>

            {/* Prefer uploadThenInsert so the editor receives a real URL */}
            <Button type="button" onClick={() => void insertUploadAndInsert()}>
              Insert
            </Button>
          </div>
        </article>
      ) : (
        <button
          type="button"
          className="hover:border-primary flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 p-2"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <TbPhoto size={24} />
          <span className="mt-2 text-sm font-medium">
            Upload JPG, JPEG or PNG
          </span>
          <p className="text-xs text-gray-500">
            Drag to editor or click Insert
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
        </button>
      )}

      {error && (
        <div className="form-error mt-2" role="alert">
          {error}
        </div>
      )}
    </section>
  );
};

export default ImageUploader;
