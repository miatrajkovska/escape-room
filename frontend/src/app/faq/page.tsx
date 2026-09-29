import type { Metadata } from "next";
import { FaqView } from "@/views/info-views";

export const metadata: Metadata = { title: "ЧПП" };

export default function Page() {
  return <FaqView />;
}
