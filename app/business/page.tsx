"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { AnswerPanel, useAsk } from "@/components/AskSauti";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { ApiError, marketplaceSearch, saveItem } from "@/lib/api";
import type { Listing, MarketplaceSearchResponse } from "@/lib/api";
import { getUserId } from "@/lib/conversation";

/**
 * Business screen — real marketplace results for a product query.
 *
 * Two data sources, because they answer different questions: the marketplace
 * index gives exact listings with prices and vendors, while Sauti explains
 * what the user is actually shopping for. Both are live; nothing here is
 * seeded.
 */
const DEFAULT_QUERY = "BMW X5 for sale in Nairobi.";

export default function BusinessScreen() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [draft, setDraft] = useState(DEFAULT_QUERY);
  const [data, setData] = useState<MarketplaceSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const { state, ask } = useAsk("business");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    marketplaceSearch(query, controller.signal)
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load listings.",
        );
        setLoading(false);
      });

    void ask(query);

    return () => controller.abort();
  }, [query, ask]);

  const toggleSave = async (listing: Listing) => {
    setSaved((current) => ({ ...current, [listing.id]: true }));

    try {
      await saveItem({
        item_type: "product",
        item_id: listing.id,
        user_id: getUserId(),
      });
    } catch {
      // Optimistic: drop the marker again so the icon never lies.
      setSaved((current) => {
        const next = { ...current };
        delete next[listing.id];
        return next;
      });
    }
  };

  return (
    <div className="px-6 py-8">
      {/* ---------------------------------------------- the question */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim()) setQuery(draft.trim());
        }}
        role="search"
        className="mx-auto flex w-full max-w-[720px] items-center gap-3 rounded-pill border border-sauti-border bg-white px-5 shadow-card"
      >
        <input
          type="search"
          aria-label="Search the marketplace"
          placeholder="What are you looking to buy?"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-sauti-text outline-none placeholder:text-sauti-textMuted"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Search
        </Button>
      </form>

      {/* ---------------------------------------------- Sauti's take */}
      <div className="mx-auto mt-6 w-full max-w-[860px]">
        {state.status === "loading" ? (
          <LoadingState label="Thinking about your options" />
        ) : null}
        {state.status === "done" ? (
          <AnswerPanel answer={state.answer} />
        ) : null}
      </div>

      {/* ---------------------------------------------- listings */}
      <section className="mx-auto mt-8 w-full max-w-[1120px]">
        <h2 className="mb-3 text-[14px] font-bold text-sauti-text">
          Listings
          {data ? ` (${data.resultCount})` : ""}
        </h2>

        {loading ? <LoadingState label="Searching the marketplace" /> : null}
        {error ? <ErrorState message={error} /> : null}

        {data && data.results.length === 0 && !loading && !error ? (
          <EmptyState message={`No listings match "${data.query}".`} />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data?.results.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={Boolean(saved[listing.id])}
              onSave={() => void toggleSave(listing)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
