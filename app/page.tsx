import { ExpenseTracker } from "@/components/expense-tracker";

export default function Home() {
  return (
    <div className="min-h-full flex-1 bg-zinc-950 font-sans text-zinc-50">
      <ExpenseTracker />
    </div>
  );
}
