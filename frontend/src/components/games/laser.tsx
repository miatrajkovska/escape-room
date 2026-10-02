"use client";

// Ласерски лавиринт: вртете ги огледалата за ласерот да стигне до сензорот на вратата
import { useState } from "react";
import { useLang } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { GameLayout, useGameSession } from "./game-shell";

// Мапите: S = ласер (свети надесно), T = сензор, M = огледало, # = ѕид, . = празно
// За секое ниво има 5 мапи, а секоја игра случајно избира по една. Сите се проверени дека имаат решение.
const LEVEL_POOLS: string[][][] = [
  // Ниво 1: 6×6
  [
    [
      "M.....",
      ".....#",
      ".MT..#",
      ".....M",
      "#.M.M.",
      "S...M#",
    ],
    [
      "...M#.",
      "..#...",
      "..#..M",
      "SM.M..",
      ".M...M",
      "....#T",
    ],
    [
      ".M.#..",
      "T...#.",
      "..##..",
      ".M....",
      "M..MM.",
      "S..M..",
    ],
    [
      "#.#.M#",
      "...M.M",
      "......",
      "#...M.",
      "..M..T",
      "S..M..",
    ],
    [
      ".M....",
      "....#.",
      "S..M..",
      "M..M.#",
      "T#....",
      "M.M#..",
    ],
  ],
  // Ниво 2: 7×7
  [
    [
      ".....T#",
      "..#.MMM",
      ".#M.M..",
      "S.M.##.",
      ".M.....",
      ".....M.",
      "...M.#.",
    ],
    [
      "...#...",
      "S.M.#..",
      "M..MM..",
      "#....#.",
      ".#..T.M",
      ".#MM...",
      "M....M.",
    ],
    [
      "S.M..M#",
      "..M.M.#",
      "M...M..",
      ".M..#..",
      "TM.....",
      "..##.#.",
      "....M..",
    ],
    [
      ".......",
      "#..M.#.",
      "S.M#.MM",
      ".......",
      "T..#...",
      "..MM.M.",
      "M..M##.",
    ],
    [
      "S...M#M",
      ".M..M..",
      ".......",
      ".M.M...",
      ".M.TM#.",
      "#...#M.",
      "..#..#.",
    ],
  ],
  // Ниво 3: 8×8
  [
    [
      "SM..M..M",
      "......MM",
      "..#.....",
      "..#....M",
      "MM..MMT#",
      "..#...#.",
      "M#.M#...",
      "....#...",
    ],
    [
      "...M.MMM",
      ".#..M...",
      ".M...MM.",
      "....#.#T",
      "S..M..M.",
      "....#.#.",
      "...#.M..",
      ".#M#....",
    ],
    [
      "M##.#...",
      "S..MM..M",
      "...MM##.",
      "#....M.M",
      ".....T..",
      ".#M.....",
      "#M....M.",
      "......M.",
    ],
    [
      ".##.....",
      ".M.M.M..",
      "..#....#",
      ".M.MM...",
      "..M..M.M",
      "SMT..#..",
      "#...M.#.",
      "M#......",
    ],
    [
      "S.M#..T.",
      "....MM..",
      ".#......",
      ".#M.MMM.",
      "..M.##..",
      "........",
      "M...M.M.",
      "#.#..#.M",
    ],
  ],
];

// По една случајна мапа за секое ниво
function pickLevels(): string[][] {
  return LEVEL_POOLS.map((pool) => pool[Math.floor(Math.random() * pool.length)]);
}

type Mirror = "/" | "\\";
type Mirrors = Record<string, Mirror>; // клуч "x,y"
type Point = [number, number];

// Пат на зракот: точки (во единици на ќелии) и дали стигнал до сензорот
function traceBeam(level: string[], mirrors: Mirrors): { points: Point[]; hit: boolean } {
  const rows = level.length;
  const cols = level[0].length;
  let y = level.findIndex((row) => row.includes("S"));
  let x = level[y].indexOf("S");
  let dx = 1;
  let dy = 0;
  const points: Point[] = [[x + 0.5, y + 0.5]];
  const seen = new Set<string>();

  while (true) {
    const nx = x + dx;
    const ny = y + dy;
    // Излегува од таблата или удира во ѕид: зракот застанува на работ на ќелијата
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || level[ny][nx] === "#") {
      points.push([x + 0.5 + dx / 2, y + 0.5 + dy / 2]);
      return { points, hit: false };
    }
    x = nx;
    y = ny;
    const cell = level[y][x];
    if (cell === "T") {
      points.push([x + 0.5, y + 0.5]);
      return { points, hit: true };
    }
    if (cell === "M") {
      points.push([x + 0.5, y + 0.5]);
      // „/“ го свртува зракот: десно → горе, „\“: десно → долу
      if (mirrors[`${x},${y}`] === "/") [dx, dy] = [-dy, -dx];
      else [dx, dy] = [dy, dx];
    }
    // Заштита од бесконечен круг
    const state = `${x},${y},${dx},${dy}`;
    if (seen.has(state)) return { points, hit: false };
    seen.add(state);
  }
}

// Случајна почетна положба на огледалата (но не веќе решена)
function randomMirrors(level: string[]): Mirrors {
  while (true) {
    const mirrors: Mirrors = {};
    level.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === "M") mirrors[`${x},${y}`] = Math.random() < 0.5 ? "/" : "\\";
      })
    );
    if (!traceBeam(level, mirrors).hit) return mirrors;
  }
}

export function Laser() {
  const { t } = useLang();
  const session = useGameSession("laser");
  const [levels, setLevels] = useState<string[][]>(pickLevels);
  const [levelIndex, setLevelIndex] = useState(0);
  const [mirrors, setMirrors] = useState<Mirrors>(() => randomMirrors(levels[0]));
  const [moves, setMoves] = useState(0);
  const [unlocked, setUnlocked] = useState(false); // кратка пауза по решено ниво
  const txt = t.games.list.laser;

  const level = levels[levelIndex];
  const beam = traceBeam(level, mirrors);
  const finished = session.status === "won";

  function rotate(key: string) {
    if (finished || unlocked) return;
    if (session.status === "idle") session.start(); // тајмерот почнува со првото вртење
    const updated: Mirrors = { ...mirrors, [key]: mirrors[key] === "/" ? "\\" : "/" };
    const newMoves = moves + 1;
    setMirrors(updated);
    setMoves(newMoves);

    if (traceBeam(level, updated).hit) {
      if (levelIndex === levels.length - 1) {
        session.win(newMoves);
      } else {
        // Вратата се отвора, па по кратко време следно ниво
        setUnlocked(true);
        setTimeout(() => {
          setLevelIndex(levelIndex + 1);
          setMirrors(randomMirrors(levels[levelIndex + 1]));
          setUnlocked(false);
        }, 1200);
      }
    }
  }

  function restart() {
    // Нова игра = нови мапи
    const next = pickLevels();
    setLevels(next);
    setLevelIndex(0);
    setMirrors(randomMirrors(next[0]));
    setMoves(0);
    setUnlocked(false);
    session.reset();
  }

  const cols = level[0].length;
  const rows = level.length;
  const S = 10; // големина на една ќелија во SVG

  return (
    <GameLayout game="laser" session={session} moves={moves} onRestart={restart}>
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-heading uppercase text-muted-foreground">
            {txt.level} {levelIndex + 1}/{levels.length}
          </span>
          <span className={cn("font-heading uppercase", beam.hit ? "text-success" : "text-muted-foreground")}>
            {beam.hit ? txt.unlocked : txt.locked}
          </span>
        </div>

        <svg viewBox={`0 0 ${cols * S} ${rows * S}`} className="w-full rounded-xl border border-border bg-background">
          {/* Ќелии, ѕидови, ласер и сензор */}
          {level.map((row, y) =>
            [...row].map((cell, x) => (
              <g key={`${x},${y}`}>
                <rect x={x * S} y={y * S} width={S} height={S} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.3} />
                {cell === "#" && <rect x={x * S + 0.6} y={y * S + 0.6} width={S - 1.2} height={S - 1.2} rx={1} className="fill-muted" />}
                {cell === "S" && (
                  <>
                    <rect x={x * S + 1.5} y={y * S + 3} width={6} height={4} rx={1} className="fill-zinc-500" />
                    <circle cx={x * S + 7.5} cy={y * S + 5} r={1.2} className="fill-red-500" />
                  </>
                )}
                {cell === "T" && (
                  <circle
                    cx={x * S + S / 2}
                    cy={y * S + S / 2}
                    r={3}
                    strokeWidth={0.8}
                    className={cn(beam.hit ? "fill-success stroke-success" : "fill-transparent stroke-primary")}
                  />
                )}
              </g>
            ))
          )}

          {/* Ласерски зрак: широка проѕирна линија за сјај + тенка црвена */}
          <polyline
            points={beam.points.map(([px, py]) => `${px * S},${py * S}`).join(" ")}
            fill="none"
            stroke="#ef4444"
            strokeOpacity={0.25}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <polyline
            points={beam.points.map(([px, py]) => `${px * S},${py * S}`).join(" ")}
            fill="none"
            stroke="#f87171"
            strokeWidth={0.7}
            strokeLinejoin="round"
          />

          {/* Огледала – клик ги врти */}
          {Object.entries(mirrors).map(([key, dir]) => {
            const [x, y] = key.split(",").map(Number);
            return (
              <g
                key={key}
                role="button"
                tabIndex={0}
                aria-label={`${txt.mirror} ${x + 1},${y + 1}`}
                onClick={() => rotate(key)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && rotate(key)}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-primary"
              >
                <rect x={x * S + 0.5} y={y * S + 0.5} width={S - 1} height={S - 1} rx={1.5} fill="transparent" stroke="transparent" strokeWidth={0.5} />
                <line
                  x1={x * S + 2}
                  y1={dir === "/" ? y * S + 8 : y * S + 2}
                  x2={x * S + 8}
                  y2={dir === "/" ? y * S + 2 : y * S + 8}
                  className="stroke-primary"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
        <p className="mt-3 text-center text-xs text-muted-foreground">{txt.hint}</p>
      </div>
    </GameLayout>
  );
}
