import { ReturnHome } from "@/components/return-home";

export default function NotFound() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center gap-10 relative">
            {/* Left Emerald Glow */}
            <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -bottom-10 -left-10 bg-gradient-to-tr from-orange-900 via-red-500 to-teal-400 blur-[80px] md:blur-[120px] z-0 opacity-40 pointer-events-none" />
            {/* Right Ruby/Pink Glow */}
            <div className="rounded-full w-64 h-64 md:w-96 md:h-96 absolute -top-10 right-5 bg-gradient-to-br from-purple-600 via-blue-500 to-purple-400 blur-[80px] md:blur-[120px] z-0 opacity-30 pointer-events-none" />

            <div className="flex items-center justify-center">
                <ReturnHome />
            </div>
            <div className="text-center">
                <h1 className="text-9xl font-black text-emerald-400 tracking-tight font-family-pixel text-shadow-lg text-shadow-emerald-200">404</h1>
                <p className="mt-4 text-zinc-500 font-sans">Sorry, we can&apos;t find the page you&apos;re looking for.</p>
            </div>
        </div>
    );
}