import { cn } from "@/lib/utils";
import type { Diet, DishType } from "@/lib/mock-data/types";

const DIET_STYLE: Record<Diet, string> = {
  Halal: "bg-[#1B5E20]/15 text-[#1B5E20] dark:text-[#A5D6A7]",
  Végan: "bg-[#558B2F]/15 text-[#558B2F] dark:text-[#C5E1A5]",
  "Sans gluten": "bg-[#E65100]/15 text-[#E65100] dark:text-[#FFCC80]",
  Casher: "bg-[#1565C0]/15 text-[#1565C0] dark:text-[#90CAF9]",
};

export function DietBadge({ diet, className }: { diet: Diet; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-medium uppercase tracking-wide",
        DIET_STYLE[diet],
        className,
      )}
    >
      {diet}
    </span>
  );
}

const DISH_STYLE: Record<DishType, string> = {
  "Entrée": "bg-info/15 text-info",
  "Plat": "bg-primary/15 text-primary",
  "Desserts": "bg-secondary/15 text-secondary",
  "Cocktail dinatoire": "bg-warning/20 text-[#A07A00] dark:text-warning",
};

export function DishTypeBadge({ dish, className }: { dish: DishType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-medium uppercase tracking-wide",
        DISH_STYLE[dish],
        className,
      )}
    >
      {dish}
    </span>
  );
}
