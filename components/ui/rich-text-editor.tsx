"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link2,
  Minus,
  RemoveFormatting,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { richTextToPlainText } from "@/lib/rich-text/sanitize";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

type Command =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "insertHorizontalRule"
  | "removeFormat"
  | "createLink";

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-stone-600 transition-colors dark:border-stone-700 dark:text-stone-300",
        active
          ? "border-stone-400 bg-stone-100 dark:border-stone-500 dark:bg-stone-800"
          : "border-transparent hover:bg-stone-100 dark:hover:bg-stone-800"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  minHeight = 220,
  className,
}: RichTextEditorProps) {
  const t = useTranslations("common");
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const isEmpty = richTextToPlainText(value).length === 0;

  const syncFromEditor = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
  }, [onChange]);

  const runCommand = useCallback(
    (command: Command, valueArg?: string) => {
      editorRef.current?.focus();
      const arg =
        command === "formatBlock" && valueArg && !valueArg.startsWith("<")
          ? `<${valueArg}>`
          : valueArg;
      document.execCommand(command, false, arg);
      syncFromEditor();
    },
    [syncFromEditor]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt(t("richTextLinkPrompt"));
    if (!url?.trim()) return;
    const href = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    runCommand("createLink", href);
  }, [runCommand, t]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white dark:border-stone-700 dark:bg-stone-900",
        focused && "ring-2 ring-stone-300 dark:ring-stone-600",
        className
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-stone-200 bg-stone-50 px-2 py-1.5 dark:border-stone-700 dark:bg-stone-800/60">
        <ToolbarButton label={t("richTextBold")} onClick={() => runCommand("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label={t("richTextItalic")} onClick={() => runCommand("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label={t("richTextUnderline")} onClick={() => runCommand("underline")}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-stone-200 dark:bg-stone-700" aria-hidden />
        <ToolbarButton
          label={t("richTextHeading2")}
          onClick={() => runCommand("formatBlock", "h2")}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("richTextHeading3")}
          onClick={() => runCommand("formatBlock", "h3")}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-stone-200 dark:bg-stone-700" aria-hidden />
        <ToolbarButton
          label={t("richTextBulletList")}
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("richTextNumberedList")}
          onClick={() => runCommand("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("richTextQuote")}
          onClick={() => runCommand("formatBlock", "blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label={t("richTextLink")} onClick={insertLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("richTextDivider")}
          onClick={() => runCommand("insertHorizontalRule")}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("richTextClearFormatting")}
          onClick={() => runCommand("removeFormat")}
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {isEmpty && !focused && placeholder && (
          <p className="pointer-events-none absolute left-3 top-3 text-sm text-stone-400">
            {placeholder}
          </p>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          className={cn(
            "prose prose-sm max-w-none px-3 py-3 text-sm text-stone-800 focus:outline-none dark:prose-invert dark:text-stone-100",
            "[&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-stone-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
            "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
            "[&_hr]:my-4 [&_hr]:border-stone-200 dark:[&_hr]:border-stone-700"
          )}
          style={{ minHeight }}
          onInput={syncFromEditor}
          onBlur={() => {
            setFocused(false);
            syncFromEditor();
          }}
          onFocus={() => setFocused(true)}
        />
      </div>
    </div>
  );
}
