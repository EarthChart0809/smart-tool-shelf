import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/current-profile";
import AdminLogoutButton from "@/app/_components/AdminLogoutButton";

export default async function AdminHeader() {
  const profile = await getCurrentUserProfile();

  return (
    <header className="bg-gray-800 p-4 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="font-bold">管理画面</p>

          <nav className="flex gap-4 text-sm">
            <Link href="/admin/dashboard">ダッシュボード</Link>
            <Link href="/admin/users">社員管理</Link>
            <Link href="/admin/tools">工具管理</Link>
          </nav>
        </div>

        {profile && (
          <div className="flex items-center gap-4 text-sm">
            <span>👤 {profile.name}</span>
            <AdminLogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
