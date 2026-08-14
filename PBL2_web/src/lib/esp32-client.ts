"use client";

const ESP32_HOST = process.env.NEXT_PUBLIC_ESP32_HOST;

export interface UnlockRequest {
  id: number;
  quantity: number;
}

export async function unlockBoxesViaLan(
  boxes: UnlockRequest[],
): Promise<{ success: boolean; message?: string }> {
  if (!ESP32_HOST) {
    return {
      success: false,
      message: "ESP32のアドレスが設定されていません(NEXT_PUBLIC_ESP32_HOST)。",
    };
  }

  try {
    const response = await fetch(`${ESP32_HOST}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boxes: boxes.map((b) => b.id) }),
    });

    if (!response.ok) {
      return { success: false, message: `ESP32応答エラー: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        "ESP32に接続できません。同じWi-Fi(LAN)に接続しているか確認してください。",
    };
  }
}
