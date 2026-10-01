"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Category,
  Transaction,
  Wallet,
  UpcomingExpense,
} from "@/lib/types";
import { generatePaydayStatement } from "@/lib/pdf";

import {
  getTrackerData,
  adjustWalletBalance,
  createNewWallet,
  addTransactionRecord,
  deleteTransactionRecord,
  addUpcomingExpenseRecord,
  deleteUpcomingExpenseRecord,
  payUpcomingExpenseRecord,
  renameActiveWallet,
  createSubWallet,
} from "@/app/expense-tracker/actions";

export function useExpenseTracker() {
  const router = useRouter();
  const supabase = createClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"ledger" | "upcoming">("ledger");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [isPortionIncomeOpen, setIsPortionIncomeOpen] = useState(false);
  const [isRenameWalletOpen, setIsRenameWalletOpen] = useState(false);
  const [adjustBalanceValue, setAdjustBalanceValue] = useState("");
  const [portionIncomeAmount, setPortionIncomeAmount] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [renameWalletName, setRenameWalletName] = useState("");
  const [isCreateSubWalletOpen, setIsCreateSubWalletOpen] = useState(false);
  const [newSubWalletName, setNewSubWalletName] = useState("");
  const [newSubWalletBalance, setNewSubWalletBalance] = useState("");

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || null;

  const handleSetIsRenameWalletOpen = useCallback(
    (open: boolean) => {
      setIsRenameWalletOpen(open);
      if (open && activeWallet) {
        setRenameWalletName(activeWallet.name);
      }
    },
    [activeWallet],
  );

  const portionIncomeAmountAsNumber = parseFloat(portionIncomeAmount) || 0;

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
          prev !== null && data.wallets.some((w) => w.id === prev)
            ? prev
            : data.wallets[0].id,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred loading data.",
      );
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
      setError(
        err instanceof Error ? err.message : "Failed to adjust balance.",
      );
    }
  }

  async function handleAddTransaction(data: {
    amount: number;
    description: string;
    category: Category;
    date: string;
    toWalletId?: number;
  }) {
    if (activeWalletId === null || !activeWallet) return;
    try {
      await addTransactionRecord(activeWalletId, data);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction.",
      );
    }
  }

  async function handleDeleteTransaction(id: string) {
    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return;

    try {
      await deleteTransactionRecord(targetTx);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction.",
      );
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

  async function handleCreateSubWallet(name: string, initialBalance: number) {
    if (activeWalletId === null) return;
    try {
      const newSub = await createSubWallet(activeWalletId, name, initialBalance);
      await loadData();
      if (newSub) setActiveWalletId(newSub.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create sub wallet.",
      );
    }
  }

  async function handleRenameWallet(newName: string) {
    if (activeWalletId === null) return;
    try {
      await renameActiveWallet(activeWalletId, newName);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to rename wallet.",
      );
    }
  }

  async function handleAddUpcomingExpense(data: {
    name: string;
    details: string;
    amount: number;
    date: string | null;
  }) {
    if (activeWalletId === null) return;
    try {
      await addUpcomingExpenseRecord(activeWalletId, data);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add upcoming expense.",
      );
    }
  }

  async function handleDeleteUpcomingExpense(id: string) {
    try {
      await deleteUpcomingExpenseRecord(id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete upcoming expense.",
      );
    }
  }

  async function handlePayUpcomingExpense(id: string) {
    if (activeWalletId === null || !activeWallet) return;
    try {
      await payUpcomingExpenseRecord(id, activeWalletId);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to pay upcoming expense.",
      );
    }
  }

  async function handleDownloadPDF(scope: "all" | "active" = "all") {
    setIsPdfLoading(true);
    setError(null);
    try {
      await generatePaydayStatement({
        wallets,
        activeWallet,
        transactions,
        userEmail,
        scope,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate PDF statement.",
      );
    } finally {
      setIsPdfLoading(false);
    }
  }

  const activeWalletTransactions =
    activeWalletId !== null
      ? transactions.filter((t) => t.wallet_id === activeWalletId)
      : [];

  const activeUpcomingExpenses =
    activeWalletId !== null
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

  const totalUpcomingExpenses = activeUpcomingExpenses.reduce(
    (sum, ue) => sum + ue.amount,
    0,
  );

  // Formatted date string for calendar selection
  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  // Filter transactions by selected calendar date
  const displayedTransactions = selectedDateStr
    ? activeWalletTransactions.filter((t) => t.date === selectedDateStr)
    : activeWalletTransactions;

  return {
    wallets,
    activeWalletId,
    setActiveWalletId,
    transactions,
    upcomingExpenses,
    loading,
    error,
    userEmail,
    loggingOut,
    isPdfLoading,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    isAdjustBalanceOpen,
    setIsAdjustBalanceOpen,
    isCreateWalletOpen,
    setIsCreateWalletOpen,
    isPortionIncomeOpen,
    setIsPortionIncomeOpen,
    isRenameWalletOpen,
    setIsRenameWalletOpen: handleSetIsRenameWalletOpen,
    adjustBalanceValue,
    setAdjustBalanceValue,
    portionIncomeAmount,
    setPortionIncomeAmount,
    newWalletName,
    setNewWalletName,
    newWalletBalance,
    setNewWalletBalance,
    renameWalletName,
    setRenameWalletName,
    isCreateSubWalletOpen,
    setIsCreateSubWalletOpen,
    newSubWalletName,
    setNewSubWalletName,
    newSubWalletBalance,
    setNewSubWalletBalance,
    activeWallet,
    portionIncomeAmountAsNumber,
    activeWalletTransactions,
    activeUpcomingExpenses,
    totalIncome,
    totalExpenses,
    totalUpcomingExpenses,
    selectedDateStr,
    displayedTransactions,
    handleSignOut,
    handleAdjustBalance,
    handleAddTransaction,
    handleDeleteTransaction,
    handleCreateWallet,
    handleCreateSubWallet,
    handleRenameWallet,
    handleAddUpcomingExpense,
    handleDeleteUpcomingExpense,
    handlePayUpcomingExpense,
    handleDownloadPDF,
  };
}
