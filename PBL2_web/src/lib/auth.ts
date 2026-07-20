import { prismaAuth } from "@/lib/prisma-auth";
import { UserProfile } from "@/generated/prisma-auth/client";

export async function syncUserProfile(user: {
  id: string;
  email?: string;
  name?: string;
}): Promise<UserProfile> {
  const existing = await prismaAuth.userProfile.findUnique({
    where: {
      id: user.id,
    },
  });

  if (existing) {
    return existing;
  }

  return await prismaAuth.userProfile.create({
    data: {
      id: user.id,
      email: user.email ?? "",
      name: user.name || "管理者",
    },
  });
}
