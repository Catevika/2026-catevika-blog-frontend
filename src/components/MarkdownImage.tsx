import type { ComponentProps } from "react";

const MarkdownImage = ({ src, alt, ...props }: ComponentProps<"img">) => {
  // If the preview wrapper injects a blob URL, it will be a valid src.
  // If the markdown contains a placeholder (upload-1234), the preview wrapper
  // will already have replaced it with a real URL before this component renders.

  return (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-2 h-auto max-h-96 max-w-full rounded-md object-cover md:max-h-125"
      style={{
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      loading="lazy"
      decoding="async"
      {...props}
      onError={(e) => {
        // Hide broken images (e.g., if upload failed or URL invalid)
        e.currentTarget.style.display = "none";
      }}
    />
  );
};

export default MarkdownImage;
