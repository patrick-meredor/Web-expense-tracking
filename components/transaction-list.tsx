"use client";

import { CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type TransactionListProps = {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
};

export function TransactionList({
  transactions,
  loading,
  onDelete,
}: TransactionListProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
        <h2 className="text-lg font-semibold">Ledger</h2>
        <p className="mt-4 text-sm text-zinc-400">Loading transactions…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold lg:text-xl">Ledger</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {transactions.length === 0
            ? "No transactions yet."
            : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {transactions.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-800 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
          {transactions.map((tx) => {
            const isIncome = tx.amount >= 0;
            return (
              <li
                key={tx.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0 lg:items-center lg:py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[tx.category]}`}
                    >
                      {tx.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium lg:mt-0.5 lg:text-base">
                    {tx.description || "—"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-sm font-semibold tabular-nums lg:text-base ${
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
                      className="rounded p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
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
      )}
    </section>
  );
}
