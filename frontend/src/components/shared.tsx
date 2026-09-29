"use client";

// Мали компоненти што се користат на повеќе страници
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/i18n/provider";
import { formatDate, formatDuration, pick } from "@/lib/format";
import type { LeaderboardRow, Room } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HourglassIcon, MedalIcon, SkullIcon, StarIcon, UsersIcon, themeIcon } from "./icons";
import { RoomArt } from "./room-art";

// Наслов на секоја внатрешна страница
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-gold-gradient text-4xl uppercase sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("mb-10", className)}>
      <h2 className="text-3xl uppercase sm:text-4xl">
        <span className="mr-3 inline-block h-6 w-1.5 bg-primary align-middle" />
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// Тежина со ѕвездички: ★★☆
export function Difficulty({ level, showLabel = true }: { level: number; showLabel?: boolean }) {
  const { t } = useLang();
  const Icon = level === 3 ? SkullIcon : StarIcon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex">
        {[1, 2, 3].map((i) => (
          <Icon key={i} className={cn("size-4", i <= level ? "text-primary" : "text-muted-foreground/30")} />
        ))}
      </span>
      {showLabel && <span className="text-sm">{t.common.difficulty[level]}</span>}
    </span>
  );
}

export function RoomCard({ room }: { room: Room }) {
  const { t, lang } = useLang();
  const Icon = themeIcon[room.theme];
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-[5/3] overflow-hidden">
        <RoomArt theme={room.theme} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent" />
        <Badge className="absolute left-3 top-3 gap-1 bg-background/80 text-foreground backdrop-blur">
          <Icon className="size-3.5 text-primary" />
          {room.success_rate}% {t.common.successRate}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl uppercase transition group-hover:text-primary">{pick(room, "name", lang)}</h3>
        <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{pick(room, "tagline", lang)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
          <Difficulty level={room.difficulty} />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <UsersIcon className="size-4 text-primary" />
            {room.min_players}–{room.max_players}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <HourglassIcon className="size-4 text-primary" />
            {room.duration_min} {t.common.minutes}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[5/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Порака за грешка + информација дека серверот можеби се буди
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
      <p>{t.common.error}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t.common.serverWaking}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}

export function LoadingNote() {
  const { t } = useLang();
  return <p className="animate-pulse text-sm text-muted-foreground">{t.common.loading}</p>;
}

export function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) return <MedalIcon place={rank as 1 | 2 | 3} className="size-7" />;
  return <span className="inline-flex size-7 items-center justify-center font-heading text-muted-foreground">{rank}</span>;
}

// Табела со најбрзи тимови за една соба
export function LeaderboardTable({ rows, compact = false }: { rows: LeaderboardRow[]; compact?: boolean }) {
  const { t, lang } = useLang();
  if (rows.length === 0) return <p className="py-6 text-center text-muted-foreground">{t.leaderboard.empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="w-12 py-3 pr-2">#</th>
            <th className="py-3 pr-4">{t.common.team}</th>
            <th className="py-3 pr-4 text-right">{t.common.time}</th>
            {!compact && <th className="hidden py-3 pr-4 text-center sm:table-cell">{t.common.hints}</th>}
            {!compact && <th className="hidden py-3 pr-4 text-center sm:table-cell">{t.common.players}</th>}
            {!compact && <th className="hidden py-3 text-right md:table-cell">{t.common.date}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={cn("border-b border-border/60 last:border-0", r.rank === 1 && "bg-primary/5")}>
              <td className="py-2.5 pr-2">
                <RankCell rank={r.rank} />
              </td>
              <td className="py-2.5 pr-4 font-medium">{r.team_name}</td>
              <td className="py-2.5 pr-4 text-right font-heading text-base tabular-nums text-primary">
                {formatDuration(r.time_seconds)}
              </td>
              {!compact && <td className="hidden py-2.5 pr-4 text-center sm:table-cell">{r.hints_used}</td>}
              {!compact && <td className="hidden py-2.5 pr-4 text-center sm:table-cell">{r.players}</td>}
              {!compact && (
                <td className="hidden py-2.5 text-right text-muted-foreground md:table-cell">
                  {formatDate(r.played_on, lang, { month: "short" })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CtaLink({ href, children, variant = "default", className }: { href: string; children: React.ReactNode; variant?: "default" | "outline"; className?: string }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size: "xl" }), className)}>
      {children}
    </Link>
  );
}
