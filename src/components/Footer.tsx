export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6 text-center">
        <p className="text-xs text-zinc-600">
          Built with{" "}
          <span className="text-zinc-500">Next.js</span>,{" "}
          <span className="text-zinc-500">Tailwind</span>,{" "}
          <span className="text-zinc-500">Supabase</span>,{" "}
          <span className="text-zinc-500">Docker</span>.
        </p>
      </div>
    </footer>
  );
}
