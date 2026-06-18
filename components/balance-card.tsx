"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

type BalanceCardProps = {
  balance: number;
  onAdjust: (newBalance: number) => Promise<void>;
  loading?: boolean;
};

export function BalanceCard({ balance, onAdjust, loading }: BalanceCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;

    setSubmitting(true);
    try {
      await onAdjust(parsed);
      setValue("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
      <p className="text-sm font-medium text-emerald-100">Total Balance</p>
      <p className="mt-1 text-4xl font-bold tracking-tight lg:text-5xl">
        {loading ? "—" : formatCurrency(balance)}
      </p>

      <div className="mt-5">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            Set / adjust balance
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 lg:flex-row">
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 10000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border-0 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !value}
                className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 lg:flex-none"
              >
                {submitting ? "Saving…" : "Set"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
                className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
