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
      <header className="bg-ink text-white print:hidden">
        <div className="container-app flex h-14 max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/crescent.svg" alt="" width={24} height={24} />
            <span className="font-bold">管理画面</span>
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
    <aside className="admin-sidebar bg-ink text-white print:hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 md:block md:py-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <Image src="/crescent.svg" alt="" width={26} height={26} />
          <span className="text-sm leading-tight font-bold tracking-[0.12em]">
            SMART TOOL
            <br className="hidden md:block" /> SHELF
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
      <div className="hidden px-3 pb-3 md:block">
        <Link href="/" className="btn btn-primary w-full">
          <FontAwesomeIcon icon={faQrcode} />
          QRログイン画面へ
        </Link>
      </div>

      {/* 下部: ログイン中の管理者 */}
      <div className="hidden border-t border-white/10 px-5 py-4 md:block">
        <Link
          href="/admin/profile"
          title="アカウント設定"
          className="flex items-center gap-2 text-sm"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/15 text-xs font-bold">
            {profile.name?.charAt(0) ?? "?"}
          </span>
          <span className="truncate">{profile.name}</span>
        </Link>
        <div className="mt-3 flex flex-col">
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
