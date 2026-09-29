import type { Metadata } from "next";
import { BlogListView } from "@/views/blog-views";

export const metadata: Metadata = { title: "Блог" };

export default function Page() {
  return <BlogListView />;
}
