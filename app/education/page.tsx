"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnswerPanel, useAsk } from "@/components/AskSauti";
import { EmptyState, LoadingState } from "@/components/ui/states";
import type { SupportedLanguage } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Education screen — a plain-language explanation at a chosen level.
 *
 * The level pills do not just restyle: each one is sent to the backend as the
 * reply language and as a framing instruction, so asking at "Ages 5-10" gets a
 * genuinely simpler answer rather than the same text in a different style.
 */

const LEVELS: Array<{ label: string; language: SupportedLanguage }> = [
  { label: "Ages 5-10", language: "en" },
  { label: "Ages 11-14", language: "en" },
  { label: "Ages 15-18", language: "en" },
  { label: "University", language: "en" },
  { label: "Professional", language: "en" },
  { label: "Kiswahili", language: "sw" },
];

const DEFAULT_QUESTION = "Explain photosynthesis to me";

export default function EducationScreen() {
  const [level, setLevel] = useState(0);
  const [draft, setDraft] = useState(DEFAULT_QUESTION);
  const { state, ask, reset } = useAsk("education");

  const chosen = LEVELS[level] ?? LEVELS[0];

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    // The level is part of the instruction, so the model re-frames its answer
    // instead of returning the same explanation at a different reading level.
    void ask(
      chosen?.language === "sw"
        ? `${trimmed} — eleza kwa Kiswahili rahisi.`
        : `${trimmed} — explain for ${chosen?.label ?? "a general audience"}.`,
      chosen?.language ?? "auto",
    );
  };

  return (
    <div className="px-6 py-8">
      {/* ---------------------------------------------- level */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Audience level"
      >
        {LEVELS.map((option, index) => {
          const active = index === level;

          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setLevel(index);
                // Re-ask at the new level so the change is visible at once.
                if (state.status === "done") submit(draft);
              }}
              className={cn(
                "h-9 rounded-pill border px-4 text-[13px] font-medium transition-colors",
                active
                  ? "border-sauti-green bg-sauti-greenSoft text-sauti-green"
                  : "border-sauti-border bg-white text-sauti-textMuted hover:border-sauti-green hover:text-sauti-green",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------- the question */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
        className="mx-auto mt-6 flex w-full max-w-[720px] items-center gap-3 rounded-pill border border-sauti-border bg-white px-5 shadow-card"
      >
        <Input
          type="search"
          aria-label="Ask for an explanation"
          placeholder="What would you like explained?"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="text-[15px]"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Explain
        </Button>
      </form>

      {/* ---------------------------------------------- the answer */}
      <div className="mx-auto mt-6 w-full max-w-[860px]">
        {state.status === "idle" ? (
          <EmptyState message="Pick a level and ask a question to begin." />
        ) : null}

        {state.status === "loading" ? (
          <LoadingState label="Writing an explanation" />
        ) : null}

        {state.status === "done" ? (
          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <Leaf size={20} className="text-sauti-green" />
                <h2 className="text-[18px] font-bold text-sauti-text">
                  {state.question.replace(/ — explain for .*$/, "")}
                </h2>
              </div>

              <AnswerPanel answer={state.answer} />
            </Card>

            <div className="flex justify-center">
              <Button type="button" variant="ghost" onClick={reset}>
                Start a new explanation
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}