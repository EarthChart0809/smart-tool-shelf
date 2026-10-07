"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClockRotateLeft,
  faGear,
  faHouse,
  faQrcode,
  faToolbox,
  faUsers,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

/**
 * 管理画面のサイドバーメニュー（見た目専用のコンポーネント）
 * 今開いているページの項目を強調する。
 */
const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: faHouse },
  { href: "/admin/tools", label: "工具管理", icon: faToolbox },
  { href: "/admin/users", label: "利用者", icon: faUsers },
  { href: "/history", label: "貸出履歴", icon: faClockRotateLeft },
  { href: "/admin/users/print", label: "QR管理", icon: faQrcode },
  { href: "/admin/audit-log", label: "操作ログ", icon: faClipboardList },
  { href: "/admin/admins", label: "管理者", icon: faUserShield },
  { href: "/admin/profile", label: "設定", icon: faGear },
];

export default function AdminNav() {
  const pathname = usePathname();

  // 「/admin/users」と「/admin/users/print」のように前方一致が重なるので、
  // いちばん長く一致した項目だけを選択中にする
  const activeHref = NAV_ITEMS.map((item) => item.href)
    .filter((href) => pathname.startsWith(href))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav-link ${item.href === activeHref ? "admin-nav-link-active" : ""}`}
        >
          <FontAwesomeIcon icon={item.icon} className="w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );
}
