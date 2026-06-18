export type Category = "Food" | "Bills" | "Transport" | "Income";

export type Wallet = {
  id: number;
  balance: number;
  updated_at: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  created_at: string;
};
