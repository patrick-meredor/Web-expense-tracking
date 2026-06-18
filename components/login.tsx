export default function Login() {
    return (
        <div className="border flex flex-col items-center justify-center gap-5 h-screen bg-zinc-950 text-zinc-50">
            <h1 className="text-2xl tracking-tight font-family-pixel">Login</h1>
            <form className="flex flex-col gap-2">
                <div>
                    <label htmlFor="email" className="text-sm font-sans">Email:</label>
                    <input type="email" id="email" placeholder="JohnDoe@example.com" className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-50" />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-sans">Password:</label>
                    <input type="password" placeholder="**********" className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-50" />
                </div>
                <button type="submit" className="rounded-md underline p-2 text-zinc-50">Login</button>
            </form>
        </div>
    )
}