import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutClient>
      {children}
      <Toaster position="top-right" />
    </AdminLayoutClient>
  );
}
