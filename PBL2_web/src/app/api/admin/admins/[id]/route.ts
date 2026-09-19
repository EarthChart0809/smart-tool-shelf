import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let currentAdmin;

  try {
    currentAdmin = await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const { id } = await params;

  if (id === currentAdmin.id) {
    return NextResponse.json(
      { success: false, message: "自分自身は削除できません。" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    await prisma.userProfile.deleteMany({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("管理者削除エラー:", error);

    return NextResponse.json(
      {
        success: false,
        message: "管理者の削除に失敗しました。",
      },
      { status: 500 },
    );
  }
}
