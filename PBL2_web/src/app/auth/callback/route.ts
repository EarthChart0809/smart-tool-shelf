import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserProfile } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await syncUserProfile({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      });

      return NextResponse.redirect(`${origin}/admin/users`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login`);
}
