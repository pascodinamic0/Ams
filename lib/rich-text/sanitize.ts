const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
]);

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return false;
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Strip HTML to plain text for validation and empty checks. */
export function richTextToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|h2|h3|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Allowlist sanitizer for teacher-authored lesson notes.
 * Strips scripts, styles, event handlers, and unsafe links.
 */
export function sanitizeLessonHtml(dirty: string): string {
  if (!dirty.trim()) return "";

  let html = dirty
    .replace(/<(script|style|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button)[^>]*\/?>/gi, "")
    .replace(/\s(on\w+|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    const isClosing = match.startsWith("</");
    if (tag === "br" || tag === "hr") return isClosing ? "" : `<${tag}>`;

    if (isClosing) return `</${tag}>`;

    if (tag === "a") {
      const hrefMatch =
        /href\s*=\s*"([^"]*)"/i.exec(attrs) ?? /href\s*=\s*'([^']*)'/i.exec(attrs);
      const href = hrefMatch?.[1]?.trim() ?? "";
      if (!isSafeHref(href)) return "";
      return `<a href="${escapeAttr(href)}" rel="noopener noreferrer" target="_blank">`;
    }

    return `<${tag}>`;
  });

  if (!html.includes("<p") && !html.includes("<h") && !html.includes("<ul") && !html.includes("<ol") && !html.includes("<blockquote")) {
    const text = richTextToPlainText(html);
    if (text) {
      return `<p>${escapeAttr(text)}</p>`;
    }
  }

  return html.trim();
}

export function wrapPlainTextAsHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeAttr(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function isRichTextEmpty(html: string): boolean {
  return richTextToPlainText(html).length === 0;
}
