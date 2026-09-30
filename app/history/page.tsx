"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { conversationHistory } from "@/lib/api";
import type { ConversationHistory } from "@/lib/api";
import { forgetConversation, listConversations } from "@/lib/conversation";
import type { StoredConversation } from "@/lib/conversation";

/**
 * History — conversations started in this browser.
 *
 * The backend stores each transcript but has no endpoint to list them, so the
 * ids are kept locally and the transcript is fetched back per conversation.
 * Deleting removes only the local reference; the stored transcript is left
 * alone rather than silently discarded.
 */
export default function HistoryScreen() {
  const [entries, setEntries] = useState<StoredConversation[] | null>(null);
  const [open, setOpen] = useState<{
    id: string;
    history: ConversationHistory | null;
  } | null>(null);

  useEffect(() => {
    setEntries(listConversations());
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setOpen({ id, history: null });

    try {
      const history = await conversationHistory(id);
      setOpen({ id, history });
    } catch {
      setOpen({ id, history: null });
    }
  }, []);

  if (entries && entries.length === 0) {
    return (
      <div className="px-6 py-8">
        <h1 className="mb-6 text-[20px] font-bold text-sauti-text">History</h1>
        <EmptyState
          message="Conversations you start will appear here."
          action={
            <Link
              href="/"
              className="text-[13px] font-medium text-sauti-blue underline-offset-2 hover:underline"
            >
              Ask something
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-[20px] font-bold text-sauti-text">History</h1>

      {!entries ? <LoadingState label="Loading your conversations" /> : null}

      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-2">
        {entries?.map((entry) => {
          const expanded = open?.id === entry.id;

          return (
            <div
              key={entry.id}
              className="rounded-card border border-sauti-border bg-white"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => void openConversation(entry.id)}
                  aria-expanded={expanded}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <MessageSquare size={16} className="shrink-0 text-sauti-textMuted" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-sauti-text">
                      {entry.title}
                    </span>
                    <span className="block text-[12px] text-sauti-textMuted">
                      {entry.mode} ·{" "}
                      {new Date(entry.startedAt).toLocaleString()}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  aria-label={`Forget conversation: ${entry.title}`}
                  onClick={() => {
                    forgetConversation(entry.id);
                    setEntries(listConversations());
                  }}
                  className="shrink-0 rounded-full p-2 text-sauti-textMuted transition-colors hover:bg-sauti-surface hover:text-sauti-orange"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {expanded ? (
                <div className="border-t border-sauti-border px-4 py-3">
                  {!open?.history ? (
                    <LoadingState label="Loading transcript" />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {open.history.messages.map((message) => (
                        <div key={message.id}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-sauti-textMuted">
                            {message.role}
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-sauti-text">
                            {message.content}
                          </p>
                        </div>
                      ))}

                      <Link href={`/internet?q=${encodeURIComponent(entries.find((e) => e.id === entry.id)?.title ?? "")}`}>
                        <Button type="button" variant="outline" size="sm">
                          Ask again
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}