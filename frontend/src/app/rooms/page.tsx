import type { Metadata } from "next";
import { RoomsView } from "@/views/rooms-view";

export const metadata: Metadata = { title: "Соби" };

export default function RoomsPage() {
  return <RoomsView />;
}
