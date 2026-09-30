"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileTabs } from "@/data/mock";
import { cn } from "@/lib/utils";

/**
 * MobileTabBar — the small-screen navigation bar pinned to the bottom.
 *
 * Takes over from the sidebar below `md`, where there is no room for a rail.
 * Three destinations only: the full sidebar nav is not reachable from here, so
 * the bar deliberately carries the most-used routes rather than mirroring it.
 */
export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-3 border-t border-sauti-border bg-white md:hidden"
      aria-label="Primary"
    >
      {mobileTabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px]",
              active
                ? "text-sauti-blue"
                : "text-sauti-textMuted hover:text-sauti-blue",
            )}
          >
            <Icon size={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}