import { createBrowserClient } from "@supabase/ssr";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      typeof url === "string" &&
      url.length > 10 &&
      typeof key === "string" &&
      key.length > 20
  );
}

/** No-op auth stub when Supabase env vars are missing (app still runs; auth disabled). */
function createStubClient() {
  const noop = () => {};
  const emptySubscription = { unsubscribe: noop };
  return {
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: null }, error: null }),
      signInWithOtp: () =>
        Promise.resolve({
          data: {},
          error: {
            message:
              "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
          },
        }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: emptySubscription },
      }),
    },
  };
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return createStubClient() as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
