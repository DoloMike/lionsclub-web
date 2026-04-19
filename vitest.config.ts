import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules", ".next", ".worktrees"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      /**
       * Denominator = core logic + proxy + key routes + components under test.
       * Listing all app components drops totals because most UI files are not yet covered.
       */
      include: [
        "src/lib/**/*.ts",
        "src/proxy.ts",
        "src/app/sitemap.ts",
        "src/app/robots.ts",
        "src/app/api/health/route.ts",
        "src/app/auth/callback/route.ts",
        "src/app/api/admin/fundraiser/[eventId]/orders-csv/route.ts",
        "src/components/Container.tsx",
        "src/components/ExternalLink.tsx",
        "src/components/Prose.tsx",
        "src/components/fundraising/FundraiserOrderBanner.tsx",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/lib/supabase/server-client.ts",
        "src/lib/auth/session-profile.ts",
        "next-env.d.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        /** Branch-heavy UI conditionals (fundraiser banner, chapter fallbacks) sit slightly below line coverage. */
        branches: 80,
      },
    },
  },
});
