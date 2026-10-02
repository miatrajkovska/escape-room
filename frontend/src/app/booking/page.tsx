import type { Metadata } from "next";
import { Suspense } from "react";
import { getRooms } from "@/lib/server-data";
import { BookingView } from "@/views/booking-view";

export const metadata: Metadata = { title: "Резервација" };

export default async function BookingPage() {
  const rooms = await getRooms();
  // useSearchParams (?room=) бара Suspense
  return (
    <Suspense>
      <BookingView initialRooms={rooms} />
    </Suspense>
  );
}
