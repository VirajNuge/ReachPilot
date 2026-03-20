import type { Metadata } from "next";
import AdminSidebar from "./components/AdminSidebar";

export const metadata: Metadata = {
  title: "ReachPilot Admin",
  description: "ReachPilot Admin Control Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#E8ECF2]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-[#F8F9FC]">{children}</main>
    </div>
  );
}
