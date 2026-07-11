import { 
  ArrowDownLeft, 
  FileText, 
  Bus, 
  Utensils, 
  ShoppingCart, 
  Landmark, 
  Plane, 
  GraduationCap, 
  Film, 
  Activity, 
  MoreHorizontal,
  type LucideIcon
} from "lucide-react";
import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Food",
  "Bills",
  "Transport",
  "Income",
  "Other",
  "Bank Transfer",
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
  "Bank Transfer": "bg-slate-800/60 text-slate-300 border-slate-700/20",
  Other: "bg-zinc-900/40 text-zinc-400 border-zinc-800",
};

export const CATEGORY_CONFIGS: Record<Category, {
  icon: LucideIcon;
  iconBg: string;
  badgeStyle: string;
}> = {
  Income: {
    icon: ArrowDownLeft,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Bills: {
    icon: FileText,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  Transport: {
    icon: Bus,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  Food: {
    icon: Utensils,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Shopping: {
    icon: ShoppingCart,
    iconBg: "bg-orange-500/10 border-orange-500/20",
    badgeStyle: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  "Bank Transfer": {
    icon: Landmark,
    iconBg: "bg-slate-500/10 border-slate-500/20",
    badgeStyle: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  Travel: {
    icon: Plane,
    iconBg: "bg-sky-500/10 border-sky-500/20",
    badgeStyle: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  Education: {
    icon: GraduationCap,
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    badgeStyle: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  Entertainment: {
    icon: Film,
    iconBg: "bg-pink-500/10 border-pink-500/20",
    badgeStyle: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
  Health: {
    icon: Activity,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    badgeStyle: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  Other: {
    icon: MoreHorizontal,
    iconBg: "bg-zinc-500/10 border-zinc-500/20",
    badgeStyle: "bg-zinc-500/10 text-zinc-450 border-zinc-500/20",
  },
};
