import type { Metadata } from "next";
import { RoomDetailView } from "@/views/room-detail-view";

export const metadata: Metadata = { title: "Соба" };

export default async function RoomPage({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  return <RoomDetailView slug={slug} />;
}
