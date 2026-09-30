"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { primaryNavItems, secondaryNavItems, user } from "@/data/mock";
import type { NavItem as NavItemData } from "@/data/mock";
import { cn } from "@/lib/utils";

/**
 * Sidebar — the persistent left navigation rail.
 *
 * Fixed to the viewport at 240px and hidden below `md`, where MobileTabBar
 * takes over. Order is deliberate: identity, then the single primary action,
 * then destinations, then the account block pinned to the bottom.
 */

/**
 * The crown that precedes the plan name.
 *
 * Drawn inline because the icon set for this app does not include one, and the
 * alternative was pulling in an icon outside the agreed list for a 10px mark.
 */
function CrownMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={10}
      height={10}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20 8 8l4 3 4-3-3 12Z" />
      <path d="M2 20h20" />
    </svg>
  );
}

/** Up to two initials from a display name, for the avatar fallback. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/** One navigation row. Active state is filled, inactive is muted. */
function SidebarNavItem({
  item,
  active,
}: {
  item: NavItemData;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition-colors",
        active
          ? "bg-sauti-surface text-sauti-text"
          : "text-sauti-textMuted hover:bg-sauti-surface",
      )}
    >
      <Icon size={18} className="shrink-0" />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col border-r border-sauti-border bg-sauti-bg md:flex"
      aria-label="Main navigation"
    >
      {/* ---------------------------------------------- logo */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sauti-orange to-sauti-blue text-[18px] font-bold text-white"
            aria-hidden="true"
          >
            S
          </div>
          <div className="min-w-0">
            <p className="text-[22px] font-bold leading-none tracking-tight text-sauti-text">
              SAUTI
            </p>
            <p className="mt-1 text-[11px] text-sauti-textFaint">
              Your AI, Your World
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------- primary action */}
      <div className="mb-6 px-4">
        <Button
          type="button"
          variant="soft"
          size="lg"
          className="w-full justify-start"
        >
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      {/* ---------------------------------------------- primary nav */}
      <nav className="flex flex-col gap-1 px-2" aria-label="Categories">
        {primaryNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      <div className="mx-4 my-3 border-t border-sauti-border" />

      {/* ---------------------------------------------- secondary nav */}
      <nav className="flex flex-col gap-1 px-2" aria-label="Account">
        {secondaryNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Pushes the account block to the bottom of the rail. */}
      <div className="flex-1" />

      {/* ---------------------------------------------- account */}
      <div className="border-t border-sauti-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-sauti-text">
              {user.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-sauti-textFaint">
              <CrownMark />
              {user.plan}
            </p>
          </div>

          <ChevronDown size={16} className="shrink-0 text-sauti-textMuted" />
        </div>
      </div>
    </aside>
  );
}