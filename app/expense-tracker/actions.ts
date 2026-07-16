'use server'

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Category, Transaction, Wallet, UpcomingExpense } from "@/lib/types";


export async function getTrackerData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [walletResult, txResult, upcomingResult, userResult] = await Promise.all([
    supabase.from("wallet").select("*").order("name"),
    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("upcoming_expenses")
      .select("*")
      .order("date", { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (walletResult.error) {
    const isMissingTable = walletResult.error.message.includes("does not exist")
    throw new Error(isMissingTable ? "Database tables not found." : walletResult.error.message)
  }
  if (txResult.error) throw new Error(txResult.error.message)

  let upcomingExpenses: UpcomingExpense[] = []
  if (upcomingResult.error) {
    console.error("Upcoming expenses error:", upcomingResult.error.message);
    if (upcomingResult.error.message.includes("does not exist")) {
      throw new Error("Table 'upcoming_expenses' does not exist. Please run the SQL migration script in your Supabase SQL editor.")
    } else {
      throw new Error(upcomingResult.error.message)
    }
  } else {
    upcomingExpenses = (upcomingResult.data || []).map((ue: UpcomingExpense) => ({
      ...ue,
      amount: Number(ue.amount),
    }))
  }

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
    upcomingExpenses,
    userEmail: userResult.data?.user?.email ?? null,
  }
}

/**
 * Adjusts an existing wallet's manual balance statement.
 */
export async function adjustWalletBalance(walletId: number, newBalance: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  const user_id = user?.id

  const { data, error } = await supabase
    .from("wallet")
    .insert({ name, balance: initialBalance, ...(user_id ? { user_id } : {}) })
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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

/**
 * Adds a new upcoming expense.
 */
export async function addUpcomingExpenseRecord(
  walletId: number,
  data: { name: string; details: string; amount: number; date: string | null }
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("upcoming_expenses").insert({
    name: data.name,
    details: data.details,
    amount: data.amount,
    date: data.date || null,
    wallet_id: walletId,
  })

  if (error) throw new Error(error.message)
}

/**
 * Deletes an upcoming expense.
 */
export async function deleteUpcomingExpenseRecord(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("upcoming_expenses")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}

/**
 * Transition an upcoming expense to a ledger transaction, adjust balance, and delete.
 */
export async function payUpcomingExpenseRecord(
  upcomingExpenseId: string,
  walletId: number,
  currentWalletBalance: number
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch upcoming expense details
  const { data: ueData, error: fetchError } = await supabase
    .from("upcoming_expenses")
    .select("*")
    .eq("id", upcomingExpenseId)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  if (!ueData) throw new Error("Upcoming expense not found.")

  const amount = Number(ueData.amount)

  // 2. Insert into transactions (negative amount since it's an expense)
  const detailsStr = ueData.details || "";
  let category: Category = "Bills";
  let displayDetails = detailsStr;
  const match = detailsStr.match(/^\[(Food|Bills|Transport|Income|Other|Bank Transfer|Shopping|Travel|Education|Entertainment|Health)\]\s*(.*)/);
  if (match) {
    category = match[1] as Category;
    displayDetails = match[2];
  }

  const { error: txError } = await supabase.from("transactions").insert({
    amount: -amount,
    description: `${ueData.name}${displayDetails ? ` (${displayDetails})` : ""}`,
    category: category,
    date: new Date().toISOString().slice(0, 10), // paid today
    wallet_id: walletId,
  })
  if (txError) throw new Error(txError.message)

  // 3. Adjust wallet balance
  const { error: walletError } = await supabase
    .from("wallet")
    .update({
      balance: currentWalletBalance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", walletId)
  if (walletError) throw new Error(walletError.message)

  // 4. Delete upcoming expense
  const { error: deleteError } = await supabase
    .from("upcoming_expenses")
    .delete()
    .eq("id", upcomingExpenseId)
  if (deleteError) throw new Error(deleteError.message)
}