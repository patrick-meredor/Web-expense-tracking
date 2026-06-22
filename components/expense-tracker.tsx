"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BalanceCard } from "@/components/balance-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { createClient } from "@/lib/supabase/client";
import type { Category, Transaction, Wallet } from "@/lib/types";

export function ExpenseTracker() {
  const router = useRouter();
  const supabase = createClient();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadData = useCallback(async () => {
    const [walletResult, txResult, userResult] = await Promise.all([
      supabase.from("wallet").select("*").eq("id", 1).single(),
      supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    setError(null);

    if (userResult.data?.user) {
      setUserEmail(userResult.data.user.email ?? null);
    }

    if (walletResult.error) {
      setError(
        walletResult.error.message.includes("does not exist")
          ? "Database tables not found. Run supabase/schema.sql in your Supabase SQL Editor."
          : walletResult.error.message
      );
      setLoading(false);
      return;
    }

    if (txResult.error) {
      setError(txResult.error.message);
      setLoading(false);
      return;
    }

    setWallet({
      ...walletResult.data,
      balance: Number(walletResult.data.balance),
    });
    setTransactions(
      txResult.data.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      }))
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out.");
      setLoggingOut(false);
    }
  }

  async function handleAdjustBalance(newBalance: number) {
    const { error: updateError } = await supabase
      .from("wallet")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (updateError) throw new Error(updateError.message);
    await loadData();
  }

  async function handleAddTransaction(data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
  }) {
    const { error: insertError } = await supabase.from("transactions").insert({
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: data.date,
    });

    if (insertError) throw new Error(insertError.message);

    const currentBalance = wallet?.balance ?? 0;
    const { error: updateError } = await supabase
      .from("wallet")
      .update({
        balance: currentBalance + data.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (updateError) throw new Error(updateError.message);
    await loadData();
  }

  async function handleDeleteTransaction(id: string) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (deleteError) throw new Error(deleteError.message);

    const currentBalance = wallet?.balance ?? 0;
    const { error: updateError } = await supabase
      .from("wallet")
      .update({
        balance: currentBalance - tx.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (updateError) throw new Error(updateError.message);
    await loadData();
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Premium Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-family-pixel text-base sm:text-lg font-bold tracking-wider text-emerald-400">
              EXPENSE TRACKER
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden text-sm text-zinc-400 font-medium md:inline-block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="rounded-lg border border-red-800 bg-red-800/40 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition duration-200 hover:bg-red-850 hover:text-white disabled:opacity-50 hover:cursor-pointer"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-950 bg-red-950/30 px-4 py-3.5 text-sm text-red-400 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Balance & Quick Add */}
          <div className="space-y-6 lg:col-span-5">
            <BalanceCard
              balance={wallet?.balance ?? 0}
              onAdjust={handleAdjustBalance}
              loading={loading}
            />
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>

          {/* Right Column: Ledger (Transaction List) */}
          <div className="lg:col-span-7">
            <TransactionList
              transactions={transactions}
              loading={loading}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
