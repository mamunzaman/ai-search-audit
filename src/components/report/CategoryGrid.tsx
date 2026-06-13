import type { ReportCategory } from "@/lib/report-data";
import { CategoryCard } from "./CategoryCard";

type CategoryGridProps = {
  categories: ReportCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.title} category={category} />
      ))}
    </section>
  );
}
