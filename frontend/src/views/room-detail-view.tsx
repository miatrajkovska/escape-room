"use client";

import Link from "next/link";
import { CheckCircleIcon, HourglassIcon, ShieldIcon, TrophyIcon, UsersIcon } from "@/components/icons";
import { RoomArt } from "@/components/room-art";
import { CtaLink, Difficulty, ErrorState, LeaderboardTable, LoadingNote, RoomCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import { formatDuration, formatPrice, pick } from "@/lib/format";
import type { LeaderboardRow, Room } from "@/lib/types";

export function RoomDetailView({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const room = useApi<Room>(`/api/rooms/${slug}`);
  const rooms = useApi<Room[]>("/api/rooms");
  const board = useApi<LeaderboardRow[]>(`/api/leaderboard/${slug}?limit=10`);

  if (room.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        {room.error === "Room not found" ? (
          <>
            <h1 className="text-4xl uppercase">{t.room.notFound}</h1>
            <CtaLink href="/rooms" className="mt-8">
              {t.nav.rooms}
            </CtaLink>
          </>
        ) : (
          <ErrorState onRetry={room.reload} />
        )}
      </div>
    );
  }

  if (!room.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="aspect-[3/1] w-full rounded-3xl" />
        <Skeleton className="mt-8 h-10 w-1/3" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  const r = room.data;
  const facts = [
    { icon: HourglassIcon, label: t.room.duration, value: `${r.duration_min} ${t.common.minutes}` },
    { icon: UsersIcon, label: t.room.playersLabel, value: `${r.min_players}–${r.max_players}` },
    { icon: ShieldIcon, label: t.room.minAge, value: `${r.min_age}+` },
    { icon: TrophyIcon, label: t.common.record, value: r.best_time ? formatDuration(r.best_time) : "--:--" },
  ];

  return (
    <>
      {/* Голема слика со наслов */}
      <section className="relative h-[46vh] min-h-[320px] overflow-hidden border-b border-border">
        <RoomArt theme={r.theme} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <Link href="/rooms" className="text-sm text-muted-foreground hover:text-primary">
            ← {t.nav.rooms}
          </Link>
          <h1 className="text-gold-gradient mt-2 text-5xl uppercase sm:text-7xl">{pick(r, "name", lang)}</h1>
          <p className="mt-2 text-lg text-foreground/90">{pick(r, "tagline", lang)}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <Difficulty level={r.difficulty} />
            <span className="text-sm text-muted-foreground">
              {r.success_rate}% {t.common.successRate}
            </span>
          </div>

          <h2 className="mt-8 text-2xl uppercase text-primary">{t.room.story}</h2>
          <p className="mt-3 text-lg leading-relaxed text-foreground/90">{pick(r, "description", lang)}</p>

          <h2 className="mt-10 text-2xl uppercase text-primary">{t.room.highlights}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {(lang === "mk" ? r.highlights_mk : r.highlights_en).map((h) => (
              <li key={h} className="flex gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                <CheckCircleIcon className="size-5 shrink-0 text-primary" /> {h}
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl uppercase text-primary">{t.room.leaderboard}</h2>
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
            {board.data ? <LeaderboardTable rows={board.data} /> : <LoadingNote />}
          </div>
        </div>

        {/* Странична картичка со информации и резервација */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glow-gold rounded-2xl bg-card p-6">
            <h2 className="text-xl uppercase">{t.room.facts}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl bg-background p-4">
                  <f.icon className="size-6 text-primary" />
                  <dt className="mt-2 text-xs uppercase text-muted-foreground">{f.label}</dt>
                  <dd className="font-heading text-xl">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {t.room.fromPrice} <span className="font-heading text-2xl text-primary">{formatPrice(2400, lang)}</span>
            </p>
            <CtaLink href={`/booking?room=${r.slug}`} className="mt-4 w-full">
              {t.room.bookThis}
            </CtaLink>
          </div>
        </aside>
      </section>

      {rooms.data && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl uppercase">{t.room.other}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.data
              .filter((o) => o.slug !== r.slug)
              .map((o) => (
                <RoomCard key={o.slug} room={o} />
              ))}
          </div>
        </section>
      )}
    </>
  );
}
