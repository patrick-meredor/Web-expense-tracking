"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";

type TransactionListProps = {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  inline?: boolean;
};

// Define how many transactions to show per page
const ITEMS_PER_PAGE = 4;

export function TransactionList({
  transactions,
  loading,
  onDelete,
  inline = false,
}: TransactionListProps) {
  // 1. Setup active page and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  if (loading) {
    if (inline) {
      return (
        <div className="flex flex-col py-6">
          <p className="text-xs text-zinc-500 animate-pulse">Loading transactions…</p>
        </div>
      );
    }
    return (
      <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:flex lg:max-h-[calc(100vh-12rem)] lg:flex-col">
        <h2 className="text-base font-bold text-zinc-100 tracking-tight">Ledger</h2>
        <p className="mt-2 text-xs text-zinc-500 animate-pulse">Loading transactions…</p>
      </section>
    );
  }

  // 2. Pagination & Filtering Math
  const totalItems = transactions.length;
  
  const filteredTransactions = selectedCategory === "All"
    ? transactions
    : transactions.filter((tx) => tx.category === selectedCategory);

  const filteredCount = filteredTransactions.length;
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
  
  // Calculate index range for current page slicing
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Fallback adjustment if items are deleted/filtered and current page becomes empty
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const content = (
    <div className={`flex flex-col justify-between ${inline ? "h-full w-full" : ""}`}>
      <div className="shrink-0 pb-1">
        {!inline && (
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">Ledger</h2>
            {/* Mobile category filter dropdown */}
            <div className="sm:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as Category | "All");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {!inline && (
          <p className="mt-1 text-xs text-zinc-500">
            {selectedCategory === "All" ? (
              totalItems === 0
                ? "No transactions yet."
                : `${totalItems} transaction${totalItems === 1 ? "" : "s"} recorded`
            ) : (
              filteredCount === 0
                ? `No transactions in "${selectedCategory}".`
                : `${filteredCount} of ${totalItems} transaction${filteredCount === 1 ? "" : "s"} ("${selectedCategory}")`
            )}
          </p>
        )}

        {/* Desktop category filter pills - always visible in inline mode for filtering */}
        <div className={`flex flex-wrap gap-1.5 ${inline ? "mt-0" : "mt-4"}`}>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition duration-150 cursor-pointer ${
              selectedCategory === "All"
                ? "bg-emerald-950/40 text-emerald-200 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:bg-zinc-900/60 hover:text-zinc-300"
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
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition duration-150 cursor-pointer ${
                  isActive
                    ? `${CATEGORY_COLORS[cat]}`
                    : "bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:bg-zinc-900/60 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {paginatedTransactions.length > 0 ? (
        <ul className="mt-5 divide-y divide-zinc-900 lg:min-h-0 lg:flex-1 lg:overflow-y-auto overflow-x-hidden lg:pr-1 space-y-0.5">
          {paginatedTransactions.map((tx) => {
            const isIncome = tx.amount >= 0;
            return (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-zinc-900/30 px-3.5 -mx-3.5 rounded-xl transition duration-150"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-white/5 ${CATEGORY_COLORS[tx.category]}`}
                    >
                      {tx.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-zinc-200">
                    {tx.description || "Untitled Transaction"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`text-sm sm:text-base font-bold tracking-tight tabular-nums ${
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
                      className="rounded-lg p-1.5 text-zinc-500 transition duration-150 hover:bg-zinc-900 hover:text-red-400 hover:cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 5.75v.75H3.75a.75.75 0 000 1.5h.5v7.5A2.75 2.75 0 007 17.25h6a2.75 2.75 0 002.75-2.75v-7.5h.5a.75.75 0 000-1.5H14v-.75A2.75 2.75 0 0011.25 1h-3zm-1.5 4.5v-.75a1.25 1.25 0 011.25-1.25h3a1.25 1.25 0 011.25 1.25v.75H7.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900 py-12 px-4 text-center lg:flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-zinc-600 mb-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs font-semibold text-zinc-400">
            {totalItems === 0 ? "No transactions recorded yet" : `No transactions found in "${selectedCategory}"`}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">
            {totalItems === 0 ? "Add your first transaction." : "Try selecting another category."}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4 shrink-0">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition duration-150 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          
          <span className="text-xs text-zinc-500 font-medium tracking-tight">
            Page <span className="text-zinc-300 font-bold">{currentPage}</span> of{" "}
            <span className="text-zinc-300 font-bold">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-350 transition duration-150 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:flex lg:max-h-[calc(100vh-1rem)] lg:flex-col justify-between">
      {content}
    </section>
  );
}