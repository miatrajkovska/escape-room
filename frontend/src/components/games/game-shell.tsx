"use client";

// Заедничко за сите мини-игри: тајмер, статус, зачувување на резултат, изглед на страницата
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircleIcon, HourglassIcon, PuzzleIcon, TrophyIcon } from "@/components/icons";
import { fill, useLang } from "@/i18n/provider";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type { GameId, MyGameStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GameLeaderboard } from "./game-leaderboard";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export function useGameSession(game: GameId) {
  const { user } = useAuth();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [boardVersion, setBoardVersion] = useState(0);
  const startedAt = useRef(0);
  // Ref-ови за да ги знаеме статусот, потезите и корисникот и кога страницата се затвора
  const statusRef = useRef<GameStatus>("idle");
  const movesRef = useRef(0);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const changeStatus = useCallback((s: GameStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // Тајмерот се ажурира секоја секунда додека се игра
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [status]);

  // Изгубена или прекината игра – се зачувува за да се знае дека корисникот играл
  const saveAttempt = useCallback(
    (result: "lost" | "quit") => {
      if (!userRef.current) return;
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      api("/api/games/attempts", {
        method: "POST",
        body: { game, result, time_seconds: seconds, moves: movesRef.current },
        keepalive: true,
      }).catch(() => {});
    },
    [game]
  );

  // Ако корисникот ја напушти страницата среде игра, тоа се брои како прекината игра
  useEffect(() => {
    const onLeave = () => {
      if (statusRef.current !== "playing") return;
      statusRef.current = "idle";
      saveAttempt("quit");
    };
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      onLeave(); // корисникот отиде на друга страница во сајтот
    };
  }, [saveAttempt]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setElapsed(0);
    setFinalTime(0);
    setRank(null);
    changeStatus("playing");
  }, [changeStatus]);

  // Играта го јавува бројот на потези (за прекинати игри)
  const trackMoves = useCallback((moves: number) => {
    movesRef.current = moves;
  }, []);

  const win = useCallback(
    async (moves: number) => {
      const seconds = Math.max(3, Math.round((Date.now() - startedAt.current) / 1000));
      setFinalTime(seconds);
      changeStatus("won");
      if (!user) return;
      try {
        const res = await api<{ rank: number | null }>("/api/games/scores", {
          method: "POST",
          body: { game, time_seconds: seconds, moves },
        });
        setRank(res.rank);
        setBoardVersion((v) => v + 1);
      } catch {
        // резултатот не е зачуван – не е критично
      }
    },
    [game, user, changeStatus]
  );

  const lose = useCallback(() => {
    setFinalTime(Math.round((Date.now() - startedAt.current) / 1000));
    changeStatus("lost");
    saveAttempt("lost");
  }, [saveAttempt, changeStatus]);

  // „Почни одново“ – тајмерот се враќа на 0:00
  const reset = useCallback(() => {
    if (statusRef.current === "playing") saveAttempt("quit");
    changeStatus("idle");
    setElapsed(0);
    setFinalTime(0);
    setRank(null);
  }, [saveAttempt, changeStatus]);

  return { status, elapsed, finalTime, rank, boardVersion, start, win, lose, reset, trackMoves, loggedIn: !!user };
}

type Session = ReturnType<typeof useGameSession>;

// Краток опис на моите резултати, на пр. „1:23 · 8 потези · одиграно 5×“
export function useMyGameSummary() {
  const { t } = useLang();
  return (stats: MyGameStats[GameId] | undefined) => {
    if (!stats || stats.played === 0) return t.profile.notPlayed;
    const played = fill(t.profile.playedTimes, { n: stats.played });
    if (!stats.best) return `${t.profile.noWinYet} · ${played}`;
    return `${formatDuration(stats.best.time_seconds)} · ${stats.best.moves} ${t.games.moves.toLowerCase()} · ${played}`;
  };
}

export function GameLayout({
  game,
  session,
  moves,
  onRestart,
  extraResult,
  children,
}: {
  game: GameId;
  session: Session;
  moves: number;
  onRestart: () => void;
  extraResult?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const info = t.games.list[game];
  const time = session.status === "playing" ? session.elapsed : session.finalTime;

  // Потезите се чуваат во сесијата за да се зачуваат и ако играта се прекине
  const { trackMoves } = session;
  useEffect(() => trackMoves(moves), [trackMoves, moves]);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div>
        <Link href="/games" className="text-sm text-muted-foreground hover:text-primary">
          ← {t.nav.games}
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-gold-gradient text-5xl uppercase">{info.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Stat icon={HourglassIcon} label={t.games.time} value={formatDuration(time)} />
            <Stat icon={PuzzleIcon} label={t.games.moves} value={String(moves)} />
            {/* Нова игра и среде игра (се брои како прекината) */}
            {session.status === "playing" && (
              <Button variant="outline" size="lg" onClick={onRestart}>
                {t.games.restart}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">{children}</div>

        {/* Резултат по крајот на играта */}
        {(session.status === "won" || session.status === "lost") && (
          <div
            className={cn(
              "mt-6 rounded-2xl border p-6 text-center animate-in fade-in zoom-in-95",
              session.status === "won" ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"
            )}
          >
            {session.status === "won" ? <TrophyIcon className="mx-auto size-12 text-primary" /> : null}
            <h2 className="mt-2 text-3xl uppercase">{session.status === "won" ? t.games.won : t.games.lost}</h2>
            {session.status === "won" && (
              <p className="mt-2 font-heading text-xl text-primary">
                {formatDuration(session.finalTime)} · {moves} {t.games.moves.toLowerCase()}
              </p>
            )}
            {extraResult}
            {session.status === "won" &&
              (session.loggedIn ? (
                session.rank && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-sm">
                    <CheckCircleIcon className="size-5 text-success" /> {fill(t.games.saved, { rank: session.rank })}
                  </p>
                )
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  <Link href={`/login?next=/games/${game}`} className="text-primary hover:underline">
                    {t.games.loginToSave}
                  </Link>
                </p>
              ))}
            <Button size="xl" className="mt-5" onClick={onRestart}>
              {t.games.again}
            </Button>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg uppercase text-primary">{t.games.rules}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {info.rules.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg uppercase text-primary">{t.games.top}</h2>
          <GameLeaderboard game={game} limit={10} compact version={session.boardVersion} />
          <Link href="/leaderboard" className={cn(buttonVariants({ variant: "link" }), "mt-2 px-0")}>
            {t.common.seeAll} →
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
      <Icon className="size-5 text-primary" />
      <div>
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className="font-heading text-xl tabular-nums leading-none">{value}</div>
      </div>
    </div>
  );
}
