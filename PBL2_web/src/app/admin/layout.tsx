import AdminHeader from "@/app/admin/_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell bg-background min-h-screen">
      <AdminHeader />
      <div className="admin-main">{children}</div>
    </div>
  );
}
