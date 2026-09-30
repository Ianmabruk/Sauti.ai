import * as React from "react";
import { cn } from "./utils";

/**
 * Minimal renderer for the markdown subset the model actually emits:
 * ATX headings, `-`/`*` bullets, `1.` numbered lists, `**bold**`, `*italic*`
 * and backtick code. Anything else is rendered as literal text.
 *
 * Text is turned into React elements, never HTML strings, so a reply
 * containing markup cannot inject markup into the page.
 */

type Block =
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const BULLET_RE = /^\s*[-*]\s+(.*)$/;
const ORDERED_RE = /^\s*(\d+)[.)]\s+(.*)$/;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: Math.min(4, Math.max(2, (heading[1] ?? "#").length)) as 2 | 3 | 4,
        text: heading[2] ?? "",
      });
      index += 1;
      continue;
    }

    const firstBullet = BULLET_RE.exec(line);
    const firstOrdered = ORDERED_RE.exec(line);

    if (firstBullet || firstOrdered) {
      const ordered = Boolean(firstOrdered);
      const items: string[] = [];

      // Consume only the run of consecutive list lines.
      while (index < lines.length) {
        const current = lines[index] ?? "";
        const bullet = BULLET_RE.exec(current);
        const numbered = ORDERED_RE.exec(current);

        if (ordered && numbered) items.push(numbered[2] ?? "");
        else if (!ordered && bullet) items.push(bullet[1] ?? "");
        else break;

        index += 1;
      }

      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    // Paragraph: every line until a blank line or a new block marker.
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (
        !current.trim() ||
        HEADING_RE.test(current) ||
        BULLET_RE.test(current) ||
        ORDERED_RE.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      index += 1;
    }

    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

/** Bold, italic and inline code, produced as elements rather than HTML. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const nodes: React.ReactNode[] = [];

  let cursor = 0;
  let match: RegExpExecArray | null;
  let counter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${counter}`;
    counter += 1;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-sauti-text">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-sauti-surface px-1 py-0.5 font-mono text-[13px]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return nodes;
}

/** Render a model reply as formatted blocks. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);

  if (blocks.length === 0) {
    return <p className={cn("text-[14px] text-sauti-textMuted", className)}>—</p>;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.kind === "heading") {
          const size =
            block.level === 2
              ? "text-[17px]"
              : block.level === 3
                ? "text-[15px]"
                : "text-[14px]";

          return (
            <p
              key={key}
              className={cn(
                "font-bold text-sauti-text",
                size,
                index === 0 ? "mt-0" : "mt-2",
              )}
            >
              {renderInline(block.text, key)}
            </p>
          );
        }

        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";

          return (
            <List
              key={key}
              className={cn(
                "flex flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-sauti-text",
                block.ordered ? "list-decimal" : "list-disc",
                "marker:text-sauti-textMuted",
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>
                  {renderInline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </List>
          );
        }

        return (
          <p
            key={key}
            className="text-[14px] leading-relaxed text-sauti-text"
          >
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Model answers are markdown; the query chip above them must not be. This
 * strips the same markers so the chip shows a single clean line.
 */
export function toPlainText(source: string): string {
  return source
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}