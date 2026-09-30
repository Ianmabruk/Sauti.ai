import * as React from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Loading, error and empty placeholders.
 *
 * Every screen that talks to the backend needs the same three states, and
 * getting them right is what makes a slow or failed request read as deliberate
 * rather than broken.
 */

/** Shown while a request is in flight. */
export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-10 text-[13px] text-sauti-textMuted"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

/**
 * Shown when a request failed. Carries the backend's own message where there
 * is one, so a provider outage is distinguishable from a network problem.
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-card border border-sauti-border bg-sauti-surface px-6 py-8 text-center"
      role="alert"
    >
      <AlertCircle size={20} className="text-sauti-orange" />
      <p className="max-w-[46ch] text-[13px] text-sauti-textMuted">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/** Shown when a request succeeded but returned nothing. */
export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-sauti-border px-6 py-10 text-center">
      <Inbox size={20} className="text-sauti-textMuted" />
      <p className="max-w-[46ch] text-[13px] text-sauti-textMuted">{message}</p>
      {action}
    </div>
  );
}

/**
 * A degraded answer — the engine failed and this is the canned apology.
 * Rendered distinctly so a provider outage is never mistaken for a real reply.
 */
export function DegradedNotice({
  engine,
  reason,
}: {
  engine: string;
  reason: string;
}) {
  return (
    <div
      className="flex items-start gap-2 rounded-card border border-sauti-orange/30 bg-sauti-orangeSoft px-4 py-3 text-[12px] text-sauti-text"
      role="status"
    >
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-sauti-orange" />
      <span>
        <strong className="font-semibold">
          {engine.toUpperCase()} did not answer this one.
        </strong>{" "}
        {reason || "The reply below is a fallback message, not a live result."}
      </span>
    </div>
  );
}