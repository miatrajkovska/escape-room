"use client";

// Меморија: најди ги сите 8 парови симболи
import { useState } from "react";
import { KeyholeIcon } from "@/components/icons";
import { GameLayout, useGameSession } from "./game-shell";
import { GameSymbol, SYMBOLS, shuffle, type SymbolId } from "./symbols";

type Card = { key: number; symbol: SymbolId; matched: boolean };

function newDeck(): Card[] {
  const eight = SYMBOLS.slice(0, 8).map((s) => s.id);
  return shuffle([...eight, ...eight]).map((symbol, key) => ({ key, symbol, matched: false }));
}

export function Memory() {
  const session = useGameSession("memory");
  const [cards, setCards] = useState<Card[]>(newDeck);
  const [open, setOpen] = useState<number[]>([]); // индекси на отворените (најмногу 2)
  const [moves, setMoves] = useState(0);

  function flip(index: number) {
    if (session.status === "won") return;
    if (open.length === 2 || open.includes(index) || cards[index].matched) return;
    if (session.status === "idle") session.start();

    const nowOpen = [...open, index];
    setOpen(nowOpen);
    if (nowOpen.length < 2) return;

    const [a, b] = nowOpen;
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (cards[a].symbol === cards[b].symbol) {
      const updated = cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
      setCards(updated);
      setOpen([]);
      if (updated.every((c) => c.matched)) session.win(newMoves);
    } else {
      // Не се пар – затвори ги по кратко време
      setTimeout(() => setOpen([]), 800);
    }
  }

  function restart() {
    setCards(newDeck());
    setOpen([]);
    setMoves(0);
    session.reset();
  }

  return (
    <GameLayout game="memory" session={session} moves={moves} onRestart={restart}>
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card, i) => {
          const flipped = card.matched || open.includes(i);
          return (
            <button
              key={card.key}
              onClick={() => flip(i)}
              className="flip-card aspect-square"
              data-flipped={flipped}
              aria-label={flipped ? card.symbol : "?"}
            >
              <div className="flip-inner relative h-full w-full">
                {/* Задна страна (затворена) */}
                <div className="flip-face absolute inset-0 flex items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-[#2a2412] to-[#15130c]">
                  <KeyholeIcon className="size-8 text-primary/50" />
                </div>
                {/* Предна страна (симбол) */}
                <div
                  className={`flip-face flip-back absolute inset-0 flex items-center justify-center rounded-xl border bg-background ${
                    card.matched ? "border-success/60" : "border-border"
                  }`}
                >
                  <GameSymbol id={card.symbol} className="size-10 sm:size-12" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GameLayout>
  );
}
