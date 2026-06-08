import MarkdownImage from "@/components/MarkdownImage";
import MarkdownLink from "@/components/MarkdownLink";
import { useTheme } from "@/hooks/useTheme";
import type { PostContentProps } from "@/types";
import MarkdownPreview from "@uiw/react-markdown-preview/common";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";

const PostContent = ({ content }: PostContentProps) => {
  const { className: dataColorMode } = useTheme();

  return (
    <div
      id="post-content"
      className="prose-sm prose max-w-none rounded-md p-4 bg-background dark:bg-card"
      data-color-mode={dataColorMode}
    >
      <div className="p-2">
        <MarkdownPreview
          source={content}
          remarkPlugins={[
            remarkGfm,
            remarkMath,
            [
              remarkToc,
              {
                heading: "Table of Contents",
                maxDepth: 6,
                tight: true,
                ordered: true,
              },
            ],
          ]}
          rehypePlugins={[
            rehypeSlug,
            rehypeUnwrapImages,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: ["anchor-link"],
                },
              },
            ],
            rehypeKatex,
          ]}
          components={{
            img: MarkdownImage,
            a: MarkdownLink,
            pre({ children, ...props }) {
              return (
                <pre {...props}>
                  <code>{children}</code>
                </pre>
              );
            },

            code({
              className,
              children,
              ...props
            }: React.ComponentProps<"code">) {
              return (
                <code className={className ?? ""} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default PostContent;
