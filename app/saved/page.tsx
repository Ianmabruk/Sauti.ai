"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { ApiError, savedItems } from "@/lib/api";
import type { SavedProduct, SavedVendor } from "@/lib/api";
import { getUserId } from "@/lib/conversation";

/**
 * Saved — items the user bookmarked from the marketplace.
 *
 * Backed by the real saved-items store, scoped to the anonymous per-browser
 * id from `getUserId()`, so saves work without an account.
 */
export default function SavedScreen() {
  const [products, setProducts] = useState<SavedProduct[] | null>(null);
  const [vendors, setVendors] = useState<SavedVendor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    savedItems(getUserId(), controller.signal)
      .then((data) => {
        setProducts(data.products);
        setVendors(data.vendors);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load your saved items.",
        );
        setProducts([]);
      });

    return () => controller.abort();
  }, []);

  const total = (products?.length ?? 0) + vendors.length;

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-[20px] font-bold text-sauti-text">Saved</h1>

      <div className="mx-auto w-full max-w-[860px]">
        {error ? <ErrorState message={error} /> : null}
        {!products && !error ? <LoadingState label="Loading saved items" /> : null}

        {products && total === 0 ? (
          <EmptyState
            message="Nothing saved yet. Bookmark a listing from the Business screen."
            action={
              <Link
                href="/business"
                className="text-[13px] font-medium text-sauti-blue underline-offset-2 hover:underline"
              >
                Browse the marketplace
              </Link>
            }
          />
        ) : null}

        <div className="flex flex-col gap-3">
          {products?.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex items-start gap-3">
                <Bookmark
                  size={15}
                  className="mt-0.5 shrink-0 fill-sauti-blue text-sauti-blue"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-sauti-text">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-sauti-text">
                    {product.price ?? "Price on request"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-sauti-textMuted">
                    {[product.vendorName, product.location]
                      .filter(Boolean)
                      .join(" · ") || "No vendor recorded"}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {vendors.map((vendor) => (
            <Card key={vendor.id} className="p-4">
              <div className="flex items-start gap-3">
                <Bookmark
                  size={15}
                  className="mt-0.5 shrink-0 fill-sauti-blue text-sauti-blue"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-sauti-text">
                    {vendor.businessName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-sauti-textMuted">
                    {[vendor.location, vendor.isVerified ? "Verified" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}