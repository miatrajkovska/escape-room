"use client";

import { useEffect } from "react";
import { LoadingNote, RankCell } from "@/components/shared";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type { GameId, GameRow } from "@/lib/types";
import { cn } from "@/lib/utils";

// Листа на најдобри играчи за една онлајн игра
export function GameLeaderboard({
  game,
  limit = 10,
  compact = false,
  version = 0,
}: {
  game: GameId;
  limit?: number;
  compact?: boolean;
  version?: number; // се зголемува кога треба повторно да се вчита
}) {
  const { t } = useLang();
  const { user } = useAuth();
  const { data, reload } = useApi<GameRow[]>(`/api/games/${game}/leaderboard?limit=${limit}`);

  useEffect(() => {
    if (version > 0) reload();
  }, [version, reload]);

  if (!data) return <LoadingNote />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">{t.leaderboard.empty}</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
          <th className="w-10 py-2">#</th>
          <th className="py-2">{t.common.player}</th>
          <th className="py-2 text-right">{t.common.time}</th>
          {!compact && <th className="py-2 text-right">{t.common.moves}</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            key={row.user_id}
            className={cn("border-b border-border/60 last:border-0", user?.id === row.user_id && "bg-primary/10")}
          >
            <td className="py-2">
              <RankCell rank={row.rank} />
            </td>
            <td className="max-w-32 truncate py-2">{row.player}</td>
            <td className="py-2 text-right font-heading tabular-nums text-primary">{formatDuration(row.time_seconds)}</td>
            {!compact && <td className="py-2 text-right text-muted-foreground">{row.moves}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
