import type { ComponentProps } from "react";

const MarkdownImage = ({ src, alt, ...props }: ComponentProps<"img">) => {
  let finalSrc = src;

  if (
    src &&
    src.includes("res.cloudinary.com") &&
    src.includes("/image/upload/")
  ) {
    finalSrc = src.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }

  return (
    <img
      src={finalSrc}
      alt={alt ?? ""}
      className="my-2 h-auto max-h-50 max-w-full rounded-md object-cover md:max-h-100"
      style={{
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      loading="eager"
      decoding="async"
      {...props}
      onError={(e) => {
        console.warn(`MarkdownImage failed to load asset resource: ${src}`);
        e.currentTarget.style.display = "none";
      }}
    />
  );
};

export default MarkdownImage;
