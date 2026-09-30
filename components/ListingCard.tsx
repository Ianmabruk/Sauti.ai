"use client";

import { Bookmark, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Listing } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * ListingCard — one marketplace product in the Business results.
 *
 * Badges are derived from the record's own flags rather than stored as
 * strings, so a listing cannot claim "Verified" when its vendor is not. The
 * save control is optimistic and the parent rolls the state back if the write
 * fails, so the icon never shows a save that did not happen.
 */
export default function ListingCard({
  listing,
  isSaved = false,
  onSave,
  className,
}: {
  listing: Listing;
  isSaved?: boolean;
  onSave?: () => void;
  className?: string;
}) {
  const image = listing.images[0];

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      {image ? (
        // Images are admin-uploaded media, so they are arbitrary URLs rather
        // than known local assets that next/image could optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={listing.name}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div
          className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-[12px] text-sauti-textMuted"
          aria-hidden="true"
        >
          No image
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-sauti-text">
            {listing.name}
          </h3>

          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              aria-label={
                isSaved ? `${listing.name} is saved` : `Save ${listing.name}`
              }
              aria-pressed={isSaved}
              className="shrink-0 rounded-full p-1 text-sauti-textMuted transition-colors hover:bg-sauti-surface hover:text-sauti-blue"
            >
              <Bookmark
                size={15}
                className={isSaved ? "fill-sauti-blue text-sauti-blue" : undefined}
              />
            </button>
          ) : null}
        </div>

        <p className="mt-2 text-[16px] font-bold text-sauti-text">
          {listing.price ?? "Price on request"}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-sauti-textMuted">
          {listing.location ? <span>{listing.location}</span> : null}
          {listing.category ? <span>{listing.category}</span> : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.isVendorVerified ? (
            <span className="rounded-pill bg-sauti-greenSoft px-2 py-0.5 text-[10px] font-medium text-sauti-green">
              Verified
            </span>
          ) : null}
          {listing.isFeatured ? (
            <span className="rounded-pill bg-sauti-blueSoft px-2 py-0.5 text-[10px] font-medium text-sauti-blue">
              Featured
            </span>
          ) : null}
          {listing.isAvailable ? (
            <span className="rounded-pill bg-sauti-blueSoft px-2 py-0.5 text-[10px] font-medium text-sauti-blue">
              In stock
            </span>
          ) : (
            <span className="rounded-pill bg-sauti-surface px-2 py-0.5 text-[10px] font-medium text-sauti-textMuted">
              Unavailable
            </span>
          )}
        </div>

        {listing.description ? (
          <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-sauti-textMuted">
            {listing.description}
          </p>
        ) : null}

        {listing.vendorName ? (
          <p className="mt-auto flex items-center gap-1 pt-4 text-[12px] text-sauti-textMuted">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            Sold by {listing.vendorName}
          </p>
        ) : null}
      </div>
    </Card>
  );
}