import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * NewsRow — one headline in the feed.
 *
 * Artwork is only rendered when the article actually has an image; the desk
 * publishes a lot of text-only pieces, and a grey placeholder next to every
 * headline is worse than no placeholder at all. The title clamps to two lines
 * so the feed's left edge stays even regardless of headline length.
 */

/** Maps a newsroom category to its accent pair, so pills match the brand. */
function badgeClass(category: string): string {
  switch (category) {
    case "agriculture":
      return "bg-sauti-greenSoft text-sauti-green";
    case "civic":
      return "bg-sauti-blueSoft text-sauti-blue";
    case "business":
      return "bg-sauti-orangeSoft text-sauti-orange";
    case "sports":
      return "bg-sauti-purpleSoft text-sauti-purple";
    default:
      return "bg-sauti-surface text-sauti-textMuted";
  }
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function NewsRow({ article }: { article: NewsArticle }) {
  const href = article.sourceUrl ?? undefined;
  const title = (
    <h3 className="line-clamp-2 text-[14px] font-medium leading-snug text-sauti-text">
      {article.title}
    </h3>
  );

  return (
    <article className="flex gap-3">
      {article.image ? (
        // Desk imagery is externally hosted, so the URL is not optimisable at
        // build time.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image}
          alt=""
          className="h-[60px] w-20 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div
          className="h-[60px] w-20 shrink-0 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"
          aria-hidden="true"
        />
      )}

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-block rounded-pill px-2 py-0.5 text-[10px] font-medium capitalize",
            badgeClass(article.category),
          )}
        >
          {article.category}
        </span>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 block hover:underline"
          >
            {title}
          </a>
        ) : (
          <div className="mt-2">{title}</div>
        )}

        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-sauti-textMuted">
          {article.source}
          <span aria-hidden="true">·</span>
          {timeAgo(article.publishedAt)}
          {href ? <ExternalLink size={11} aria-hidden="true" /> : null}
        </p>

        {article.summary ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-sauti-textMuted">
            {article.summary}
          </p>
        ) : null}
      </div>
    </article>
  );
}