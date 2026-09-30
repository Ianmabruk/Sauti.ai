import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — the surface primitive used by every panel in the app.
 *
 * It carries only the shared chrome: white fill, hairline border, `card`
 * radius and the `card` shadow. Sizing and padding stay with the caller, so
 * the same primitive backs both the compact weather card and the tall
 * category cards without a variant explosion.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-card border border-sauti-border bg-white shadow-card",
        className,
      )}
      {...props}
    />
  );
}

/** Top strip of a card, for an eyebrow or a heading row. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-[15px] font-semibold text-sauti-text", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[13px] text-sauti-textMuted", className)}
      {...props}
    />
  );
}

/** The card's body. Defaults to the `p-5` inset the specs use. */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-5", className)} {...props} />
  );
}

/** Bottom action strip. Pinned to the card floor with `mt-auto`. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};