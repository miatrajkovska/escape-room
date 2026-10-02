"use client";

// Електрична табла: запалете ги сите лампички за да се врати струјата и да се отвори вратата.
// Клик на лампичка ја менува неа и нејзините соседи (горе, долу, лево, десно).
import { useState } from "react";
import { useLang } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { GameLayout, useGameSession } from "./game-shell";
import { shuffle } from "./symbols";

// Нивоа: големина на таблата и колку случајни кликови ја „расипуваат“
const LEVELS = [
  { size: 3, scramble: 3 },
  { size: 4, scramble: 5 },
  { size: 5, scramble: 7 },
];

// Клик на (x, y): се менуваат лампичката и соседите
function press(board: boolean[], size: number, x: number, y: number): boolean[] {
  const next = [...board];
  const cells: [number, number][] = [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  for (const [cx, cy] of cells) {
    if (cx >= 0 && cy >= 0 && cx < size && cy < size) next[cy * size + cx] = !next[cy * size + cx];
  }
  return next;
}

// Почнуваме од сите запалени и правиме случајни кликови – така секогаш има решение
function newBoard(levelIndex: number): boolean[] {
  const { size, scramble } = LEVELS[levelIndex];
  while (true) {
    let board = Array<boolean>(size * size).fill(true);
    const all = shuffle(Array.from({ length: size * size }, (_, i) => i));
    for (const i of all.slice(0, scramble)) board = press(board, size, i % size, Math.floor(i / size));
    if (!board.every(Boolean)) return board;
  }
}

export function Lights() {
  const { t } = useLang();
  const session = useGameSession("lights");
  const [levelIndex, setLevelIndex] = useState(0);
  const [board, setBoard] = useState<boolean[]>(() => newBoard(0));
  const [moves, setMoves] = useState(0);
  const [unlocked, setUnlocked] = useState(false); // кратка пауза по решена табла
  const txt = t.games.list.lights;

  const size = LEVELS[levelIndex].size;
  const lit = board.filter(Boolean).length;
  const finished = session.status === "won";

  function click(i: number) {
    if (finished || unlocked) return;
    if (session.status === "idle") session.start(); // тајмерот почнува со првиот клик
    const updated = press(board, size, i % size, Math.floor(i / size));
    const newMoves = moves + 1;
    setBoard(updated);
    setMoves(newMoves);

    if (updated.every(Boolean)) {
      if (levelIndex === LEVELS.length - 1) {
        session.win(newMoves);
      } else {
        // Струјата е вратена, по кратко време следна табла
        setUnlocked(true);
        setTimeout(() => {
          setLevelIndex(levelIndex + 1);
          setBoard(newBoard(levelIndex + 1));
          setUnlocked(false);
        }, 1200);
      }
    }
  }

  function restart() {
    setLevelIndex(0);
    setBoard(newBoard(0));
    setMoves(0);
    setUnlocked(false);
    session.reset();
  }

  return (
    <GameLayout game="lights" session={session} moves={moves} onRestart={restart}>
      <div className="mx-auto max-w-sm">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-heading uppercase text-muted-foreground">
            {txt.level} {levelIndex + 1}/{LEVELS.length}
          </span>
          <span className={cn("font-heading uppercase", lit === board.length ? "text-success" : "text-muted-foreground")}>
            {lit === board.length ? txt.powerOn : `${lit}/${board.length} ${txt.lit}`}
          </span>
        </div>

        {/* Таблата: метална кутија со лампички */}
        <div
          className="grid gap-2 rounded-2xl border border-border bg-gradient-to-br from-[#1f1f28] to-background p-3 sm:gap-3 sm:p-4"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {board.map((on, i) => (
            <button
              key={`${levelIndex}-${i}`}
              onClick={() => click(i)}
              aria-label={`${txt.lamp} ${i + 1}: ${on ? txt.on : txt.off}`}
              aria-pressed={on}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-background/70 transition hover:border-primary/60"
            >
              <span
                className={cn(
                  "size-3/5 rounded-full border-2 transition duration-300",
                  on ? "border-primary bg-primary shadow-[0_0_18px_4px_rgba(212,160,23,0.55)]" : "border-zinc-600 bg-zinc-800"
                )}
              />
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">{txt.hint}</p>
      </div>
    </GameLayout>
  );
}
