import type { Metadata } from "next";
import { AdminView } from "@/views/admin-view";

export const metadata: Metadata = { title: "Админ панел" };

export default function Page() {
  return <AdminView />;
}
