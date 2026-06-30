"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BalanceCard } from "@/components/balance-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import type { Category, Transaction, Wallet } from "@/lib/types";

import {
  getTrackerData,
  adjustWalletBalance,
  createNewWallet,
  addTransactionRecord,
  deleteTransactionRecord
} from "@/app/expense-tracker/actions";

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
    try {
      setError(null);
      const data = await getTrackerData();

      setUserEmail(data.userEmail);
      setWallets(data.wallets);
      setTransactions(data.transactions);

      // Set active default wallet fallback safely
      if (data.wallets.length > 0) {
        setActiveWalletId((prev) => 
          prev !== null && data.wallets.some((w) => w.id === prev) ? prev : data.wallets[0].id
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred loading data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
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
    try {
      await adjustWalletBalance(activeWalletId, newBalance);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust balance.");
    }
  }

  async function handleAddTransaction(data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
  }) {
    if (activeWalletId === null || !activeWallet) return;
    try {
      await addTransactionRecord(activeWalletId, activeWallet.balance, data);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add transaction.");
    }
  }

  async function handleDeleteTransaction(id: string) {
    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return;

    const linkedWallet = wallets.find((w) => w.id === targetTx.wallet_id);
    const walletBalance = linkedWallet?.balance ?? 0;

    try {
      await deleteTransactionRecord(targetTx, walletBalance);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction.");
    }
  }

  async function handleCreateWallet(name: string, initialBalance: number) {
    try {
      const newWallet = await createNewWallet(name, initialBalance);
      await loadData();
      if (newWallet) setActiveWalletId(newWallet.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet.");
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
