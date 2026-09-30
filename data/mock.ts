import {
  Bookmark,
  Briefcase,
  Globe,
  GraduationCap,
  History,
  Home,
  Newspaper,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Static content for the app shell.
 *
 * Live content — answers, listings, articles, popular searches, languages —
 * comes from the backend through `lib/api.ts`. What remains here is the fixed
 * chrome that never changes: navigation, branding and the signed-in identity.
 * Nothing on this screen is a stand-in for real data any more.
 */

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

/** A dashboard tile leading to one of the four detail screens. */
export type Category = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Text colour, applied to the icon and the corner arrow. */
  color: string;
  /** Card background wash. */
  colorSoft: string;
  href: string;
};

export const categories: Category[] = [
  {
    icon: Globe,
    title: "Internet",
    description: "Ask anything and get answers pulled from the live web.",
    color: "text-sauti-blue",
    colorSoft: "bg-sauti-blueSoft",
    href: "/internet",
  },
  {
    icon: Briefcase,
    title: "Business",
    description: "Find products, prices and sellers you can trust.",
    color: "text-sauti-orange",
    colorSoft: "bg-sauti-orangeSoft",
    href: "/business",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Get clear explanations, study notes and revision help.",
    color: "text-sauti-green",
    colorSoft: "bg-sauti-greenSoft",
    href: "/education",
  },
  {
    icon: Newspaper,
    title: "News",
    description: "Catch up on Kenya, Africa and world headlines.",
    color: "text-sauti-purple",
    colorSoft: "bg-sauti-purpleSoft",
    href: "/news",
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

/** One row in the sidebar navigation. */
export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const primaryNavItems: NavItem[] = [
  { label: "Internet", icon: Globe, href: "/internet" },
  { label: "Business", icon: Briefcase, href: "/business" },
  { label: "Education", icon: GraduationCap, href: "/education" },
  { label: "News", icon: Newspaper, href: "/news" },
];

export const secondaryNavItems: NavItem[] = [
  { label: "History", icon: History, href: "/history" },
  { label: "Saved", icon: Bookmark, href: "/saved" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

/** Bottom navigation shown on small screens, where the sidebar is hidden. */
export type MobileTab = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const mobileTabs: MobileTab[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "History", icon: History, href: "/history" },
  { label: "Saved", icon: Bookmark, href: "/saved" },
];

/* ------------------------------------------------------------------ */
/* Chrome copy                                                         */
/* ------------------------------------------------------------------ */

/** Heading above the category grid. */
export const exploreHeading: string = "Explore";

/** Label above the suggested-query row. */
export const popularSearchesHeading: string = "Popular searches";

/** Placeholder for the persistent search field. */
export const searchPlaceholder: string = "Search...";

/** Drives the unread dot on the notification bell. */
export const hasUnreadNotifications: boolean = true;

/** Shown under the hero heading, and reused as the hero field's placeholder. */
export const heroSubtitle: string =
  "Ask Sauti anything in English, Swahili, or French...";

/* ------------------------------------------------------------------ */
/* Signed-in user                                                      */
/* ------------------------------------------------------------------ */

/** `avatar` is optional: without one the Avatar falls back to initials. */
export type User = {
  name: string;
  plan: string;
  avatar?: string;
};

export const user: User = {
  name: "John Doe",
  plan: "Premium Member",
};