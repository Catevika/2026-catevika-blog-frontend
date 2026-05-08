import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { useTheme } from "@/hooks/useTheme";
import type { PostContentProps } from "@/types";
import MarkdownImage from "@/components/MarkdownImage";
import MarkdownLink from "@/components/MarkdownLink";
import { CardContent } from "@/components/ui/card";

const PostContent = ({
  content,
  className = "prose-sm prose max-w-none",
}: PostContentProps) => {
  const { className: themeClassName, dataColorMode } = useTheme();

  return (
    <CardContent
      id="post-content"
      className={`${className} ${themeClassName}`}
      data-color-mode={dataColorMode}
    >
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
    </CardContent>
  );
};

export default PostContent;
