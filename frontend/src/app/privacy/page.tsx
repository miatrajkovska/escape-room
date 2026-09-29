import type { Metadata } from "next";
import { PrivacyView } from "@/views/info-views";

export const metadata: Metadata = { title: "Политика за приватност" };

export default function Page() {
  return <PrivacyView />;
}
