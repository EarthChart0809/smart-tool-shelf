import { createClient } from "@/lib/supabase/server";
import { syncUserProfile } from "@/lib/auth";

export async function getCurrentUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return syncUserProfile({ id: user.id, email: user.email });
}
