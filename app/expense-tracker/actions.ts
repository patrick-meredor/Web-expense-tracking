'use server'

import { createClient } from "@/lib/supabase/client";
import type { Category, Transaction, Wallet } from "@/lib/types";


export async function getTrackerData() {
  const supabase = await createClient()

  const [walletResult, txResult, userResult] = await Promise.all([
    supabase.from("wallet").select("*").order("name"),
    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (walletResult.error) {
    const isMissingTable = walletResult.error.message.includes("does not exist")
    throw new Error(isMissingTable ? "Database tables not found." : walletResult.error.message)
  }
  if (txResult.error) throw new Error(txResult.error.message)

  const wallets: Wallet[] = (walletResult.data || []).map((w: Wallet) => ({
    ...w,
    balance: Number(w.balance),
  }))

  const transactions: Transaction[] = (txResult.data || []).map((tx: Transaction) => ({
    ...tx,
    amount: Number(tx.amount),
  }))

  return {
    wallets,
    transactions,
    userEmail: userResult.data?.user?.email ?? null,
  }
}

/**
 * Adjusts an existing wallet's manual balance statement.
 */
export async function adjustWalletBalance(walletId: number, newBalance: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("wallet")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", walletId)

  if (error) throw new Error(error.message)
}

/**
 * Creates a brand new wallet profile.
 */
export async function createNewWallet(name: string, initialBalance: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("wallet")
    .insert({ name, balance: initialBalance })
    .select()

  if (error) throw new Error(error.message)
  return data?.[0] || null
}

/**
 * Adds a new transaction ledger record and mutates the linked wallet balance.
 */
export async function addTransactionRecord(
  walletId: number,
  currentBalance: number,
  data: { amount: number; description: string; category: Category; date: string }
) {
  const supabase = await createClient()

  // 1. Insert transaction
  const { error: txError } = await supabase.from("transactions").insert({
    amount: data.amount,
    description: data.description,
    category: data.category,
    date: data.date,
    wallet_id: walletId,
  })
  if (txError) throw new Error(txError.message)

  // 2. Adjust balance
  const { error: walletError } = await supabase
    .from("wallet")
    .update({
      balance: currentBalance + data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", walletId)

  if (walletError) throw new Error(walletError.message)
}

/**
 * Deletes a ledger record and restores balance state properties.
 */
export async function deleteTransactionRecord(transaction: Transaction, currentWalletBalance: number) {
  const supabase = await createClient()

  // 1. Delete record
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transaction.id)
  if (deleteError) throw new Error(deleteError.message)

  // 2. Reverse balance adjustment change
  const { error: walletError } = await supabase
    .from("wallet")
    .update({
      balance: currentWalletBalance - transaction.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.wallet_id)

  if (walletError) throw new Error(walletError.message)
}