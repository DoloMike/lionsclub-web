export default function Home() {
  return (
    <div className="flex w-full items-center justify-center bg-zinc-950 px-4 py-24">
      <div className="w-full max-w-xl text-center">
        {/* Heading */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
          Hello, World.
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-zinc-400">
          A barebones web app template — Next.js, Tailwind, Supabase, Docker &amp; Nginx.
        </p>

        {/* Tech Stack Pills */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {[
            "Next.js 16",
            "TypeScript",
            "Tailwind CSS",
            "Supabase",
            "Docker",
            "Nginx",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Next Steps
          </h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              Copy <code className="text-zinc-200">.env.example</code> to{" "}
              <code className="text-zinc-200">.env</code> and add your Supabase
              credentials
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              Run <code className="text-zinc-200">bun run dev</code> to start
              locally
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              Use <code className="text-zinc-200">docker compose -f docker/docker-compose.yml up -d</code>{" "}
              to deploy
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
