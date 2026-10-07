"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 管理画面のナビゲーション（見た目専用のコンポーネント）
 * 今開いているページのリンクに赤い下線を付ける。
 */
const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "ダッシュボード" },
  { href: "/admin/users", label: "社員" },
  { href: "/admin/tools", label: "工具" },
  { href: "/admin/admins", label: "管理者" },
  { href: "/admin/audit-log", label: "操作ログ" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
