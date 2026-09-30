"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnswerPanel, useAsk } from "@/components/AskSauti";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";

/**
 * Internet screen — live answers grounded in web research.
 *
 * The question arrives in the URL from the Hero and the popular-search pills,
 * so a shared link reproduces the same answer. Asks use `mode: "internet"`,
 * which lets the backend route to its web search and reader tools.
 */
export default function InternetScreen() {
  return (
    <Suspense fallback={<LoadingState label="Loading" />}>
      <InternetScreenInner />
    </Suspense>
  );
}

const FOLLOW_UPS = [
  "Hourly forecast",
  "7-day forecast",
  "Weather map",
] as const;

function InternetScreenInner() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const [draft, setDraft] = useState(query);
  const { state, ask, reset } = useAsk("internet");

  // Ask as soon as the screen has a question, including on a direct visit.
  useEffect(() => {
    if (query.trim()) void ask(query);
  }, [query, ask]);

  return (
    <div className="px-6 py-8">
      {/* ---------------------------------------------- the question */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
        role="search"
        className="mx-auto flex w-full max-w-[720px] items-center gap-3 rounded-pill border border-sauti-border bg-white px-5 shadow-card"
      >
        <Input
          type="search"
          aria-label="Ask a question"
          placeholder="Ask Sauti anything..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="text-[15px]"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Ask
        </Button>
      </form>

      <div className="mx-auto mt-6 w-full max-w-[860px]">
        {state.status === "idle" ? (
          <EmptyState message="Ask a question and Sauti will research it for you." />
        ) : null}

        {state.status === "loading" ? (
          <LoadingState label={`Researching "${state.question}"`} />
        ) : null}

        {state.status === "done" ? (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-sauti-textMuted">
              You asked:{" "}
              <span className="font-medium text-sauti-text">
                {state.question}
              </span>
            </p>

            <AnswerPanel answer={state.answer} />

            {/* ------------------------------------ follow-ups */}
            <section>
              <h2 className="mb-3 text-[13px] font-bold text-sauti-text">
                Related info
              </h2>
              <div className="flex flex-wrap gap-2">
                {FOLLOW_UPS.map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    className="h-9 px-4 text-[13px] font-normal"
                    onClick={() => {
                      const next = `${state.question} — ${label.toLowerCase()}`;
                      setDraft(next);
                      void ask(next);
                    }}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-4 text-[13px]"
                  onClick={reset}
                >
                  Clear
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}