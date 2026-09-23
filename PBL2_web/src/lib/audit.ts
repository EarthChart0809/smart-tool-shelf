import { prisma } from "@/lib/prisma";

interface LogParams {
  actorType: "ADMIN" | "EMPLOYEE" | "SYSTEM";
  actorId: string;
  actorName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: Record<string, unknown>;
}

export async function logAction(params: LogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId,
        actorName: params.actorName,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        detail: params.detail ? JSON.stringify(params.detail) : null,
      },
    });
  } catch (error) {
    // 監査ログの記録に失敗しても、本来の操作(貸出・削除など)自体は止めない
    console.error("監査ログの記録に失敗しました", error);
  }
}