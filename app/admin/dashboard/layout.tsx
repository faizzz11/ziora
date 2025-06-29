import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 