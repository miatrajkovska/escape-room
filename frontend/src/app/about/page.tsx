import type { Metadata } from "next";
import { AboutView } from "@/views/info-views";

export const metadata: Metadata = { title: "За нас" };

export default function Page() {
  return <AboutView />;
}
