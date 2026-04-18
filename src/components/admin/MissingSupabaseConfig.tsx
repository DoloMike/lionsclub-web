export function MissingSupabaseConfig() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
      <p>
        Supabase is not configured. Copy{" "}
        <code className="font-mono text-foreground">.env.example</code> to{" "}
        <code className="font-mono text-foreground">.env.local</code> and set{" "}
        <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</code>
        ,{" "}
        <code className="font-mono text-foreground">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>
        , and{" "}
        <code className="font-mono text-foreground">
          SUPABASE_SERVICE_ROLE_KEY
        </code>
        .
      </p>
    </div>
  );
}
