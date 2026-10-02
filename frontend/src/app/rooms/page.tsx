import type { Metadata } from "next";
import { getRooms } from "@/lib/server-data";
import { RoomsView } from "@/views/rooms-view";

export const metadata: Metadata = { title: "Соби" };

export default async function RoomsPage() {
  return <RoomsView initialRooms={await getRooms()} />;
}
