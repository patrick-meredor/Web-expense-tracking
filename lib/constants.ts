import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Food",
  "Bills",
  "Transport",
  "Income",
  "Other",
  "BankTransfer",
  "Shopping",
  "Travel",
  "Education",
  "Entertainment",
  "Health",
];

export const CATEGORY_COLORS = {
  Income: "bg-emerald-900/40 text-emerald-200 border-emerald-500/10",
  Bills: "bg-amber-900/40 text-amber-200 border-amber-500/10",
  Food: "bg-rose-900/40 text-rose-200 border-rose-500/10",
  Shopping: "bg-purple-900/40 text-purple-200 border-purple-500/10",
  Transport: "bg-violet-900/40 text-violet-200 border-violet-500/10",
  Travel: "bg-sky-900/40 text-sky-200 border-sky-500/10",
  Entertainment: "bg-pink-900/40 text-pink-200 border-pink-500/10",
  Health: "bg-cyan-900/40 text-cyan-200 border-cyan-500/10",
  Education: "bg-blue-900/40 text-blue-200 border-blue-500/10",
  BankTransfer: "bg-zinc-800/60 text-zinc-300 border-zinc-700/20",
  Other: "bg-zinc-900/40 text-zinc-400 border-zinc-800",
};
