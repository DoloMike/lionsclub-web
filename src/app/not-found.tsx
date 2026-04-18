import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <p className="mb-4 font-mono text-sm text-zinc-500">404</p>
        <h1 className="mb-6 text-4xl font-bold text-white">Page not found</h1>
        <Link
          href="/"
          className="rounded-full bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
