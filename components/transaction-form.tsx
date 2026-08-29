"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import type { Category, Wallet } from "@/lib/types";

type TransactionFormProps = {
  onSubmit: (data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
    toWalletId?: number;
  }) => Promise<void>;
  inline?: boolean;
  wallets?: Wallet[];
  activeWalletId?: number | null;
};

export function TransactionForm({
  onSubmit,
  inline = false,
  wallets = [],
  activeWalletId = null,
}: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toWalletId, setToWalletId] = useState<number | undefined>(undefined);

  // Derive other wallets and effective toWalletId during render
  const otherWallets = wallets.filter((w) => w.id !== activeWalletId);
  const effectiveToWalletId = category === "Bank Transfer"
    ? (toWalletId && otherWallets.some((w) => w.id === toWalletId)
        ? toWalletId
        : otherWallets[0]?.id)
    : undefined;

  // Derive auto-description during render
  const targetWallet = effectiveToWalletId
    ? wallets.find((w) => w.id === effectiveToWalletId)
    : undefined;
  
  const isExpense = parseFloat(amount) < 0 || amount.startsWith("-");
  const autoDesc = category === "Bank Transfer" && targetWallet
    ? (isExpense
        ? `Transfer to ${targetWallet.name}`
        : `Received from ${targetWallet.name}`)
    : "";

  const displayedDescription = description || autoDesc;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed === 0) {
      setError("Enter a non-zero amount (+ income, − expense).");
      return;
    }

    if (category === "Bank Transfer" && wallets.length > 0) {
      if (otherWallets.length === 0) {
        setError("You need at least two wallets to perform a bank transfer.");
        return;
      }
      if (!effectiveToWalletId) {
        setError("Please select a target wallet for the transfer.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({ 
        amount: parsed, 
        description: displayedDescription, 
        category, 
        date, 
        toWalletId: effectiveToWalletId 
      });
      setAmount("");
      setDescription("");
      setCategory("Food");
      setDate(todayISO());
      setToWalletId(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  const formElement = (
    <form onSubmit={handleSubmit} className={inline ? "space-y-4" : "mt-5 space-y-4"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Amount</span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="-150 or 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
      </div>

      {category === "Bank Transfer" && (
        <div className="animate-fade-in space-y-1.5">
          {otherWallets.length > 0 ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {parseFloat(amount) >= 0 ? "Transfer From" : "Transfer To"}
              </span>
              <select
                value={effectiveToWalletId ?? ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setToWalletId(Number.isNaN(val) ? undefined : val);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
              >
                {otherWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="rounded-lg border border-amber-955 bg-amber-955/20 px-3.5 py-2.5 text-xs text-amber-400">
              You need to create at least one more wallet account to perform a bank transfer.
            </div>
          )}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</span>
        <input
          type="text"
          placeholder="Grocery, Coffee, Salary…"
          value={displayedDescription}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition duration-200"
        />
      </label>

      {error && (
        <div className="rounded-lg border border-red-950 bg-red-955/20 px-3.5 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300 transition duration-200 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:cursor-pointer"
      >
        {submitting ? "Adding…" : "Add Transaction"}
      </button>
    </form>
  );

  if (inline) {
    return formElement;
  }

  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-base font-bold text-zinc-100 tracking-tight">Quick Add</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Use positive amounts for income, negative for expenses.
      </p>
      {formElement}
    </section>
  );
}
