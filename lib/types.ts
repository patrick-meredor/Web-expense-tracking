export type Category = "Food" | "Bills" | "Transport" | "Income" | "Other" | "Bank Transfer" | "Shopping" | "Travel" | "Education" | "Entertainment" | "Health";

export type Wallet = {
  id: number;
  name: string;
  balance: number;
  updated_at: string;
};

export type Transaction = {
  id: string;
  wallet_id: number;
  amount: number;
  description: string;
  category: Category;
  date: string;
  created_at: string;
};

export type UpcomingExpense = {
  id: string;
  wallet_id: number;
  name: string;
  details: string;
  amount: number;
  date: string;
  created_at: string;
};
