'use client';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Wallet } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function Sidebar({activeWallet, activeWalletId, wallets, setActiveWalletId, setIsCreateWalletOpen, setIsAdjustBalanceOpen}: {activeWallet: Wallet | null, activeWalletId: number | null, wallets: Wallet[], setActiveWalletId: (id: number) => void, setIsCreateWalletOpen: (open: boolean) => void, setIsAdjustBalanceOpen: (open: boolean) => void}) {
    const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Account
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-100 px-3 py-2 text-xs font-bold rounded-lg h-9 cursor-pointer uppercase tracking-widest"
                  >
                    <span className={activeWallet ? "text-emerald-400 font-extrabold" : "text-zinc-400"}>
                      {activeWallet ? activeWallet.name : "Select Account"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-zinc-950 border-zinc-800 text-zinc-100">
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
                        <span className="text-emerald-400 text-xs">Active</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Action placeholders */}
            <div className="space-y-3">
              <Button
                onClick={() => setIsCreateWalletOpen(true)}
                className="w-full flex items-center justify-center text-xs font-semibold transition cursor-pointer"
              >
                + Add Account
              </Button>
              <Button
                onClick={() => setIsAdjustBalanceOpen(true)}
                className="w-full flex items-center justify-center text-xs font-semibold transition cursor-pointer"
              >
                + Adjust Balance
              </Button>
            </div>
            <div>
                <Calendar 
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border w-full"
                    captionLayout="dropdown"
                />
            </div>
    </>
  );
}