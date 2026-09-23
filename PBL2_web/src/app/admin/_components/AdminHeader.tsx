import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/current-profile";
import AdminLogoutButton from "@/app/_components/AdminLogoutButton";
import BrandMark from "@/app/_components/BrandMark";

export default async function AdminHeader() {
  const profile = await getCurrentUserProfile();

  return (
    <header
      className="crescent-accent border-b border-black/20 text-white"
      style={{ background: "var(--ink)" }}
    >
      <div className="container-app flex h-16 max-w-5xl items-center justify-between">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2.5">
            <span style={{ color: "var(--brand)" }}>
              <BrandMark size={22} />
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold">管理画面</span>
              <span className="badge badge-out">Admin</span>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/admin/dashboard"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ダッシュボード
            </Link>
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              社員管理
            </Link>
            <Link 
            href="/admin/tools"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              工具管理
            </Link>
            <Link 
            href="/admin/admins" 
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              管理者管理
            </Link>
            <Link href="/admin/audit-log"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              操作ログ
            </Link>
          </nav>
        </div>

        {profile && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden items-center gap-2 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-xs font-bold">
                <Link href="/admin/profile">{profile.name?.charAt(0) ?? "?"}</Link>
              </span>
              {profile.name}
            </span>
            <AdminLogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
