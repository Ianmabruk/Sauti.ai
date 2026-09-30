"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiError, popularSearches } from "@/lib/api";
import type { PopularSearch } from "@/lib/api";
import { popularSearchesHeading } from "@/data/mock";

/**
 * PopularSearches — the suggested-query row under the category grid.
 *
 * The terms come from the backend's own search log rather than a fixed list,
 * so the suggestions reflect what people are actually asking. Clicking one
 * opens the Internet screen with that query, which then researches it.
 */
export default function PopularSearches() {
  const router = useRouter();
  const [searches, setSearches] = useState<PopularSearch[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    popularSearches(6, controller.signal)
      .then((data) => setSearches(data.searches))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 0) return;
        setFailed(true);
      });

    return () => controller.abort();
  }, []);

  if (failed || !searches || searches.length === 0) return null;

  return (
    <section className="px-6 pb-10">
      <h2 className="mb-3 text-[14px] font-medium text-sauti-textMuted">
        {popularSearchesHeading}
      </h2>

      <div className="flex flex-wrap gap-2">
        {searches.map((entry) => (
          <Button
            key={entry.query}
            type="button"
            variant="outline"
            className="h-9 px-4 text-[13px] font-normal"
            onClick={() =>
              router.push(`/internet?q=${encodeURIComponent(entry.query)}`)
            }
          >
            {entry.query}
          </Button>
        ))}
      </div>
    </section>
  );
}