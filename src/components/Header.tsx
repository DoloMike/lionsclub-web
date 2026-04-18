import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm tracking-widest text-zinc-400 uppercase">
            Lions Club
          </span>
        </Link>
        <nav className="flex gap-6 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-zinc-200">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
