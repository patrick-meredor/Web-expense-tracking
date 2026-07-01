import { LogOut, Loader2 } from "lucide-react";

interface HeaderProps {
    userEmail: string | null;
    handleSignOut: () => void;
    loggingOut: boolean;
}

export default function Header({ userEmail, handleSignOut, loggingOut }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 border sm:max-w-md">
            <span className="font-family-pixel text-base sm:text-lg font-bold tracking-wider text-emerald-400">
              EXPENSE TRACKER
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden text-sm text-zinc-400 font-medium md:inline-block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="rounded-lg border border-red-800 bg-red-800/40 p-2 md:px-3.5 md:py-1.5 text-xs font-semibold text-zinc-300 transition duration-200 hover:bg-red-900 hover:text-white disabled:opacity-50 hover:cursor-pointer flex items-center justify-center gap-2"
              aria-label="Log out"
            >
              {loggingOut ? (
                <>
                {/* Loading state with a spinning icon */}
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden md:inline">Logging out...</span>
              </>
              ) : (
                  <>
                    {/* Standard log out state */}
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Log out</span>
                  </>
              )

              }
            </button>
          </div>
        </div>
      </header>
    )
}