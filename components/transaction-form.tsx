"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import type { Category } from "@/lib/types";

type TransactionFormProps = {
  onSubmit: (data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
  }) => Promise<void>;
};

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed === 0) {
      setError("Enter a non-zero amount (+ income, − expense).");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ amount: parsed, description, category, date });
      setAmount("");
      setDescription("");
      setCategory("Food");
      setDate(todayISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Quick Add</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Use positive amounts for income, negative for expenses.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Amount</span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="-150 or 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <input
            type="text"
            placeholder="Grocery, Coffee, Salary…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add transaction"}
        </button>
      </form>
    </section>
  );
}
