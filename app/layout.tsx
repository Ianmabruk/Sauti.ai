import type { Metadata } from "next";
import type { ReactNode } from "react";
import MobileTabBar from "@/components/MobileTabBar";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import "./globals.css";

/**
 * Root layout — owns the shell every screen shares.
 *
 * The sidebar, top bar and mobile tab bar live here rather than in each page
 * so the five screens render identical chrome and navigation state cannot
 * drift between them. The sidebar is fixed, so the content column carries the
 * 240px offset itself; the extra bottom padding keeps content clear of the
 * tab bar on small screens.
 */
export const metadata: Metadata = {
  title: "SAUTI — Your AI, Your World",
  description:
    "Ask Sauti anything in English, Swahili, or French. Find answers, listings, study help and news.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col md:pl-[240px]">
            <TopBar />
            <main className="min-h-screen flex-1 pb-16 md:pb-0">{children}</main>
          </div>
        </div>

        <MobileTabBar />
      </body>
    </html>
  );
}