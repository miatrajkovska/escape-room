import type { Metadata } from "next";
import { BlogPostView } from "@/views/blog-views";

export const metadata: Metadata = { title: "Блог" };

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  return <BlogPostView slug={slug} />;
}
