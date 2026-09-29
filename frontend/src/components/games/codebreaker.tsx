"use client";

// Codebreaker: погоди ја тајната комбинација од 4 симболи (како Mastermind)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { GameLayout, useGameSession } from "./game-shell";
import { GameSymbol, type SymbolId } from "./symbols";

const CHOICES: SymbolId[] = ["key", "skull", "eye", "star", "moon", "flask"];
const LENGTH = 4;
const MAX_TRIES = 10;

type Row = { guess: SymbolId[]; exact: number; near: number };

function randomSecret(): SymbolId[] {
  return Array.from({ length: LENGTH }, () => CHOICES[Math.floor(Math.random() * CHOICES.length)]);
}

// Колку се на точно место (exact) и колку се точни, но на погрешно место (near)
function score(secret: SymbolId[], guess: SymbolId[]) {
  let exact = 0;
  const restSecret: SymbolId[] = [];
  const restGuess: SymbolId[] = [];
  secret.forEach((s, i) => {
    if (s === guess[i]) exact++;
    else {
      restSecret.push(s);
      restGuess.push(guess[i]);
    }
  });
  let near = 0;
  for (const g of restGuess) {
    const idx = restSecret.indexOf(g);
    if (idx !== -1) {
      near++;
      restSecret.splice(idx, 1);
    }
  }
  return { exact, near };
}

export function Codebreaker() {
  const { t } = useLang();
  const session = useGameSession("codebreaker");
  const [secret, setSecret] = useState<SymbolId[]>(randomSecret);
  const [rows, setRows] = useState<Row[]>([]);
  const [current, setCurrent] = useState<SymbolId[]>([]);
  const txt = t.games.list.codebreaker;
  const finished = session.status === "won" || session.status === "lost";

  function add(id: SymbolId) {
    if (finished || current.length >= LENGTH) return;
    if (session.status === "idle") session.start(); // тајмерот почнува со првиот клик
    setCurrent([...current, id]);
  }

  function check() {
    if (current.length !== LENGTH) return;
    const result = score(secret, current);
    const newRows = [...rows, { guess: current, ...result }];
    setRows(newRows);
    setCurrent([]);
    if (result.exact === LENGTH) session.win(newRows.length);
    else if (newRows.length >= MAX_TRIES) session.lose();
  }

  function restart() {
    setSecret(randomSecret());
    setRows([]);
    setCurrent([]);
    session.reset();
  }

  return (
    <GameLayout
      game="codebreaker"
      session={session}
      moves={rows.length}
      onRestart={restart}
      extraResult={
        session.status === "lost" && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{txt.secret}</p>
            <div className="mt-2 flex justify-center gap-2">
              {secret.map((s, i) => (
                <GameSymbol key={i} id={s} className="size-8" />
              ))}
            </div>
          </div>
        )
      }
    >
      <div className="mx-auto max-w-md">
        {/* Претходни обиди */}
        <div className="space-y-2">
          {Array.from({ length: MAX_TRIES }, (_, i) => {
            const row = rows[i];
            const isCurrent = i === rows.length && !finished;
            const symbols = row ? row.guess : isCurrent ? current : [];
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2",
                  isCurrent ? "border-primary/60 bg-primary/5" : "border-border bg-background/50"
                )}
              >
                <span className="w-5 text-right font-heading text-sm text-muted-foreground">{i + 1}</span>
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: LENGTH }, (_, j) => (
                    <div key={j} className="flex size-10 items-center justify-center rounded-lg bg-muted/60">
                      {symbols[j] && <GameSymbol id={symbols[j]} className="size-6" />}
                    </div>
                  ))}
                </div>
                {/* Индикатори: златни = точно место, сиви = погрешно место */}
                <div className="grid grid-cols-2 gap-1">
                  {Array.from({ length: LENGTH }, (_, j) => {
                    const kind = row ? (j < row.exact ? "exact" : j < row.exact + row.near ? "near" : "none") : "none";
                    return (
                      <span
                        key={j}
                        className={cn(
                          "size-3 rounded-full border",
                          kind === "exact" && "border-primary bg-primary",
                          kind === "near" && "border-zinc-300 bg-zinc-300",
                          kind === "none" && "border-border"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Избор на симболи */}
        <div className="mt-6 grid grid-cols-6 gap-2">
          {CHOICES.map((id) => (
            <button
              key={id}
              onClick={() => add(id)}
              disabled={finished}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-background transition hover:scale-105 hover:border-primary/60 disabled:opacity-40"
              aria-label={id}
            >
              <GameSymbol id={id} className="size-7" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="xl" className="flex-1" onClick={() => setCurrent(current.slice(0, -1))} disabled={finished || current.length === 0}>
            {txt.clear}
          </Button>
          <Button size="xl" className="flex-1" onClick={check} disabled={finished || current.length !== LENGTH}>
            {txt.guess}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
