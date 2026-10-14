"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faClockRotateLeft,
  faQrcode,
  faToolbox,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../providers/AuthProvider";

const NAV_ITEMS = [
  { href: "/", label: "工具を借りる", icon: faToolbox },
  { href: "/history", label: "貸出履歴", icon: faClockRotateLeft },
  { href: "/admin/login", label: "管理者画面", icon: faUserGear },
];

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    // site-header: 管理画面では globals.css で非表示にする（管理画面は AdminHeader を使う）
    <header className="site-header border-line border-b bg-white">
      <div className="container-app flex h-16 max-w-5xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex flex-none items-center gap-2.5">
            <Image src="/crescent.svg" alt="" width={26} height={26} />
            <span className="hidden text-lg font-bold sm:inline">
              Smart Tool Shelf
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xs" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {user ? (
          <div className="flex flex-none items-center gap-3">
            <span className="hidden items-center gap-2 text-sm sm:flex">
              <span className="bg-brand grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white">
                {user.name?.charAt(0) ?? "?"}
              </span>
              {user.name}
            </span>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              aria-label="ログアウト"
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="sm:hidden"
              />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        ) : (
          <Link href="/qr" className="btn btn-primary btn-sm flex-none">
            <FontAwesomeIcon icon={faQrcode} />
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
