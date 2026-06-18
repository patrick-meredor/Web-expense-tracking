import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Food",
  "Bills",
  "Transport",
  "Income",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "bg-amber-900/40 text-amber-200",
  Bills: "bg-blue-900/40 text-blue-200",
  Transport: "bg-violet-900/40 text-violet-200",
  Income: "bg-emerald-900/40 text-emerald-200",
  Other: "bg-gray-900/40 text-gray-200",
};
