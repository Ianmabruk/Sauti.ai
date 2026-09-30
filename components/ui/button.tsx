import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — the single interactive primitive for the whole app.
 *
 * Every variant and size is declared here so call sites only choose a name
 * (`variant="outlineBlue"`) instead of assembling utility strings. Colours
 * come from the `sauti.*` tokens; hover states use opacity modifiers so no
 * shade outside the token set is ever introduced.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sauti-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Solid brand fill. The primary call to action. */
        default: "bg-sauti-blue text-white hover:bg-sauti-blue/90",
        /** Tinted brand fill on the brand wash. */
        soft: "bg-sauti-blueSoft text-sauti-blue hover:bg-sauti-blueSoft/70",
        /** Neutral fill for secondary actions such as "Chat". */
        secondary: "bg-sauti-surface text-sauti-text hover:bg-sauti-surface/70",
        /** Neutral outline for low-emphasis actions. */
        outline:
          "border border-sauti-border bg-white text-sauti-text hover:bg-sauti-surface",
        /** Brand-coloured outline, for "View Details". */
        outlineBlue:
          "border border-sauti-blue bg-white text-sauti-blue hover:bg-sauti-blueSoft",
        /** No chrome until hovered. Icon-only toolbar buttons. */
        ghost: "text-sauti-textMuted hover:bg-sauti-surface hover:text-sauti-text",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-9 px-4 text-[14px]",
        /** Sidebar "New Chat". */
        lg: "h-11 px-5 text-[14px]",
        /** Square icon button, 36px. Top bar bell. */
        iconSm: "h-9 w-9 p-0",
        /** Square icon button, 40px. Hero send button. */
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };