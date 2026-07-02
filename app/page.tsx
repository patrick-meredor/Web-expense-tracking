import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExpenseTracker } from "@/components/expense-tracker";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return <ExpenseTracker />;
  }
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-zinc-950 overflow-hidden select-none">
      {/* Left Emerald Glow */}
      <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -bottom-10 -left-10 bg-gradient-to-tr from-emerald-900 via-emerald-500 to-teal-400 blur-[80px] md:blur-[120px] z-0 opacity-40 pointer-events-none" />

      {/* Right Ruby/Pink Glow */}
      <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -top-10 -right-10 bg-gradient-to-br from-red-600 via-pink-500 to-purple-400 blur-[80px] md:blur-[120px] z-0 opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-sm z-10 flex flex-col gap-3 px-4">
        <h1
          className="text-xl md:text-2xl font-family-pixel font-semibold tracking-wider text-center text-zinc-100 uppercase animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
        >
          EXPENSE TRACKER WEB APP
        </h1>
        <p className="text-center text-xs md:text-sm text-zinc-400 font-sans tracking-wide">
          Track your money, expenses, and income
        </p>

        <div className="flex justify-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-emerald-500/30 rounded-lg px-6 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-all duration-200 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
          >
            Login Now
          </Link>
        </div>
      </div>

      {/* Footer Layout positioning */}
      <footer className="w-full text-center text-xs text-zinc-500 absolute bottom-6 left-0 z-10">
        Created by{" "}
        <span className="text-emerald-500/90 font-medium">
          Patrick Meredor
        </span>
      </footer>
    </div>
  );
}
