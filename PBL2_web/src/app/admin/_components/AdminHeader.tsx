import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUserProfile } from "@/lib/current-profile";
import AdminLogoutButton from "@/app/_components/AdminLogoutButton";
import AdminNav from "@/app/admin/_components/AdminNav";

export default async function AdminHeader() {
  const profile = await getCurrentUserProfile();

  // ログイン前（管理者ログイン画面など）は細い上部バーだけ
  if (!profile) {
    return (
      <header className="admin-topbar text-white print:hidden">
        <div className="container-app flex h-14 max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-on-dark.png"
              alt="Smart Tool Shelf"
              width={165}
              height={28}
            />
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold">
              管理画面
            </span>
          </div>
          <Link href="/" className="btn btn-on-dark btn-sm">
            <FontAwesomeIcon icon={faQrcode} />
            QRログイン画面へ
          </Link>
        </div>
      </header>
    );
  }

  // ログイン後: PCでは左のサイドバー、スマホでは上部のバー + 横スクロールメニュー
  return (
    <aside className="admin-sidebar text-white print:hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 md:block md:px-6 md:pt-7 md:pb-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span>
            <Image
              src="/logo-on-dark.png"
              alt="Smart Tool Shelf"
              width={188}
              height={32}
            />
            <span className="mt-1 hidden text-xs text-white/50 md:block">
              管理画面
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/"
            className="btn btn-on-dark btn-sm"
            aria-label="QRログイン画面へ"
          >
            <FontAwesomeIcon icon={faQrcode} />
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <AdminNav />
      </nav>

      {/* 最初のQRログイン画面（トップページ）へ戻る */}
      <div className="hidden px-4 pt-4 pb-3 md:block">
        <Link href="/" className="btn btn-primary w-full">
          <FontAwesomeIcon icon={faQrcode} />
          QRログイン画面へ
        </Link>
      </div>

      {/* 下部: ログイン中の管理者 */}
      <div className="m-3 mt-0 hidden rounded-xl border border-white/10 bg-white/5 p-3 md:block">
        <Link
          href="/admin/profile"
          title="アカウント設定"
          className="flex items-center gap-2.5 rounded-lg text-sm"
        >
          <span className="avatar h-9 w-9">
            {profile.name?.charAt(0) ?? "?"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-bold">{profile.name}</span>
            <span className="block text-[0.68rem] text-white/50">管理者</span>
          </span>
        </Link>
        <div className="mt-3 flex flex-col">
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
