import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import { sanitizeOptions } from "@/utils/rehypeSanitizeOptions";

describe("KaTeX markdown rendering", () => {
  it("renders inline and display equations after sanitizing the source", () => {
    const content = "Inline $x^2$\n\n$$\nx^2\n$$";
    const html = String(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeSanitize, sanitizeOptions)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(content),
    );

    expect(html).toContain("Inline <span class=\"katex\">");
    expect(html).toContain("<span class=\"katex-display\">");
  });
});
