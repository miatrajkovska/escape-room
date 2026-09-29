"use client";

import Link from "next/link";
import { CardsIcon, CipherIcon, KeyIcon } from "@/components/icons";
import { GameLeaderboard } from "@/components/games/game-leaderboard";
import { PageHeader } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type { GameId } from "@/lib/types";
import { cn } from "@/lib/utils";

type MyBest = Record<GameId, { time_seconds: number; moves: number } | null>;

const GAMES: { id: GameId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "codebreaker", icon: KeyIcon },
  { id: "memory", icon: CardsIcon },
  { id: "cipher", icon: CipherIcon },
];

export function GamesView() {
  const { t } = useLang();
  const { user } = useAuth();
  const mine = useApi<MyBest>(user ? "/api/games/me" : null);

  return (
    <>
      <PageHeader title={t.games.title} subtitle={t.games.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
        {GAMES.map(({ id, icon: Icon }) => {
          const info = t.games.list[id];
          const best = mine.data?.[id];
          return (
            <div key={id} className="card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a2412] to-background">
                <div className="bg-grid absolute inset-0 opacity-70" />
                <Icon className="relative size-20 text-primary" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-3xl uppercase">{info.name}</h2>
                <p className="mt-2 text-muted-foreground">{info.short}</p>
                {user && (
                  <p className="mt-4 text-sm">
                    <span className="text-muted-foreground">{t.games.yourBest}: </span>
                    <span className="font-heading text-primary">
                      {best ? `${formatDuration(best.time_seconds)} · ${best.moves} ${t.games.moves.toLowerCase()}` : t.profile.notPlayed}
                    </span>
                  </p>
                )}
                <div className="mt-5 flex-1 rounded-xl bg-background/60 p-3">
                  <GameLeaderboard game={id} limit={3} compact />
                </div>
                <Link href={`/games/${id}`} className={cn(buttonVariants({ size: "xl" }), "mt-5")}>
                  {t.games.play}
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
