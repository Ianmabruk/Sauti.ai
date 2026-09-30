import CategoryCard from "@/components/CategoryCard";
import Hero from "@/components/Hero";
import PopularSearches from "@/components/PopularSearches";
import { categories, exploreHeading } from "@/data/mock";

/**
 * Dashboard — the default screen.
 *
 * The sidebar, top bar and mobile tab bar come from the root layout, so this
 * page contributes only the dashboard body: the hero, the four category tiles
 * and the suggested-query row. Each tile's fields match CategoryCardProps
 * exactly, so the record is spread straight through.
 */
export default function DashboardPage() {
  return (
    <>
      <Hero />

      <section className="px-6">
        <h2 className="mb-4 mt-10 text-[20px] font-bold text-sauti-text">
          {exploreHeading}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.href} {...category} />
          ))}
        </div>
      </section>

      <PopularSearches />
    </>
  );
}