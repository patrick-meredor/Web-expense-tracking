'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Landmark, Settings, Wallet } from "lucide-react";
import type { Wallet as WalletType } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency } from "@/lib/format";

interface SidebarProps {
  activeWallet: WalletType | null;
  activeWalletId: number | null;
  wallets: WalletType[];
  setActiveWalletId: (id: number) => void;
  setIsCreateWalletOpen: (open: boolean) => void;
  setIsAdjustBalanceOpen: (open: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  income: number;
  expenses: number;
  upcoming: number;
}

export default function Sidebar({
  activeWallet,
  activeWalletId,
  wallets,
  setActiveWalletId,
  setIsCreateWalletOpen,
  setIsAdjustBalanceOpen,
  selectedDate,
  setSelectedDate,
  income,
  expenses,
  upcoming,
}: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Account Section */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          Account
        </div>
        
        {/* Active Account Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-zinc-950 border-zinc-900 text-zinc-100 hover:bg-zinc-900/60 hover:text-zinc-100 px-3 py-2 text-xs font-bold rounded-lg h-10 cursor-pointer uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className={activeWallet ? "text-emerald-400 font-extrabold" : "text-zinc-400"}>
                  {activeWallet ? activeWallet.name : "Select Account"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-zinc-950 border-zinc-900 text-zinc-100">
            {wallets.map((wallet) => (
              <DropdownMenuItem
                key={wallet.id}
                onClick={() => setActiveWalletId(wallet.id)}
                className={`cursor-pointer justify-between uppercase tracking-wider font-semibold focus:bg-zinc-900 focus:text-zinc-100 ${
                  wallet.id === activeWalletId
                    ? "text-emerald-400 font-extrabold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {wallet.name}
                {wallet.id === activeWalletId && (
                  <span className="text-emerald-400 text-[10px] font-bold">Active</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Manage Account Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 px-3 py-2 text-xs font-bold rounded-lg h-10 cursor-pointer tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Manage Account</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-zinc-950 border-zinc-900 text-zinc-100">
            <DropdownMenuItem
              onClick={() => setIsAdjustBalanceOpen(true)}
              className="cursor-pointer font-semibold text-xs focus:bg-zinc-900 focus:text-zinc-100 text-zinc-400 hover:text-zinc-250 py-2.5"
            >
              Adjust Balance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsCreateWalletOpen(true)}
              className="cursor-pointer font-semibold text-xs focus:bg-zinc-900 focus:text-zinc-100 text-zinc-400 hover:text-zinc-250 py-2.5"
            >
              Add New Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Calendar Section */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          Calendar
        </div>
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full bg-transparent border-0"
          />
        </div>
      </div>

      {/* Quick Overview Section */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          Quick Overview
        </div>
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-3">
          {/* Income Overview */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Income</span>
            </div>
            <span className="text-emerald-400 tabular-nums">
              {formatCurrency(income)}
            </span>
          </div>

          {/* Expenses Overview */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
              <span>Expenses</span>
            </div>
            <span className="text-red-400 tabular-nums">
              {expenses !== 0 ? "-" : ""}
              {formatCurrency(Math.abs(expenses))}
            </span>
          </div>

          {/* Upcoming Overview */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <span>Upcoming</span>
            </div>
            <span className="text-amber-400 tabular-nums">
              {formatCurrency(upcoming)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}