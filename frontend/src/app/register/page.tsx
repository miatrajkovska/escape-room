import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterView } from "@/views/auth-views";

export const metadata: Metadata = { title: "Регистрација" };

export default function Page() {
  // useSearchParams (?next=) бара Suspense
  return (
    <Suspense>
      <RegisterView />
    </Suspense>
  );
}
