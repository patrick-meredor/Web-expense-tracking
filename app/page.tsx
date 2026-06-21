import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-zinc-950">
      <div className="w-full max-w-sm">
        <h1 className="font-family-pixel text-center animate-pulse">
          EXPENSE TRACKER WEB APP
        </h1>
        <p className="text-center text-sm text-gray-400 font-sans">Track your money, expenses, and income</p>

        <div className="flex justify-center mt-5">
          <Link
            href="/login"
            className="border border-emerald-500 rounded-md px-4 py-1 bg-emerald-400/50"
          >
            Login
          </Link>
        </div>
      </div>
      <footer className="text-center text-sm text-white absolute bottom-5">
        Created by <span className="text-emerald-500">Patrick Meredor</span>
      </footer>
    </div>
  );
}