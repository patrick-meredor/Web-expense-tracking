"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { UpcomingExpenses } from "@/components/upcoming-expenses";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import type { Category, Transaction, Wallet, UpcomingExpense } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

import {
  getTrackerData,
  adjustWalletBalance,
  createNewWallet,
  addTransactionRecord,
  deleteTransactionRecord,
  addUpcomingExpenseRecord,
  deleteUpcomingExpenseRecord,
  payUpcomingExpenseRecord
} from "@/app/expense-tracker/actions";

export function ExpenseTracker() {
  const router = useRouter();
  const supabase = createClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [activeTab, setActiveTab] = useState<"ledger" | "upcoming">("ledger");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [adjustBalanceValue, setAdjustBalanceValue] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getTrackerData();

      setUserEmail(data.userEmail);
      setWallets(data.wallets);
      setTransactions(data.transactions);
      setUpcomingExpenses(data.upcomingExpenses);

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

  async function handleAddUpcomingExpense(data: { name: string; details: string; amount: number; date: string | null }) {
    if (activeWalletId === null) return;
    try {
      await addUpcomingExpenseRecord(activeWalletId, data);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add upcoming expense.");
    }
  }

  async function handleDeleteUpcomingExpense(id: string) {
    try {
      await deleteUpcomingExpenseRecord(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete upcoming expense.");
    }
  }

  async function handlePayUpcomingExpense(id: string) {
    if (activeWalletId === null || !activeWallet) return;
    try {
      await payUpcomingExpenseRecord(id, activeWalletId, activeWallet.balance);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pay upcoming expense.");
    }
  }

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || null;
  const activeWalletTransactions = activeWalletId !== null
    ? transactions.filter((t) => t.wallet_id === activeWalletId)
    : [];

  const activeUpcomingExpenses = activeWalletId !== null
    ? upcomingExpenses.filter((ue) => ue.wallet_id === activeWalletId)
    : [];

  // Sum of positive transactions (Income)
  const totalIncome = activeWalletTransactions
    .filter((t) => t.amount >= 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Sum of negative transactions (Expenses)
  const totalExpenses = activeWalletTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUpcomingExpenses = activeUpcomingExpenses
    .reduce((sum, ue) => sum + ue.amount, 0);

  // Formatted date string for calendar selection
  const selectedDateStr = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  // Filter transactions by selected calendar date
  const displayedTransactions = selectedDateStr
    ? activeWalletTransactions.filter((t) => t.date === selectedDateStr)
    : activeWalletTransactions;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100 font-sans">
      {/* Premium Header/Navbar with 3 stats cards integrated */}
      <Header 
        userEmail={userEmail} 
        handleSignOut={handleSignOut} 
        loggingOut={loggingOut} 
        balance={activeWallet?.balance ?? 0}
        expenses={totalExpenses}
        upcoming={totalUpcomingExpenses}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-955 bg-red-955/20 px-4 py-3.5 text-sm text-red-400 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Sidebar (3 cols) */}
          <div className="space-y-6 lg:col-span-3">
            <Sidebar 
              activeWallet={activeWallet} 
              activeWalletId={activeWalletId} 
              wallets={wallets} 
              setActiveWalletId={setActiveWalletId} 
              setIsCreateWalletOpen={setIsCreateWalletOpen} 
              setIsAdjustBalanceOpen={setIsAdjustBalanceOpen} 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              income={totalIncome}
              expenses={totalExpenses}
              upcoming={totalUpcomingExpenses}
            />
          </div>

          {/* Right Column: Ledger / Upcoming Tab (9 cols) */}
          <div className="lg:col-span-9">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-6 relative min-h-[440px]">
              
              {/* Tabs Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-450 select-none">
                  <button
                    onClick={() => setActiveTab("ledger")}
                    className={`hover:text-zinc-500 transition cursor-pointer ${
                      activeTab === "ledger" ? "text-emerald-400 animate-fade-in pointer-events-none" : ""
                    }`}
                  >
                    Ledger
                  </button>
                  <span className="text-zinc-800">|</span>
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`hover:text-zinc-500 transition cursor-pointer ${
                      activeTab === "upcoming" ? "text-emerald-400 animate-fade-in" : ""
                    }`}
                  >
                    Upcoming
                  </button>
                </div>

                <div className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
                  {activeTab === "ledger" && (
                    <>
                      <span className="text-emerald-455 font-bold mr-1">
                        {displayedTransactions.length}
                      </span>
                      {selectedDateStr ? "Entries on this Day" : "Total Transactions"}
                      {selectedDateStr && (
                        <button
                          onClick={() => setSelectedDate(undefined)}
                          className="ml-2 px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 font-bold border border-zinc-800 transition cursor-pointer"
                        >
                          Clear Date
                        </button>
                      )}
                    </>
                  )}
                  {activeTab === "upcoming" && (
                    <>
                      <span className="text-emerald-455 font-bold mr-1">
                        {activeUpcomingExpenses.length}
                      </span>
                      Reminders Pending
                    </>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                {activeTab === "ledger" && (
                  <TransactionList
                    transactions={displayedTransactions}
                    loading={loading}
                    onDelete={handleDeleteTransaction}
                    onSubmit={handleAddTransaction}
                    inline={true}
                  />
                )}
                {activeTab === "upcoming" && (
                  <UpcomingExpenses
                    upcomingExpenses={activeUpcomingExpenses}
                    onAdd={handleAddUpcomingExpense}
                    onDelete={handleDeleteUpcomingExpense}
                    onPay={handlePayUpcomingExpense}
                    loading={loading}
                    inline={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Adjust Balance Modal */}
      {isAdjustBalanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-455">Adjust Balance</h3>
            <p className="mt-1 text-xs text-zinc-505">Set a new balance for {activeWallet?.name || "wallet"}.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const parsed = parseFloat(adjustBalanceValue);
              if (Number.isNaN(parsed)) return;
              try {
                await handleAdjustBalance(parsed);
                setAdjustBalanceValue("");
                setIsAdjustBalanceOpen(false);
              } catch (err) {
                console.error("Error adjusting balance:", err)
              }
            }} className="mt-4 space-y-4">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="New balance (e.g. 5000)"
                value={adjustBalanceValue}
                onChange={(e) => setAdjustBalanceValue(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-650 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                autoFocus
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdjustBalanceOpen(false);
                    setAdjustBalanceValue("");
                  }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 hover:text-white px-4 py-2 text-xs font-bold text-zinc-300 transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isCreateWalletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-955/80 p-6 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-455">Add Account</h3>
            <p className="mt-1 text-xs text-zinc-505">Create a new wallet account.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newWalletName.trim()) return;
              const parsedBalance = parseFloat(newWalletBalance) || 0;
              try {
                await handleCreateWallet(newWalletName.trim(), parsedBalance);
                setNewWalletName("");
                setNewWalletBalance("");
                setIsCreateWalletOpen(false);
              } catch (err) {
                console.error("Error creating wallet:", err)
              }
            }} className="mt-4 space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Account Name (e.g. Maya)"
                  required
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-650 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  autoFocus
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Initial Balance"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-650 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateWalletOpen(false);
                    setNewWalletName("");
                    setNewWalletBalance("");
                  }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-450 hover:bg-emerald-555 px-4 py-2 text-xs font-bold text-zinc-955 transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
