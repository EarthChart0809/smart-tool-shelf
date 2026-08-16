import { createClient } from "@supabase/supabase-js";

// Service Role Key は管理者権限を持つ最重要シークレットです。
// サーバー側(app/api/* の Route Handler)以外からは絶対に import しないこと。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
