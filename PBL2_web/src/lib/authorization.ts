import { getCurrentUserProfile } from "@/lib/current-profile";

export async function requireAdmin() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("ログインしてください");
  }

  if (profile.role !== "ADMIN") {
    throw new Error("権限がありません");
  }

  return profile;
}
