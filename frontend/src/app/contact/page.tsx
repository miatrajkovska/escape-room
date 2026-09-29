import type { Metadata } from "next";
import { ContactView } from "@/views/contact-view";

export const metadata: Metadata = { title: "Контакт" };

export default function Page() {
  return <ContactView />;
}
