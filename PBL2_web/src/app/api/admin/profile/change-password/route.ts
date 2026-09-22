import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json(
      { success: false, message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, message: "現在のパスワードと新しいパスワードを入力してください。" },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, message: "新しいパスワードは8文字以上にしてください。" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // 現在のパスワードが正しいかを、再ログインを試みて確認する
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });

  if (reauthError) {
    return NextResponse.json(
      { success: false, message: "現在のパスワードが正しくありません。" },
      { status: 401 },
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { success: false, message: updateError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}