"use client";

import { useState } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type TransactionListProps = {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
};

// Define how many transactions to show per page
const ITEMS_PER_PAGE = 5;

export function TransactionList({
  transactions,
  loading,
  onDelete,
}: TransactionListProps) {
  // 1. Setup active page state
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:flex lg:max-h-[calc(100vh-12rem)] lg:flex-col">
        <h2 className="text-base font-bold text-zinc-100 tracking-tight">Ledger</h2>
        <p className="mt-2 text-xs text-zinc-500 animate-pulse">Loading transactions…</p>
      </section>
    );
  }

  // 2. Pagination Math
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Calculate index range for current page slicing
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Fallback adjustment if items are deleted and current page becomes empty
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:flex lg:max-h-[calc(100vh-12rem)] lg:flex-col justify-between">
      <div>
        <div className="shrink-0 pb-1">
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">Ledger</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {totalItems === 0
              ? "No transactions yet."
              : `${totalItems} transaction${totalItems === 1 ? "" : "s"} recorded`}
          </p>
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
        ) : null}
      </div>

      {/* 3. Pagination Controls UI */}
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
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition duration-150 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}