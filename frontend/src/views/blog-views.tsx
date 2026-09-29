"use client";

import Link from "next/link";
import { RoomArt } from "@/components/room-art";
import { CtaLink, ErrorState, LoadingNote, PageHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import { formatDate, pick } from "@/lib/format";
import type { Post } from "@/lib/types";

export function BlogListView() {
  const { t, lang } = useLang();
  const posts = useApi<Post[]>("/api/posts");

  return (
    <>
      <PageHeader title={t.blog.title} subtitle={t.blog.subtitle} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {posts.error && <ErrorState onRetry={posts.reload} />}
        {!posts.data && !posts.error && <LoadingNote />}
        {posts.data && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.data.map((p, i) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className={`card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card ${i === 0 ? "md:col-span-2 lg:row-span-1" : ""}`}
              >
                <div className={`overflow-hidden ${i === 0 ? "aspect-[2.4/1]" : "aspect-[2/1]"}`}>
                  <RoomArt theme={p.cover} className="transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-wide text-primary">
                    {t.blog.categories[p.category]} · {formatDate(p.published_at, lang)}
                  </p>
                  <h2 className={`mt-2 leading-snug group-hover:text-primary ${i === 0 ? "text-3xl" : "text-xl"}`}>{pick(p, "title", lang)}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{pick(p, "excerpt", lang)}</p>
                  <span className="mt-4 text-sm text-primary">{t.common.readMore} →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function BlogPostView({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const post = useApi<Post>(`/api/posts/${slug}`);

  if (post.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        {post.error === "Post not found" ? (
          <>
            <h1 className="text-4xl uppercase">{t.blog.notFound}</h1>
            <CtaLink href="/blog" className="mt-8">{t.blog.back}</CtaLink>
          </>
        ) : (
          <ErrorState onRetry={post.reload} />
        )}
      </div>
    );
  }

  if (!post.data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const p = post.data;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
        ← {t.blog.back}
      </Link>
      <div className="mt-6 aspect-[2/1] overflow-hidden rounded-2xl border border-border">
        <RoomArt theme={p.cover} />
      </div>
      <p className="mt-8 text-xs uppercase tracking-wide text-primary">
        {t.blog.categories[p.category]} · {formatDate(p.published_at, lang)}
      </p>
      <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{pick(p, "title", lang)}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{pick(p, "excerpt", lang)}</p>
      <div className="mt-8 space-y-5 border-t border-border pt-8 text-lg leading-relaxed text-foreground/90">
        {pick(p, "body", lang)
          .split("\n\n")
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>
      <CtaLink href="/booking" className="mt-12">{t.common.bookNow}</CtaLink>
    </article>
  );
}
