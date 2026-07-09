import { LogOut, CreditCard, TrendingUp, Calendar, User, ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";

interface HeaderProps {
  userEmail: string | null;
  handleSignOut: () => void;
  loggingOut: boolean;
  balance: number;
  expenses: number;
  upcoming: number;
  loading: boolean;
}

export default function Header({
  userEmail,
  handleSignOut,
  loggingOut,
  balance,
  expenses,
  upcoming,
  loading,
}: HeaderProps) {
  // Format total expenses as positive for the header card display
  const absExpenses = Math.abs(expenses);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-family-pixel text-base sm:text-lg font-bold tracking-wider text-emerald-400">
            EXPENSE TRACKER
          </span>
        </div>

        {/* Center: Quick stats overview cards (visible on md screens and larger) */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center px-8">
          {/* Card 1: Balance */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-2 flex items-center gap-3 min-w-[160px] h-[52px]">
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
          {userEmail && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold bg-zinc-900/30 px-3 py-1.5 rounded-lg border border-zinc-900/60">
              <span className="hidden sm:inline-block max-w-[180px] truncate">
                {userEmail}
              </span>
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-800 text-zinc-300">
                <User className="h-3 w-3" />
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
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
                <span>Log out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}