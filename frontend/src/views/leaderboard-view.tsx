"use client";

import { useState } from "react";
import { CardsIcon, CipherIcon, KeyIcon, themeIcon } from "@/components/icons";
import { ErrorState, LeaderboardTable, LoadingNote, PageHeader } from "@/components/shared";
import { GameLeaderboard } from "@/components/games/game-leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import { pick } from "@/lib/format";
import type { GameId, LeaderboardRow, Room } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LeaderboardView() {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t.leaderboard.title} subtitle={t.leaderboard.subtitle} />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Tabs defaultValue="rooms">
          <TabsList className="mb-6 h-11! w-full sm:w-auto">
            <TabsTrigger value="rooms" className="px-6">
              {t.leaderboard.roomsTab}
            </TabsTrigger>
            <TabsTrigger value="games" className="px-6">
              {t.leaderboard.gamesTab}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomsBoard />
          </TabsContent>
          <TabsContent value="games">
            <GamesBoard />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

function RoomsBoard() {
  const { lang } = useLang();
  const rooms = useApi<Room[]>("/api/rooms");
  const board = useApi<Record<string, LeaderboardRow[]>>("/api/leaderboard?limit=10");
  const [active, setActive] = useState<string | null>(null);

  if (rooms.error || board.error) return <ErrorState onRetry={() => (rooms.reload(), board.reload())} />;
  if (!rooms.data || !board.data) return <LoadingNote />;

  const current = active ?? rooms.data[0]?.slug;
  return (
    <>
      <Pills
        items={rooms.data.map((r) => ({ id: r.slug, label: pick(r, "name", lang), icon: themeIcon[r.theme] }))}
        active={current}
        onChange={setActive}
      />
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <LeaderboardTable rows={board.data[current] ?? []} />
      </div>
    </>
  );
}

function GamesBoard() {
  const { t } = useLang();
  const [game, setGame] = useState<GameId>("codebreaker");
  return (
    <>
      <Pills
        items={[
          { id: "codebreaker", label: t.games.list.codebreaker.name, icon: KeyIcon },
          { id: "memory", label: t.games.list.memory.name, icon: CardsIcon },
          { id: "cipher", label: t.games.list.cipher.name, icon: CipherIcon },
        ]}
        active={game}
        onChange={(id) => setGame(id as GameId)}
      />
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <GameLeaderboard game={game} limit={15} />
      </div>
    </>
  );
}

function Pills({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
            active === id ? "border-primary bg-primary/15 text-primary" : "border-border hover:border-primary/40"
          )}
        >
          <Icon className="size-4" /> {label}
        </button>
      ))}
    </div>
  );
}
