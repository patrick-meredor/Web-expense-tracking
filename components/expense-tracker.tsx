"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BalanceCard } from "@/components/balance-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import type { Category, Transaction, Wallet } from "@/lib/types";

export function ExpenseTracker() {
  const router = useRouter();
  const supabase = createClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadData = useCallback(async () => {
    const [walletResult, txResult, userResult] = await Promise.all([
      supabase.from("wallet").select("*").order("name"),
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

    const loadedWallets = walletResult.data.map((w: any) => ({
      ...w,
      balance: Number(w.balance),
    }));

    setWallets(loadedWallets);
    if (loadedWallets.length > 0) {
      setActiveWalletId((prev) => {
        if (prev !== null && loadedWallets.some((w) => w.id === prev)) {
          return prev;
        }
        return loadedWallets[0].id;
      });
    }

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
    if (activeWalletId === null) return;
    const { error: updateError } = await supabase
      .from("wallet")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", activeWalletId);

    if (updateError) throw new Error(updateError.message);
    await loadData();
  }

  async function handleAddTransaction(data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
  }) {
    if (activeWalletId === null) return;
    const { error: insertError } = await supabase.from("transactions").insert({
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: data.date,
      wallet_id: activeWalletId,
    });

    if (insertError) throw new Error(insertError.message);

    const activeWallet = wallets.find((w) => w.id === activeWalletId);
    const currentBalance = activeWallet?.balance ?? 0;

    const { error: updateError } = await supabase
      .from("wallet")
      .update({
        balance: currentBalance + data.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeWalletId);

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

    const targetWallet = wallets.find((w) => w.id === tx.wallet_id);
    const currentBalance = targetWallet?.balance ?? 0;

    const { error: updateError } = await supabase
      .from("wallet")
      .update({
        balance: currentBalance - tx.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.wallet_id);

    if (updateError) throw new Error(updateError.message);
    await loadData();
  }

  async function handleCreateWallet(name: string, initialBalance: number) {
    const { data, error: insertError } = await supabase
      .from("wallet")
      .insert({ name, balance: initialBalance })
      .select();

    if (insertError) throw new Error(insertError.message);
    await loadData();
    if (data && data[0]) {
      setActiveWalletId(data[0].id);
    }
  }

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || null;
  const activeWalletTransactions = activeWalletId !== null
    ? transactions.filter((t) => t.wallet_id === activeWalletId)
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Premium Header/Navbar */}
      <Header userEmail={userEmail} handleSignOut={handleSignOut} loggingOut={loggingOut} />

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
              activeWallet={activeWallet}
              wallets={wallets}
              onSelectWallet={setActiveWalletId}
              onAdjust={handleAdjustBalance}
              onCreateWallet={handleCreateWallet}
              loading={loading}
            />
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>

          {/* Right Column: Ledger (Transaction List) */}
          <div className="lg:col-span-7">
            <TransactionList
              transactions={activeWalletTransactions}
              loading={loading}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
