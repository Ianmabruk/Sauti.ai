"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import NewsRow from "@/components/NewsRow";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { ApiError, newsArticles } from "@/lib/api";
import type { NewsArticle } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * News screen — the live feed.
 *
 * Topic pills are derived from the categories actually present in the feed,
 * not from the marketplace category list. The two are different taxonomies:
 * news is filed under editorial categories (`civic`, `agriculture`) that do
 * not exist in the marketplace, and most marketplace categories have no news
 * at all. Building pills from the articles means every pill is guaranteed to
 * return something.
 *
 * The whole feed is fetched once and filtered in memory, so switching topics
 * is instant and cannot flash a loading state.
 */

/** How many articles to request up front. */
const FEED_SIZE = 50;

/** Topics shown before the rest, regardless of how common they are. */
const PAGE_SIZE = 8;

function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function NewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    newsArticles(FEED_SIZE, null, controller.signal)
      .then((data) => setArticles(data.articles))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load the news feed.",
        );
        setArticles([]);
      });

    return () => controller.abort();
  }, []);

  /** Topics that actually have articles, most common first. */
  const topics = useMemo(() => {
    const counts = new Map<string, number>();

    for (const article of articles ?? []) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [articles]);

  const filtered = useMemo(
    () =>
      active === null
        ? (articles ?? [])
        : (articles ?? []).filter((a) => a.category === active),
    [articles, active],
  );

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div className="px-6 py-8">
      {/* ---------------------------------------------- topics */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="News topic">
        <TopicPill
          label="All"
          count={articles?.length ?? 0}
          active={active === null}
          onClick={() => {
            setActive(null);
            setVisible(PAGE_SIZE);
          }}
        />

        {topics.map(([slug, count]) => (
          <TopicPill
            key={slug}
            label={titleCase(slug)}
            count={count}
            active={active === slug}
            onClick={() => {
              setActive(slug);
              setVisible(PAGE_SIZE);
            }}
          />
        ))}
      </div>

      {/* ---------------------------------------------- feed */}
      <div className="mx-auto w-full max-w-[860px]">
        <div className="mt-6 flex items-baseline justify-between gap-3">
          <h1 className="text-[20px] font-bold text-sauti-text">Latest News</h1>
          <p className="text-[13px] text-sauti-textMuted">
            {filtered.length} article{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {!articles && !error ? <LoadingState label="Loading the news desk" /> : null}
          {error ? <ErrorState message={error} /> : null}

          {articles && filtered.length === 0 ? (
            <EmptyState
              message={
                active === null
                  ? "No articles have been published yet."
                  : `No articles in ${titleCase(active)}.`
              }
            />
          ) : null}

          {shown.map((article) => (
            <NewsRow key={article.id} article={article} />
          ))}
        </div>

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="mx-auto"
              onClick={() => setVisible((current) => current + PAGE_SIZE)}
            >
              Load more news
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TopicPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 rounded-pill border px-4 text-[13px] font-medium transition-colors",
        active
          ? "border-transparent bg-sauti-blue text-white"
          : "border-sauti-border bg-white text-sauti-textMuted hover:border-sauti-blue hover:text-sauti-blue",
      )}
    >
      {label}
      <span className="ml-1.5 opacity-60">{count}</span>
    </button>
  );
}