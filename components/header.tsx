"use client";

import { useState, useEffect } from "react";
import { LogOut, CreditCard, TrendingUp, Calendar, Bell, Check, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UpcomingExpense, Wallet, AppNotification } from "@/lib/types";

interface HeaderProps {
  userEmail: string | null;
  handleSignOut: () => void;
  loggingOut: boolean;
  balance: number;
  expenses: number;
  upcoming: number;
  loading: boolean;
  upcomingExpenses?: UpcomingExpense[];
  activeWallet?: Wallet | null;
  wallets?: Wallet[];
  onPayUpcomingExpense?: (id: string) => Promise<void>;
  setActiveTab?: (tab: "ledger" | "upcoming") => void;
}

export default function Header({
  userEmail,
  handleSignOut,
  loggingOut,
  balance,
  expenses,
  upcoming,
  loading,
  upcomingExpenses = [],
  activeWallet = null,
  wallets = [],
  onPayUpcomingExpense,
  setActiveTab,
}: HeaderProps) {
  // Format total expenses as positive for the header card display
  const absExpenses = Math.abs(expenses);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);
  const [payingNotificationId, setPayingNotificationId] = useState<string | null>(null);

  // Initialize dismissed keys from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dismissed_notifications");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Set state asynchronously to avoid synchronous cascading renders during mount
          setTimeout(() => {
            setDismissedKeys(parsed);
          }, 0);
        } catch (e) {
          console.error("Failed to parse dismissed notifications", e);
        }
      }
    }
  }, []);

  // Helper to save dismissed keys to local storage
  const saveDismissedKeys = (keys: string[]) => {
    setDismissedKeys(keys);
    localStorage.setItem("dismissed_notifications", JSON.stringify(keys));
  };

  const handleDismiss = (key: string) => {
    if (!dismissedKeys.includes(key)) {
      saveDismissedKeys([...dismissedKeys, key]);
    }
  };

  const handleMarkAllRead = () => {
    const activeKeys = notifications.map((n) => n.key);
    const updated = Array.from(new Set([...dismissedKeys, ...activeKeys]));
    saveDismissedKeys(updated);
  };

  const handlePay = async (expenseId: string) => {
    if (!onPayUpcomingExpense) return;
    setPayingNotificationId(expenseId);
    try {
      await onPayUpcomingExpense(expenseId);
    } catch (e) {
      console.error("Failed to pay expense from notification", e);
    } finally {
      setPayingNotificationId(null);
    }
  };

  // Compute notifications dynamically
  const notifications: AppNotification[] = [];

  if (!loading) {
    // 1. Check wallet balance warnings for the active wallet
    if (activeWallet) {
      const balanceVal = activeWallet.balance;
      if (balanceVal <= 0) {
        const key = `low-balance-${activeWallet.id}-empty`;
        notifications.push({
          id: `low-balance-${activeWallet.id}`,
          key,
          title: "Account Balance Empty",
          message: `Active account "${activeWallet.name}" has no funds left (${formatCurrency(balanceVal)}).`,
          type: "danger",
          createdAt: new Date().toISOString(),
        });
      } else if (balanceVal < 1000) {
        const key = `low-balance-${activeWallet.id}-low`;
        notifications.push({
          id: `low-balance-${activeWallet.id}`,
          key,
          title: "Low Balance Warning",
          message: `Active account "${activeWallet.name}" is running low on funds (${formatCurrency(balanceVal)}).`,
          type: "warning",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Check upcoming expenses due dates
    if (upcomingExpenses && upcomingExpenses.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      upcomingExpenses.forEach((ue) => {
        if (!ue.date) return;

        // Parse date in local timezone to avoid date shifting
        const [year, month, day] = ue.date.split("-").map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const walletName = wallets?.find((w) => w.id === ue.wallet_id)?.name || "Wallet";

        if (diffDays < 0) {
          const absDays = Math.abs(diffDays);
          const key = `upcoming-expense-${ue.id}-overdue`;
          notifications.push({
            id: ue.id,
            key,
            title: "Overdue Expense",
            message: `"${ue.name}" is overdue by ${absDays} day${absDays > 1 ? "s" : ""} (${formatCurrency(ue.amount)}).`,
            type: "danger",
            createdAt: ue.created_at,
            amount: ue.amount,
            expenseId: ue.id,
            walletName,
          });
        } else if (diffDays === 0) {
          const key = `upcoming-expense-${ue.id}-today`;
          notifications.push({
            id: ue.id,
            key,
            title: "Due Today",
            message: `"${ue.name}" is due today (${formatCurrency(ue.amount)}).`,
            type: "warning",
            createdAt: ue.created_at,
            amount: ue.amount,
            expenseId: ue.id,
            walletName,
          });
        } else if (diffDays > 0 && diffDays <= 3) {
          const key = `upcoming-expense-${ue.id}-soon`;
          notifications.push({
            id: ue.id,
            key,
            title: "Due Soon",
            message: `"${ue.name}" is due in ${diffDays} day${diffDays > 1 ? "s" : ""} on ${formatDate(ue.date)} (${formatCurrency(ue.amount)}).`,
            type: "info",
            createdAt: ue.created_at,
            amount: ue.amount,
            expenseId: ue.id,
            walletName,
          });
        }
      });
    }
  }

  // Filter out notifications that have been dismissed
  const activeNotifications = notifications.filter((n) => !dismissedKeys.includes(n.key));
  const unreadCount = activeNotifications.length;


  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-2 shrink">
          <span className="font-family-pixel text-base sm:text-lg font-bold tracking-wider text-emerald-400">
            EXPENSE TRACKER
          </span>
        </div>

        {/* Center: Quick stats overview cards (visible on md screens and larger) */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center px-8">
          {/* Card 1: Balance */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-2 flex items-center gap-3 min-w-40 h-13">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                Balance
              </span>
              <span className="text-sm font-bold text-emerald-400 mt-1 leading-none">
                {loading ? (
                  <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-zinc-800" />
                ) : (
                  formatCurrency(balance)
                )}
              </span>
            </div>
          </div>

          {/* Card 2: Total Expenses */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-2 flex items-center gap-3 min-w-[160px] h-[52px]">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-500/10 text-red-400 shrink-0">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                Expenses
              </span>
              <span className="text-sm font-bold text-red-400 mt-1 leading-none">
                {loading ? (
                  <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-zinc-800" />
                ) : (
                  formatCurrency(absExpenses)
                )}
              </span>
            </div>
          </div>

          {/* Card 3: Total Upcoming */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-2 flex items-center gap-3 min-w-[160px] h-[52px]">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                Upcoming
              </span>
              <span className="text-sm font-bold text-amber-400 mt-1 leading-none">
                {loading ? (
                  <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-zinc-800" />
                ) : (
                  formatCurrency(upcoming)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Profile Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg border border-zinc-900 bg-zinc-950/85 text-zinc-400 hover:text-zinc-200 transition duration-205 hover:cursor-pointer flex items-center justify-center h-9 w-9"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-zinc-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu (Glassmorphic) */}
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <div className="fixed left-3 right-3 top-[84px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3.5 sm:w-80 md:w-96 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-6.5rem)] rounded-2xl border border-zinc-900 bg-zinc-950/95 backdrop-blur-md p-4 shadow-2xl z-50 animate-fade-in flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-100">
                      Notifications ({unreadCount})
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[9px] font-bold uppercase text-emerald-400 hover:text-emerald-355 transition cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="flex-1 max-h-72 overflow-y-auto divide-y divide-zinc-900/60 pr-1 select-none">
                    {unreadCount === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-900/50 text-zinc-650 mb-2 border border-zinc-900">
                          <Check className="h-5 w-5 text-emerald-500/80" />
                        </div>
                        <p className="text-xs font-bold text-zinc-400">All caught up! 🎉</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">No pending alerts.</p>
                      </div>
                    ) : (
                      activeNotifications.map((n) => {
                        let Icon = Info;
                        let iconColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                        let borderLeft = "border-l-2 border-blue-500";

                        if (n.type === "danger") {
                          Icon = AlertCircle;
                          iconColor = "text-red-400 bg-red-500/10 border-red-500/20";
                          borderLeft = "border-l-2 border-red-500";
                        } else if (n.type === "warning") {
                          Icon = AlertTriangle;
                          iconColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                          borderLeft = "border-l-2 border-amber-500";
                        }

                        return (
                          <div
                            key={n.key}
                            className={`flex items-start gap-3 py-3 px-2 transition hover:bg-zinc-900/20 ${borderLeft}`}
                          >
                            <div className={`flex items-center justify-center h-7 w-7 rounded-lg border shrink-0 ${iconColor}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-zinc-150 truncate leading-none">
                                  {n.title}
                                </span>
                                {n.walletName && (
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-900 leading-none">
                                    {n.walletName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-455 mt-1 leading-normal font-medium">
                                {n.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              {n.expenseId && onPayUpcomingExpense && (
                                <button
                                  onClick={() => handlePay(n.expenseId!)}
                                  disabled={payingNotificationId === n.expenseId}
                                  title="Mark as paid"
                                  className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-505 hover:text-zinc-950 flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
                                >
                                  {payingNotificationId === n.expenseId ? (
                                    <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(n.key)}
                                title="Dismiss notification"
                                className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {setActiveTab && (
                    <div className="border-t border-zinc-900 pt-2 flex justify-center">
                      <button
                        onClick={() => {
                          setActiveTab("upcoming");
                          setIsNotificationsOpen(false);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 hover:text-zinc-200 transition cursor-pointer"
                      >
                        View All Upcoming Expenses
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {userEmail && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-405 font-semibold">
              <span className="hidden sm:inline-block max-w-[120px] lg:max-w-[180px] truncate">
                {userEmail}
              </span>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition duration-200 disabled:opacity-50 hover:cursor-pointer flex items-center justify-center gap-2 h-9"
            aria-label="Log out"
          >
            {loggingOut ? (
              <>
                <Spinner />
                <span className="hidden sm:inline">Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}