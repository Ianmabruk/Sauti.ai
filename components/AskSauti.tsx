"use client";

import { useCallback, useRef, useState } from "react";
import { DegradedNotice } from "@/components/ui/states";
import { RichText } from "@/lib/richText";
import { ApiError, sautiChat } from "@/lib/api";
import type { SautiChatResponse, SautiMode, SupportedLanguage } from "@/lib/api";
import {
  getActiveConversation,
  getUserId,
  rememberConversation,
  setActiveConversation,
} from "@/lib/conversation";

/**
 * The one place the app talks to the language model.
 *
 * Both the Internet and Education screens ask questions, so the request
 * lifecycle — loading, abort on unmount, degraded replies, conversation
 * threading and source collection — lives here rather than being duplicated.
 * `mode` is forwarded to the backend, which uses it as a soft routing bias.
 */
export type AskState =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | {
      status: "done";
      question: string;
      answer: SautiChatResponse;
    };

export function useAsk(mode: SautiMode) {
  const [state, setState] = useState<AskState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (question: string, language: SupportedLanguage = "auto") => {
      const trimmed = question.trim();
      if (!trimmed) return;

      // A second submit supersedes the first; drop the in-flight request so a
      // slow answer cannot overwrite a newer one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "loading", question: trimmed });

      try {
        const answer = await sautiChat(
          {
            message: trimmed,
            mode,
            language,
            user_id: getUserId(),
            conversation_id: getActiveConversation(mode),
          },
          controller.signal,
        );

        // "Start fresh" clears threading so the next question is independent.
        if (answer.conversation_id) {
          rememberConversation(answer.conversation_id, mode, trimmed);
        } else {
          setActiveConversation(mode, null);
        }

        setState({ status: "done", question: trimmed, answer });
      } catch (error) {
        if (controller.signal.aborted) return;

        const message =
          error instanceof ApiError
            ? error.message
            : "Something went wrong asking Sauti.";

        setState({
          status: "done",
          question: trimmed,
          answer: {
            message,
            response: message,
            language: "en",
            reply_language: "en",
            is_mixed: false,
            intent: "error",
            routedIntent: "error",
            confidence: 0,
            used_tools: [],
            tool_results: [],
            sources: [],
            activity: [],
            memory_used: [],
            conversation_id: null,
            request_id: "",
            engine: "",
            engine_ok: false,
            engine_error: message,
            degraded: true,
            offline_fallback: false,
            mode,
            duration_ms: 0,
          },
        });
      }
    },
    [mode],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setActiveConversation(mode, null);
    setState({ status: "idle" });
  }, [mode]);

  return { state, ask, reset };
}

/** The panel that displays a completed answer. */
export function AnswerPanel({ answer }: { answer: SautiChatResponse }) {
  return (
    <div className="flex flex-col gap-4">
      {answer.degraded ? (
        <DegradedNotice engine={answer.engine} reason={answer.engine_error} />
      ) : null}

      <div className="rounded-card border border-sauti-border bg-white p-6">
        <RichText text={answer.response} />
      </div>

      {answer.activity.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {answer.activity.map((step, index) => (
            <li
              key={`${step}-${index}`}
              className="rounded-pill bg-sauti-surface px-3 py-1 text-[11px] text-sauti-textMuted"
            >
              {step}
            </li>
          ))}
        </ul>
      ) : null}

      {answer.sources.length > 0 ? (
        <section>
          <h3 className="mb-2 text-[13px] font-bold text-sauti-text">Sources</h3>
          <ol className="flex flex-col gap-1.5">
            {answer.sources.map((source, index) => (
              <li key={`${source.url}-${index}`} className="text-[13px]">
                <span className="mr-1.5 text-sauti-textMuted">[{index + 1}]</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sauti-blue underline-offset-2 hover:underline"
                >
                  {source.title || source.domain || source.url}
                </a>
                {source.domain ? (
                  <span className="ml-2 text-[12px] text-sauti-textFaint">
                    {source.domain}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="text-[11px] text-sauti-textFaint">
        Answered by {answer.engine || "the assistant"}
        {answer.degraded ? "" : " · "}
        {!answer.degraded
          ? `${(answer.duration_ms / 1000).toFixed(1)}s`
          : ""}
      </p>
    </div>
  );
}