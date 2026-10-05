import { createReadonlyClient } from "@/lib/supabase/server-readonly";
import { syncUserProfile } from "@/lib/auth";

export async function getCurrentUserProfile() {
  const supabase = await createReadonlyClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return syncUserProfile({ id: user.id, email: user.email });
}
