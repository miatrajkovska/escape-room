"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState, PageHeader, RoomCard, RoomCardSkeleton } from "@/components/shared";
import { useLang } from "@/i18n/provider";
import { useApi } from "@/lib/api";
import type { Room } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoomsView() {
  const { t } = useLang();
  const { data, error, reload } = useApi<Room[]>("/api/rooms");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [players, setPlayers] = useState<number | null>(null);

  // Филтрирање според тежина и број на играчи
  const filtered = (data ?? []).filter(
    (r) =>
      (difficulty === null || r.difficulty === difficulty) &&
      (players === null || (r.min_players <= players && players <= r.max_players))
  );

  return (
    <>
      <PageHeader title={t.rooms.title} subtitle={t.rooms.subtitle} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:gap-10">
          <FilterGroup
            label={t.rooms.filterDifficulty}
            options={[
              { value: null, label: t.rooms.all },
              { value: 1, label: t.common.difficulty[1] },
              { value: 2, label: t.common.difficulty[2] },
              { value: 3, label: t.common.difficulty[3] },
            ]}
            value={difficulty}
            onChange={setDifficulty}
          />
          <FilterGroup
            label={t.rooms.filterPlayers}
            options={[{ value: null, label: t.rooms.any }, ...[2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))]}
            value={players}
            onChange={setPlayers}
          />
        </div>

        {error && <ErrorState onRetry={reload} />}
        {!data && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        )}
        {data && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">{t.rooms.noResults}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setDifficulty(null);
                setPlayers(null);
              }}
            >
              {t.rooms.reset}
            </Button>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((r) => (
            <RoomCard key={r.slug} room={r} />
          ))}
        </div>
      </section>
    </>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number | null; label: string }[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={cn(
              "h-9 min-w-9 rounded-lg border px-3 text-sm transition",
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/50"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
