import type { Metadata } from "next";
import { ProfileView } from "@/views/profile-view";

export const metadata: Metadata = { title: "Мој профил" };

export default function Page() {
  return <ProfileView />;
}
