"use client";

import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import {
  BriefcaseIcon,
  CakeIcon,
  CalendarIcon,
  CipherIcon,
  LaserIcon,
  LightsIcon,
  DoorIcon,
  GiftIcon,
  KeyIcon,
  QuoteIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
  themeIcon,
} from "@/components/icons";
import { RoomArt } from "@/components/room-art";
import { CtaLink, ErrorState, RoomCard, RoomCardSkeleton, SectionTitle } from "@/components/shared";
import { useLang } from "@/i18n/provider";
import { useApi, useApiInitial } from "@/lib/api";
import { formatDate, formatDuration, pick } from "@/lib/format";
import type { LeaderboardRow, Post, Room } from "@/lib/types";

// initialRooms: собите што ги донел серверот (null ако backend-от не одговорил)
export function HomeView({ initialRooms }: { initialRooms: Room[] | null }) {
  const { t } = useLang();
  const rooms = useApiInitial<Room[]>("/api/rooms", initialRooms);

  return (
    <>
      <Hero />

      {/* Статистика */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {t.home.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-gold-gradient font-heading text-4xl sm:text-5xl">{s.value}</div>
              <div className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Соби */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle title={t.home.roomsTitle} subtitle={t.home.roomsSubtitle} />
        {rooms.error ? (
          <ErrorState onRetry={rooms.reload} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.data ? rooms.data.map((r) => <RoomCard key={r.slug} room={r} />) : [1, 2, 3, 4].map((i) => <RoomCardSkeleton key={i} />)}
          </div>
        )}
      </section>

      <HowItWorks />
      <Records rooms={rooms.data} />
      <Packages />
      <Reviews />
      <GamesTeaser />
      <LatestPosts />

      {/* Повик за акција */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="glow-gold relative overflow-hidden rounded-3xl bg-card px-6 py-14 text-center sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="relative">
            <DoorIcon className="mx-auto size-14 text-primary" />
            <h2 className="mt-4 text-4xl uppercase sm:text-5xl">{t.home.ctaTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.home.ctaText}</p>
            <CtaLink href="/booking" className="mt-8">
              <CalendarIcon /> {t.common.bookNow}
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* Лебдечки икони во позадина */}
      <KeyIcon className="animate-float absolute left-[6%] top-[22%] hidden size-10 text-primary/30 lg:block" style={{ ["--r" as string]: "-20deg" }} />
      <CipherIcon className="animate-float absolute right-[8%] top-[15%] hidden size-12 text-primary/20 lg:block" style={{ animationDelay: "1.5s" }} />
      <SparkleIcon className="animate-float absolute bottom-[18%] left-[42%] hidden size-6 text-primary/40 lg:block" style={{ animationDelay: "3s" }} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
            <KeyIcon className="size-3.5" /> {t.home.eyebrow}
          </p>
          <h1 className="text-5xl uppercase leading-[1.05] sm:text-7xl">
            {t.home.title1}
            <br />
            <span className="text-gold-gradient">{t.home.title2}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t.home.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <CtaLink href="/booking">
              <CalendarIcon /> {t.common.bookNow}
            </CtaLink>
            <CtaLink href="/rooms" variant="outline">
              {t.home.ctaRooms}
            </CtaLink>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <CountdownTimer />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.home.timerLabel}</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useLang();
  const icons = [CalendarIcon, UsersIcon, DoorIcon];
  return (
    <section className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle title={t.home.howTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {t.home.how.map((step, i) => {
            const Icon = icons[i];
            return (
              <div key={step.title} className="relative rounded-2xl border border-border bg-card p-7">
                <span className="absolute right-6 top-4 font-heading text-6xl text-primary/10">0{i + 1}</span>
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-7 text-primary" />
                </div>
                <h3 className="mt-5 text-2xl uppercase">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Records({ rooms }: { rooms: Room[] | null }) {
  const { t, lang } = useLang();
  const board = useApi<Record<string, LeaderboardRow[]>>("/api/leaderboard?limit=1");
  if (!rooms || !board.data) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title={t.home.recordsTitle} subtitle={t.home.recordsSubtitle} />
        <Link href="/leaderboard" className="mb-10 text-sm text-primary hover:underline">
          {t.common.seeAll} →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => {
          const best = board.data?.[room.slug]?.[0];
          const Icon = themeIcon[room.theme];
          return (
            <div key={room.slug} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary" /> {pick(room, "name", lang)}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <TrophyIcon className="size-9 text-primary" />
                <div>
                  <div className="font-heading text-3xl tabular-nums text-primary">
                    {best ? formatDuration(best.time_seconds) : "--:--"}
                  </div>
                  <div className="text-sm">{best?.team_name ?? t.common.noRecord}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Packages() {
  const { t } = useLang();
  const icons = [CakeIcon, BriefcaseIcon, GiftIcon];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <SectionTitle title={t.home.packagesTitle} />
      <div className="grid gap-6 md:grid-cols-3">
        {t.home.packages.map((p, i) => {
          const Icon = icons[i];
          return (
            // Третата картичка (ваучер) води директно до формата за ваучер
            <Link key={p.title} href={i === 2 ? "/pricing#voucher" : "/pricing"} className="card-hover group rounded-2xl border border-border bg-gradient-to-br from-card to-background p-7">
              <Icon className="size-12 text-primary transition group-hover:scale-110" />
              <h3 className="mt-5 text-2xl uppercase">{p.title}</h3>
              <p className="mt-2 text-muted-foreground">{p.text}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Reviews() {
  const { t } = useLang();
  return (
    <section className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle title={t.home.reviewsTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {t.home.reviews.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <QuoteIcon className="size-8 text-primary/60" />
              <blockquote className="mt-4 flex-1 text-foreground/90">{r.text}</blockquote>
              <div className="mt-5 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="size-4 text-primary" />
                ))}
              </div>
              <figcaption className="mt-2 text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground"> · {r.room}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function GamesTeaser() {
  const { t } = useLang();
  const games = [
    { icon: KeyIcon, name: t.games.list.codebreaker.name },
    { icon: LaserIcon, name: t.games.list.laser.name },
    { icon: LightsIcon, name: t.games.list.lights.name },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl uppercase">{t.home.gamesTitle}</h2>
          <p className="mt-4 text-muted-foreground">{t.home.gamesText}</p>
          <CtaLink href="/games" className="mt-8">
            {t.home.gamesCta}
          </CtaLink>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {games.map(({ icon: Icon, name }, i) => (
            <Link
              key={name}
              href="/games"
              className="card-hover flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background"
              style={{ transform: `rotate(${[-4, 2, -2][i]}deg)` }}
            >
              <Icon className="size-10 text-primary" />
              <span className="font-heading text-sm uppercase">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestPosts() {
  const { t, lang } = useLang();
  const posts = useApi<Post[]>("/api/posts");
  if (!posts.data) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title={t.home.blogTitle} />
        <Link href="/blog" className="mb-10 text-sm text-primary hover:underline">
          {t.common.seeAll} →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.data.slice(0, 3).map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover group overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[2/1] overflow-hidden">
              <RoomArt theme={p.cover} className="transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-primary">
                {t.blog.categories[p.category]} · {formatDate(p.published_at, lang)}
              </p>
              <h3 className="mt-2 text-xl leading-snug group-hover:text-primary">{pick(p, "title", lang)}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
