"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasUnreadNotifications, searchPlaceholder, user } from "@/data/mock";

/**
 * TopBar — the persistent header above every screen.
 *
 * Holds the global search field, a notification bell and the account avatar.
 * The search is centred by a flexible spacer on its left rather than with
 * `justify-center`, so the right-hand cluster can grow without the field
 * drifting out of place.
 */

/** Up to two initials from a display name, for the avatar fallback. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export default function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-sauti-border bg-white px-6">
      {/* Flexible spacer centres the field against the full header width. */}
      <div className="flex flex-1 justify-center">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const question = query.trim();
            if (!question) return;
            router.push(`/internet?q=${encodeURIComponent(question)}`);
          }}
          className="relative w-full max-w-[600px]"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sauti-textMuted"
          />
          <Input
            type="search"
            aria-label="Search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded-full bg-sauti-surface pl-10"
          />
        </form>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          className="relative"
          aria-label={
            hasUnreadNotifications ? "Notifications, unread" : "Notifications"
          }
        >
          <Bell size={20} />
          {hasUnreadNotifications ? (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sauti-orange"
              aria-hidden="true"
            />
          ) : null}
        </Button>

        <Avatar className="h-8 w-8 border-2 border-sauti-border">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} />
          ) : (
            <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
}