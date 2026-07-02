import Link from "next/link";
import { Home } from "lucide-react";

export function ReturnHome() {
    return (
        <Link
            href="/"
            className="w-fit text-muted-foreground hover:text-foreground rounded-full border border-zinc-500 p-2"
          >
            <Home className="h-5 w-5 duration-300 ease-in-out" />
          </Link>
    )
}