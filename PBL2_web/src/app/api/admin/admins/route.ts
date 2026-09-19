import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const admins = await prisma.userProfile.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      passwordSet: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, admins });
}

export async function POST(request: NextRequest) {
  let currentAdmin;

  try {
    currentAdmin = await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const { name, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json(
      { success: false, message: "氏名とメールアドレスを入力してください。" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();
  const origin = request.nextUrl.origin;

  // パスワードはここでは設定しない。招待メールのリンクから本人が設定する。
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${origin}/admin/set-password`,
      data: { name },
    },
  );

  if (error || !data.user) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "招待に失敗しました。" },
      { status: 400 },
    );
  }

  await prisma.userProfile.create({
    data: {
      id: data.user.id,
      email,
      name,
      role: "ADMIN",
      passwordSet: false,
    },
  });

  console.log(`管理者招待: ${email} (実行者: ${currentAdmin.email})`);

  return NextResponse.json({ success: true });
}
