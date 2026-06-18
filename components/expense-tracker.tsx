"use client";

import { useCallback, useEffect, useState } from "react";
import { BalanceCard } from "@/components/balance-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { supabase } from "@/lib/supabase/client";
import type { Category, Transaction, Wallet } from "@/lib/types";

export function ExpenseTracker() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);

    const [walletResult, txResult] = await Promise.all([
      supabase.from("wallet").select("*").eq("id", 1).single(),
      supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

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
    loadData();
  }, [loadData]);

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
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Track income and spending in one place.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <BalanceCard
          balance={wallet?.balance ?? 0}
          onAdjust={handleAdjustBalance}
          loading={loading}
        />
        <TransactionForm onSubmit={handleAddTransaction} />
        <TransactionList
          transactions={transactions}
          loading={loading}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}
