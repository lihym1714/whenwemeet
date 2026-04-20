const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function hasSupabaseConfig() {
  return Boolean(
    env.supabaseUrl && env.supabasePublishableKey && env.supabaseServiceRoleKey,
  );
}

export function getSupabaseEnv() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    supabaseUrl: env.supabaseUrl!,
    supabasePublishableKey: env.supabasePublishableKey!,
    supabaseServiceRoleKey: env.supabaseServiceRoleKey!,
    appUrl: env.appUrl,
  };
}

export function getBaseUrl() {
  return env.appUrl ?? "http://localhost:3000";
}
