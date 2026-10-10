/**
 * Browser Supabase client. Only the anon key is used here, which is
 * safe to expose to the client because Row Level Security (see
 * supabase/schema.sql) restricts every table to its owning user.
 *
 * This client is NOT wired into the tracking pages yet — those
 * currently use src/lib/storage.ts (localStorage) so the app works
 * with zero configuration. Swapping storage.ts's internals to call
 * supabase.from(...) instead of localStorage is the main remaining
 * step to move from the local demo to multi-device persistence.
 */
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  return createBrowserClient(url, anonKey);
}
