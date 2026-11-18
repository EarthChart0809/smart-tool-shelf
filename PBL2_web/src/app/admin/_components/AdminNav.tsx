"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faBars,
  faClockRotateLeft,
  faCube,
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
  { href: "/admin/shelf", label: "工具棚", icon: faCube },
  { href: "/admin/tools", label: "工具管理", icon: faToolbox },
  { href: "/admin/users", label: "利用者", icon: faUsers },
  { href: "/admin/history", label: "貸出履歴", icon: faClockRotateLeft },
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

  const active = NAV_ITEMS.find((item) => item.href === activeHref);

  return (
    <>
      {/* PC: 縦に並べたメニュー */}
      <div className="admin-nav-desktop">
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
      </div>

      {/* スマホ: 「メニュー」を押すと全項目をタイルで表示。
          key に今のページを入れているので、ページを移ると自動で閉じる */}
      <details key={pathname} className="admin-nav-mobile">
        <summary>
          <span className="flex min-w-0 items-center gap-2.5">
            {active && <FontAwesomeIcon icon={active.icon} className="w-4" />}
            <span className="truncate font-bold">
              {active?.label ?? "メニュー"}
            </span>
          </span>
          <span className="flex flex-none items-center gap-1.5 text-xs text-white/70">
            <FontAwesomeIcon icon={faBars} />
            メニュー
          </span>
        </summary>

        <div className="admin-nav-grid">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-tile ${item.href === activeHref ? "admin-nav-tile-active" : ""}`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-lg" />
              {item.label}
            </Link>
          ))}
        </div>
      </details>
    </>
  );
}
