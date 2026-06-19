import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-zinc-950">
      <div className="w-full max-w-sm">
        <h1 className="font-family-pixel text-center animate-pulse">
          EXPENSE TRACKER WEB APP
        </h1>

        <div className="flex justify-center mt-4">
          <Link
            href="/login"
            className="border border-emerald-500 rounded-md px-4 py-1 bg-emerald-400/50"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}