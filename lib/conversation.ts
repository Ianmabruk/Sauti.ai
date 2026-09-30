"use client";

import type { SautiMode } from "./api";

/**
 * Local conversation bookkeeping.
 *
 * The backend has no "list my conversations" endpoint, so the ids of
 * conversations this browser started are kept locally. That is enough to give
 * follow-ups memory (the backend stores the transcript) and to let the History
 * screen fetch each transcript back.
 *
 * Everything here is browser-only and fails silently: a private-mode browser
 * with storage disabled should degrade to stateless chat, not crash it.
 */

const CONVERSATIONS_KEY = "sauti.conversations";
const ACTIVE_KEY = "sauti.active";
const USER_KEY = "sauti.user";

/** A conversation this browser has started. */
export type StoredConversation = {
  id: string;
  mode: SautiMode;
  /** First user message, used as the list title. */
  title: string;
  startedAt: string;
};

function readAll(): StoredConversation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is StoredConversation =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as StoredConversation).id === "string" &&
        typeof (entry as StoredConversation).title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(entries: StoredConversation[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked. Chat still works, just without history.
  }
}

/** Newest first. */
export function listConversations(): StoredConversation[] {
  return readAll().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/**
 * Record a conversation and make it the active one for its mode.
 * Re-recording an id is a no-op, so a continuing thread is not duplicated.
 */
export function rememberConversation(
  id: string,
  mode: SautiMode,
  title: string,
): void {
  const entries = readAll().filter((entry) => entry.id !== id);

  entries.push({
    id,
    mode,
    title: title.trim().slice(0, 120) || "New chat",
    startedAt: new Date().toISOString(),
  });

  // Keep the most recent 50 so storage cannot grow without bound.
  writeAll(entries.slice(-50));
  setActiveConversation(mode, id);
}

/** The conversation to continue when the next turn starts in this mode. */
export function getActiveConversation(mode: SautiMode): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(`${ACTIVE_KEY}.${mode}`);
  } catch {
    return null;
  }
}

export function setActiveConversation(
  mode: SautiMode,
  id: string | null,
): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${ACTIVE_KEY}.${mode}`;
    if (id === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, id);
  } catch {
    // Ignored: stateless fallback.
  }
}

/** Drop a conversation locally. The backend transcript is left untouched. */
export function forgetConversation(id: string): void {
  writeAll(readAll().filter((entry) => entry.id !== id));
}

/**
 * A stable per-browser id, used by the backend to scope saved items and
 * memory. Anonymous by design: no account is required.
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";

  try {
    const existing = window.localStorage.getItem(USER_KEY);
    if (existing) return existing;

    const created = `web-${crypto.randomUUID()}`;
    window.localStorage.setItem(USER_KEY, created);
    return created;
  } catch {
    return "anonymous";
  }
}