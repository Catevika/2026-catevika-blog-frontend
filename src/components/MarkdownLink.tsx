import type { MarkdownLinkProps } from "@/types";
import * as React from "react";

// Helpers — all SSR-safe
const hasWindow = typeof window !== "undefined";
const getCurrentHost = (): string => (hasWindow ? window.location.host : "");

/** Placeholder tokens like `upload-1234` */
const isUploadPlaceholder = (href?: string): boolean =>
  !!href && /^upload-[a-z0-9]/i.test(href);

// `#hash` links (in-page anchors)
const isHashLink = (href?: string): boolean => !!href && href.startsWith("#");

/** Relative paths like `/x`, `./x`, `../x` */
const isRelativePath = (href?: string): boolean =>
  !!href && /^(?:\/(?!\/)|\.{1,2}\/)/.test(href);

/** Protocol-relative: `//example.com` */
const isProtocolRelative = (href?: string): boolean =>
  !!href && href.startsWith("//");

/** Any scheme: `http:`, `https:`, `mailto:`, `tel:`, etc. */
const hasProtocol = (href?: string): boolean =>
  !!href && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href);

/**
 * Normalize the authored href so we never turn in-page or relative links
 * into external `https://...` by mistake.
 */
function normalizeHref(raw?: string): string | undefined {
  if (!raw) return raw;

  // 0) NEW: upload placeholders → keep exactly as-is
  if (isUploadPlaceholder(raw)) return raw;

  // 1) In-page hashes → keep as is
  if (isHashLink(raw)) return raw;

  // 2) Relative paths → keep as is
  if (isRelativePath(raw)) return raw;

  // 3) Protocol-relative `//host/path`
  if (isProtocolRelative(raw)) {
    const protocol = hasWindow ? window.location.protocol : "https:";
    return `${protocol}${raw}`;
  }

  // 4) Already has a protocol? Keep as is
  if (hasProtocol(raw)) return raw;

  // 5) Bare domains like `example.com` → make them HTTPS explicitly
  return `https://${raw}`;
}

// Decide if a link is an external HTTP(S) navigation to a different host.
function isExternalHttpLink(href?: string): boolean {
  if (!href) return false;

  // placeholders are never external
  if (isUploadPlaceholder(href)) return false;

  if (isHashLink(href) || isRelativePath(href)) return false;
  if (!hasProtocol(href) && !isProtocolRelative(href)) return false;

  const normalized = isProtocolRelative(href)
    ? hasWindow
      ? `${window.location.protocol}${href}`
      : `https:${href}`
    : href;

  try {
    const url = new URL(normalized);
    if (!/^https?:$/i.test(url.protocol)) return false;
    if (!hasWindow) return true;
    return url.host !== getCurrentHost();
  } catch {
    return false;
  }
}

const MarkdownLink = ({ children, href, ...props }: MarkdownLinkProps) => {
  const finalHref = normalizeHref(href);

  let target: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  let rel: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"];

  if (isExternalHttpLink(finalHref)) {
    target = "_blank";
    rel = "noopener noreferrer";
  }

  if (isHashLink(finalHref)) {
    target = undefined;
    rel = undefined;
  }

  return React.createElement(
    "a",
    { ...props, href: finalHref, target, rel },
    children,
  );
};

export default MarkdownLink;
