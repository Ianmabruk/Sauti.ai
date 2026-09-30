import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar — the circular user portrait in the sidebar and top bar.
 *
 * The image is optional: `AvatarFallback` derives initials from the name, so a
 * user with no avatar still renders a labelled circle rather than a broken
 * image. It is not decorative, so it is exposed to assistive tech as an image
 * with the name as its accessible label.
 */
function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sauti-surface",
        className,
      )}
      {...props}
    />
  );
}

/** Renders the portrait. Omit it entirely for users without an image. */
function AvatarImage({
  className,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Avatars come from
    // user-supplied remote URLs of unknown dimension, which the Image
    // component would require configuring a loader for.
    <img
      data-slot="avatar-image"
      alt={alt ?? ""}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

/** Initials placeholder shown whenever no portrait is available. */
function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center text-[12px] font-semibold text-sauti-textMuted",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };