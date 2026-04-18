/**
 * Set a user's chapter role (member or admin) in public.profiles.
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local.
 *
 * Usage:
 *   node --env-file=.env.local scripts/set-profile-role.mjs --list
 *   node --env-file=.env.local scripts/set-profile-role.mjs you@email.com admin
 *   bun run set-role -- --list
 *   bun run set-role -- you@email.com member
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function usage() {
  console.error(`Usage:
  List auth users (email + id), newest first:
    node --env-file=.env.local scripts/set-profile-role.mjs --list

  Set role (member or admin):
    node --env-file=.env.local scripts/set-profile-role.mjs <email> <member|admin>
`);
}

async function listUsers(supabase) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  const users = data.users ?? [];
  users.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  console.log(`${users.length} user(s):\n`);
  for (const u of users) {
    console.log(`  ${u.email ?? "(no email)"}\n    id: ${u.id}\n`);
  }
}

async function setRole(supabase, email, role) {
  const target = email.trim().toLowerCase();
  let page = 1;
  /** @type {import("@supabase/supabase-js").User | undefined} */
  let found;

  while (page <= 25 && !found) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const users = data.users ?? [];
    found = users.find((u) => u.email?.toLowerCase() === target);
    if (users.length < 200) break;
    page += 1;
  }

  if (!found) {
    console.error(`No auth user found with email: ${email}`);
    process.exit(1);
  }

  const { error: upsertError } = await supabase.from("profiles").upsert(
    { id: found.id, role },
    { onConflict: "id" },
  );

  if (upsertError) throw upsertError;

  console.log(`Updated ${found.email} → role "${role}" (profiles.id=${found.id})`);
}

async function main() {
  const args = process.argv.slice(2);

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (use .env.local).",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args[0] === "--list") {
    await listUsers(supabase);
    return;
  }

  if (args.length !== 2) {
    usage();
    process.exit(1);
  }

  const [email, roleRaw] = args;
  const role = roleRaw.toLowerCase();
  if (role !== "member" && role !== "admin") {
    console.error('Role must be "member" or "admin".');
    process.exit(1);
  }

  await setRole(supabase, email, role);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
