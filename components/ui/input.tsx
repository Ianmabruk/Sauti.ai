import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — the bare text field behind the top bar search and the hero search.
 *
 * It has no border of its own by default: both spec'd search fields sit on the
 * `surface` token (or on white, when the caller passes a class), so chrome is
 * opt-in through `className` rather than baked in. Keeping it neutral lets the
 * same primitive serve the 40px top bar field and the 64px hero field.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "w-full bg-transparent text-[14px] text-sauti-text outline-none placeholder:text-sauti-textMuted disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };