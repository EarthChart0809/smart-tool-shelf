import AdminHeader from "@/app/admin/_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminHeader />
      <div>{children}</div>
    </div>
  );
}
