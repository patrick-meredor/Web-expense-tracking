import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-zinc-950 overflow-hidden select-none">
      <div className="w-full max-w-sm">
      {/* Left Emerald Glow */}
      <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -bottom-10 -left-10 bg-gradient-to-tr from-emerald-900 via-emerald-500 to-teal-400 blur-[80px] md:blur-[120px] z-0 opacity-40 pointer-events-none" />

      {/* Right Ruby/Pink Glow */}
      <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -top-10 -right-10 bg-gradient-to-br from-red-600 via-pink-500 to-purple-400 blur-[80px] md:blur-[120px] z-0 opacity-30 pointer-events-none" />
        <LoginForm />
      </div>
    </div>
  )
}
