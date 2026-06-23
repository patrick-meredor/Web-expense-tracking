"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Wallet } from "@/lib/types";

type BalanceCardProps = {
  activeWallet: Wallet | null;
  wallets: Wallet[];
  onSelectWallet: (id: number) => void;
  onAdjust: (newBalance: number) => Promise<void>;
  onCreateWallet?: (name: string, initialBalance: number) => Promise<void>;
  loading?: boolean;
};

export function BalanceCard({
  activeWallet,
  wallets,
  onSelectWallet,
  onAdjust,
  onCreateWallet,
  loading,
}: BalanceCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New wallet state
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [creatingWallet, setCreatingWallet] = useState(false);

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

  async function handleCreateWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newWalletName.trim() || !onCreateWallet) return;
    
    const parsedBalance = parseFloat(newWalletBalance) || 0;

    setCreatingWallet(true);
    try {
      await onCreateWallet(newWalletName.trim(), parsedBalance);
      setNewWalletName("");
      setNewWalletBalance("");
      setOpenNewWallet(false);
    } finally {
      setCreatingWallet(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 p-6 shadow-xl relative overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition duration-500" />
      
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
          {activeWallet ? `${activeWallet.name} Balance` : "Total Balance"}
        </p>

        {/* Wallet switching selector */}
        {wallets.length > 0 && activeWallet && (
          <div className="relative z-10">
            <select
              value={activeWallet.id}
              onChange={(e) => onSelectWallet(Number(e.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:border-emerald-500/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition duration-150"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-zinc-950 text-zinc-300">
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {loading ? (
          <span className="inline-block h-8 w-32 animate-pulse rounded bg-zinc-850" />
        ) : (
          formatCurrency(activeWallet?.balance ?? 0)
        )}
      </p>

      <div className="mt-6">
        {!open && !openNewWallet ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300 transition duration-200 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:cursor-pointer"
            >
              Adjust Balance
            </button>
            {onCreateWallet && (
              <button
                type="button"
                onClick={() => setOpenNewWallet(true)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-semibold text-zinc-400 transition duration-200 hover:bg-zinc-800 hover:text-zinc-200 hover:cursor-pointer"
              >
                + Add Account
              </button>
            )}
          </div>
        ) : open ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="New balance (e.g. 5000)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !value}
                className="flex-1 rounded-lg bg-emerald-450 hover:bg-emerald-555 px-4 py-2 text-xs font-bold text-zinc-950 transition duration-200 disabled:opacity-50 sm:flex-none hover:cursor-pointer"
              >
                {submitting ? "Saving…" : "Set"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition duration-200 hover:bg-zinc-800/40 hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateWalletSubmit} className="flex flex-col gap-2.5 w-full">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Account Name (e.g. Maya)"
                required
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                autoFocus
              />
              <input
                type="number"
                step="0.01"
                placeholder="Initial Balance"
                value={newWalletBalance}
                onChange={(e) => setNewWalletBalance(e.target.value)}
                className="min-w-0 sm:w-32 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creatingWallet || !newWalletName}
                className="flex-1 rounded-lg bg-emerald-450 hover:bg-emerald-555 px-4 py-2 text-xs font-bold text-zinc-950 transition duration-200 disabled:opacity-50 sm:flex-none hover:cursor-pointer"
              >
                {creatingWallet ? "Creating…" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenNewWallet(false);
                  setNewWalletName("");
                  setNewWalletBalance("");
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition duration-200 hover:bg-zinc-800/40 hover:cursor-pointer"
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
