import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUserProfile } from "@/lib/current-profile";
import AdminLogoutButton from "@/app/_components/AdminLogoutButton";
import AdminNav from "@/app/admin/_components/AdminNav";

export default async function AdminHeader() {
  const profile = await getCurrentUserProfile();

  return (
    <header className="bg-ink text-white print:hidden">
      <div className="container-app flex h-14 max-w-5xl items-center justify-between gap-4">
        <div className="flex h-full min-w-0 items-center gap-6">
          <div className="flex flex-none items-center gap-2.5">
            <Image src="/crescent.svg" alt="" width={24} height={24} />
            <span className="font-bold">管理画面</span>
          </div>

          {/* ログイン後だけナビを出す（今のページに赤い下線） */}
          {profile && (
            <nav className="hidden h-full items-stretch md:flex">
              <AdminNav />
            </nav>
          )}
        </div>

        {profile ? (
          <div className="flex flex-none items-center gap-3 text-sm">
            <Link
              href="/admin/profile"
              title="アカウント設定"
              className="hidden items-center gap-2 sm:flex"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-xs font-bold">
                {profile.name?.charAt(0) ?? "?"}
              </span>
              {profile.name}
            </Link>
            <AdminLogoutButton />
          </div>
        ) : (
          <Link href="/" className="btn btn-on-dark btn-sm">
            <FontAwesomeIcon icon={faArrowLeft} />
            社員画面に戻る
          </Link>
        )}
      </div>

      {/* スマホ用ナビ（横スクロール） */}
      {profile && (
        <nav className="flex h-11 overflow-x-auto border-t border-white/10 md:hidden">
          <div className="container-app flex h-full items-stretch">
            <AdminNav />
          </div>
        </nav>
      )}
    </header>
  );
}
