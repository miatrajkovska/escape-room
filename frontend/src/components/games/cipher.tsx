"use client";

// Шифра: дешифрирај 3 зборови шифрирани со Цезарова шифра
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fill, useLang } from "@/i18n/provider";
import type { Lang } from "@/lib/types";
import { GameLayout, useGameSession } from "./game-shell";
import { shuffle } from "./symbols";

const ALPHABET: Record<Lang, string[]> = {
  mk: [..."АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ"],
  en: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
};

const WORDS: Record<Lang, string[]> = {
  mk: ["КЛУЧ", "ТАЈНА", "ВРАТА", "ШИФРА", "ЗАГАТКА", "ФАРАОН", "ДЕТЕКТИВ", "БЕГСТВО", "ТРАГА", "КАТАНЕЦ"],
  en: ["KEY", "SECRET", "DOOR", "CIPHER", "PUZZLE", "PHARAOH", "DETECTIVE", "ESCAPE", "CLUE", "PADLOCK"],
};

const ROUNDS = 3;

type Puzzle = { word: string; shift: number };

// Секоја буква се поместува за shift места нанапред
function encrypt(word: string, shift: number, alphabet: string[]) {
  return [...word].map((ch) => alphabet[(alphabet.indexOf(ch) + shift) % alphabet.length]).join("");
}

function newPuzzles(lang: Lang): Puzzle[] {
  const n = ALPHABET[lang].length;
  return shuffle(WORDS[lang])
    .slice(0, ROUNDS)
    .map((word) => ({ word, shift: 1 + Math.floor(Math.random() * (n - 2)) }));
}

export function Cipher() {
  const { t, lang } = useLang();
  const txt = t.games.list.cipher;
  const session = useGameSession("cipher");
  const [gameLang, setGameLang] = useState<Lang>(lang);
  const [puzzles, setPuzzles] = useState<Puzzle[]>(() => newPuzzles(lang));
  const [round, setRound] = useState(0);
  const [wheel, setWheel] = useState(0);
  const [answer, setAnswer] = useState("");
  const [moves, setMoves] = useState(0);

  const alphabet = ALPHABET[gameLang];
  const n = alphabet.length;
  const puzzle = puzzles[Math.min(round, ROUNDS - 1)];
  const encrypted = encrypt(puzzle.word, puzzle.shift, alphabet);
  const finished = session.status === "won";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || finished) return;
    if (session.status === "idle") session.start();
    const newMoves = moves + 1;
    setMoves(newMoves);
    if (answer.trim().toUpperCase() === puzzle.word) {
      setAnswer("");
      setWheel(0);
      if (round + 1 >= ROUNDS) {
        setRound(ROUNDS);
        session.win(newMoves);
      } else {
        setRound(round + 1);
      }
    } else {
      toast.error(txt.wrong);
    }
  }

  function restart() {
    setGameLang(lang);
    setPuzzles(newPuzzles(lang));
    setRound(0);
    setWheel(0);
    setAnswer("");
    setMoves(0);
    session.reset();
  }

  function turn(delta: number) {
    if (session.status === "idle") session.start();
    setWheel((w) => (w + delta + n) % n);
  }

  return (
    <GameLayout game="cipher" session={session} moves={moves} onRestart={restart}>
      <div className="mx-auto max-w-2xl">
        {/* Напредок низ рундовите */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{fill(txt.round, { n: Math.min(round + 1, ROUNDS) })}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full ${i < round ? "bg-success" : i === round ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-widest text-muted-foreground">{txt.encrypted}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {[...encrypted].map((ch, i) => (
            <span key={i} className="flex h-14 w-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-heading text-3xl text-primary">
              {ch}
            </span>
          ))}
        </div>

        {/* Тркало: горниот ред е шифрата, долниот е обичната азбука поместена за избраниот број */}
        <div className="mt-8 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase text-muted-foreground">{txt.wheel}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-lg" onClick={() => turn(-1)} aria-label="-1">
                −
              </Button>
              <span className="w-24 text-center font-heading text-lg">
                {txt.shift}: {wheel}
              </span>
              <Button variant="outline" size="icon-lg" onClick={() => turn(1)} aria-label="+1">
                +
              </Button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="inline-grid gap-y-1" style={{ gridTemplateColumns: `repeat(${n}, 1.75rem)` }}>
              {alphabet.map((ch) => (
                <span key={`c${ch}`} className={`text-center font-heading text-base ${encrypted.includes(ch) ? "text-primary" : "text-muted-foreground"}`}>
                  {ch}
                </span>
              ))}
              {alphabet.map((ch, i) => (
                <span key={`p${ch}`} className="border-t border-border pt-1 text-center font-heading text-base">
                  {alphabet[(i - wheel + n) % n]}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center font-heading text-xl tracking-[0.3em] text-foreground/80">
            {encrypted
              .split("")
              .map((ch) => alphabet[(alphabet.indexOf(ch) - wheel + n) % n])
              .join("")}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={txt.answer}
            disabled={finished}
            className="h-11 font-heading text-lg uppercase tracking-widest"
            autoComplete="off"
          />
          <Button type="submit" size="xl" disabled={finished || !answer.trim()}>
            {txt.check}
          </Button>
        </form>
      </div>
    </GameLayout>
  );
}
