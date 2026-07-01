"use client";

import { useState } from "react";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import type { UpcomingExpense } from "@/lib/types";

type UpcomingExpensesProps = {
  upcomingExpenses: UpcomingExpense[];
  onAdd: (data: { name: string; details: string; amount: number; date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPay: (id: string) => Promise<void>;
  loading?: boolean;
  inline?: boolean;
};

export function UpcomingExpenses({
  upcomingExpenses,
  onAdd,
  onDelete,
  onPay,
  loading,
  inline = false,
}: UpcomingExpensesProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount (> 0).");
      return;
    }
    if (!name.trim()) {
      setError("Enter an expense name.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({ name, details, amount: parsed, date });
      setName("");
      setDetails("");
      setAmount("");
      setDate(todayISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add upcoming expense.");
    } finally {
      setSubmitting(false);
    }
  }

  function getDueStatus(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + "T00:00:00");
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: "Due today", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    } else if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return { label: `Overdue by ${absDays} day${absDays > 1 ? "s" : ""}`, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    } else {
      return { label: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`, color: "text-zinc-400 bg-zinc-950/40 border-zinc-900" };
    }
  }

  const content = (
    <div className={inline ? "w-full flex flex-col gap-4" : ""}>
      {!inline && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">Upcoming Expenses</h2>
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              {upcomingExpenses.length} note{upcomingExpenses.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Track expenses you need to pay soon. Mark them as paid to move to the ledger.
          </p>
        </>
      )}

      {/* List Section */}
      <div className={inline ? "space-y-3" : "mt-5 space-y-3"}>
        {loading ? (
          <p className="text-xs text-zinc-550 animate-pulse">Loading upcoming expenses…</p>
        ) : upcomingExpenses.length > 0 ? (
          <ul className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {upcomingExpenses.map((ue) => {
              const status = getDueStatus(ue.date);
              return (
                <li
                  key={ue.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-zinc-900 bg-zinc-950/30 p-3 rounded-xl hover:bg-zinc-950/50 transition duration-150"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] text-zinc-505 font-medium">
                        {formatDate(ue.date)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-zinc-200">
                      {ue.name}
                    </p>
                    {ue.details && (
                      <p className="text-xs text-zinc-450 truncate mt-0.5">
                        {ue.details}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-bold tracking-tight text-amber-500 tabular-nums">
                      {formatCurrency(ue.amount)}
                    </span>
                    <div className="flex gap-1">
                      {/* Pay Button */}
                      <button
                        type="button"
                        onClick={() => onPay(ue.id)}
                        title="Mark as paid (records transaction and deducts from wallet)"
                        className="rounded-lg p-1.5 text-zinc-450 transition duration-150 hover:bg-emerald-950/40 hover:text-emerald-400 hover:cursor-pointer flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.8-9.8a1 1 0 00-1.6-1.2L9 11.2 7.8 10a1 1 0 00-1.6 1.2l2 2a1 1 0 001.6 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDelete(ue.id)}
                        title="Delete note"
                        className="rounded-lg p-1.5 text-zinc-455 transition duration-150 hover:bg-zinc-900 hover:text-red-400 hover:cursor-pointer flex items-center justify-center"
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
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900 py-6 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-zinc-650 mb-1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a4.5 4.5 0 1 1 9.01 0c-.002.072-.007.143-.015.214m-9.01 0c.002.072.007.143.015.214m0 0zm-5.388 4.418a4.419 4.419 0 0 1 0-8.837m0 8.837a4.418 4.418 0 0 1 0-8.836"
              />
            </svg>
            <p className="text-xs font-semibold text-zinc-500">No upcoming expenses</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Use the form below to add a reminder</p>
          </div>
        )}
      </div>

      <hr className="my-5 border-zinc-900" />

      {/* Add Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-450">Name</span>
            <input
              type="text"
              placeholder="Electric bill, rent…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-450">Amount</span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="PHP 0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-450">Details (Optional)</span>
            <input
              type="text"
              placeholder="Account number, notes…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-455">Due Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-955 bg-red-955/20 px-3 py-2 text-[11px] text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300 transition duration-200 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:cursor-pointer"
        >
          {submitting ? "Adding Note…" : "Add Upcoming Expense"}
        </button>
      </form>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
      {content}
    </section>
  );
}
