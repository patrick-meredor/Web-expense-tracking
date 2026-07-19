export type Category = "Food" | "Bills" | "Transport" | "Income" | "Other" | "Bank Transfer" | "Shopping" | "Travel" | "Education" | "Entertainment" | "Health";

export type Wallet = {
  id: number;
  user_id?: string;
  name: string;
  balance: number;
  updated_at: string;
};

export type Transaction = {
  id: string;
  wallet_id: number;
  user_id?: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  created_at: string;
};

export type UpcomingExpense = {
  id: string;
  wallet_id: number;
  user_id?: string;
  name: string;
  details: string;
  amount: number;
  date: string | null;
  created_at: string;
};
