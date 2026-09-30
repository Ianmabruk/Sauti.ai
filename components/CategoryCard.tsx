import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * CategoryCard — one dashboard tile that leads to a detail screen.
 *
 * The whole tile is the link target, so there is a single hit area and one
 * accessible name for the tile. `color` and `colorSoft` are Tailwind class
 * strings rather than raw colour values: the project builds its CSS at build
 * time from literal class names, and passing a class keeps the colours inside
 * the token vocabulary instead of introducing inline styles.
 */
export type CategoryCardProps = {
  /** Glyph drawn in the white icon tile. */
  icon: LucideIcon;
  title: string;
  description: string;
  /** Text colour, applied to the icon and the corner arrow. */
  color: string;
  /** Card background wash. */
  colorSoft: string;
  href: string;
};

export default function CategoryCard({
  icon: Icon,
  title,
  description,
  color,
  colorSoft,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col rounded-2xl p-6 transition-all",
          "hover:-translate-y-0.5 hover:shadow-cardHover",
          colorSoft,
        )}
      >
        <span
          className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
          aria-hidden="true"
        >
          <Icon size={22} className={color} />
        </span>

        <h3 className="text-[18px] font-bold text-sauti-text">{title}</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-sauti-textMuted">
          {description}
        </p>

        <ArrowRight
          size={18}
          className={cn("absolute bottom-5 right-5", color)}
          aria-hidden="true"
        />
      </Card>
    </Link>
  );
}