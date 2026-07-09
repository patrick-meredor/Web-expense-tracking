"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_CONFIGS, CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";
import { TransactionForm } from "@/components/transaction-form";
import { X, Search, Trash2, List } from "lucide-react";

type TransactionListProps = {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onSubmit?: (data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
  }) => Promise<void>;
  inline?: boolean;
};

const ITEMS_PER_PAGE = 3;

// Removed local helper mapping and date formatting functions.
// These are now imported from @/lib/constants and @/lib/format.

export function TransactionList({
  transactions,
  loading,
  onDelete,
  onSubmit,
  inline = false,
}: TransactionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col py-12 items-center justify-center">
        <p className="text-xs text-zinc-500 animate-pulse">Loading transaction ledger…</p>
      </div>
    );
  }

  // Filter based on search query and category chips
  const filteredTransactions = transactions.filter((tx) => {
    const matchesCategory = selectedCategory === "All" || tx.category === selectedCategory;
    const matchesSearch = 
      (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalEntries = filteredTransactions.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="relative flex flex-col justify-between min-h-[520px] pb-24">
      <div className="space-y-4 shrink-0">
        
        {/* Search Bar & Entries Count */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-zinc-900 bg-zinc-950/80 pl-10 pr-4 py-2 text-xs text-zinc-150 placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition duration-200 h-10"
            />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 self-end sm:self-center shrink-0">
            <span className="text-xs font-bold font-sans">
              {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
            </span>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500">
              <List className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition duration-150 cursor-pointer ${
              selectedCategory === "All"
                ? "bg-emerald-400 text-zinc-950 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition duration-150 cursor-pointer ${
                  isActive
                    ? CATEGORY_COLORS[cat] || "bg-emerald-400 text-zinc-950 border-emerald-400"
                    : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List Rows */}
      {paginatedTransactions.length > 0 ? (
        <ul className="mt-6 divide-y divide-zinc-900/60 border-t border-zinc-900/60 lg:min-h-0 lg:flex-1 overflow-x-hidden">
          {paginatedTransactions.map((tx) => {
            const isIncome = tx.amount >= 0;
            const config = CATEGORY_CONFIGS[tx.category] || CATEGORY_CONFIGS.Other;
            const IconComponent = config.icon;

            return (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 py-4 hover:bg-zinc-900/20 px-2.5 -mx-2.5 rounded-xl transition duration-150 border-b border-zinc-900/30"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Left: Circular Icon */}
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full border shrink-0 ${config.iconBg}`}>
                    <IconComponent className="h-4.5 w-4.5" />
                  </div>

                  {/* Details Block */}
                  <div className="min-w-0 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider border border-white/5 ${config.badgeStyle}`}>
                        {tx.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-zinc-100 truncate">
                      {tx.description || "Untitled Transaction"}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                      {formatDateTime(tx.date, tx.created_at)}
                    </span>
                  </div>
                </div>

                {/* Right Amount & Delete */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs sm:text-sm font-extrabold tracking-wide tabular-nums ${
                      isIncome ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </span>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(tx.id)}
                      aria-label="Delete transaction"
                      className="rounded-lg p-1.5 text-zinc-650 transition duration-150 hover:bg-zinc-950 hover:text-red-400 hover:cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900 py-12 px-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-zinc-700 mb-2 animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs font-bold text-zinc-500">
            {transactions.length === 0 ? "No transactions recorded yet" : "No matching transactions found"}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">
            {transactions.length === 0 ? "Use the floating + button to add a new transaction." : "Try adjusting your search query or category filters."}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4 shrink-0">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-400 transition duration-150 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Page <span className="text-zinc-300 font-black">{currentPage}</span> of{" "}
            <span className="text-zinc-300 font-black">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-400 transition duration-150 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) for adding transactions */}
      {onSubmit && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex flex-col items-center gap-1.5 z-40">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 w-10 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 flex items-center justify-center shadow-2xl transition duration-200 hover:scale-110 cursor-pointer border border-emerald-300/30"
            title="Add Expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="h-5 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      )}

      {/* Custom Transaction Form Modal Overlay */}
      {isAddModalOpen && onSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Add Transaction</h3>
            <p className="mt-1 text-xs text-zinc-505">Record a new income or expense to this wallet.</p>
            
            <div className="mt-4">
              <TransactionForm
                onSubmit={async (data) => {
                  await onSubmit(data);
                  setIsAddModalOpen(false);
                }}
                inline={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}