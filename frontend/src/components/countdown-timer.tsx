"use client";

// Анимиран тајмер од 60:00 надолу (на почетната страница)
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CountdownTimer({ className }: { className?: string }) {
  const [seconds, setSeconds] = useState(60 * 60);

  useEffect(() => {
    // Кога ќе стигне до 0, почнува одново
    const id = setInterval(() => setSeconds((s) => (s <= 0 ? 3600 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = seconds / 3600; // 1 -> 0

  // Кругот околу тајмерот се празни со времето
  const r = 140;
  const circumference = 2 * Math.PI * r;

  return (
    <div className={cn("relative aspect-square w-full max-w-[340px]", className)}>
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="160" cy="160" r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="6" />
        <circle
          cx="160"
          cy="160"
          r={r}
          fill="none"
          stroke="#d4a017"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          style={{ filter: "drop-shadow(0 0 8px rgb(212 160 23 / 0.6))" }}
        />
        {/* ознаки за минути */}
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1="160"
            y1={i % 5 === 0 ? 8 : 12}
            x2="160"
            y2="18"
            stroke={i % 5 === 0 ? "#d4a017" : "rgb(255 255 255 / 0.2)"}
            strokeWidth={i % 5 === 0 ? 2 : 1}
            transform={`rotate(${i * 6} 160 160)`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="animate-flicker font-heading text-7xl tabular-nums text-primary sm:text-8xl"
          style={{ textShadow: "0 0 24px rgb(212 160 23 / 0.55)" }}
          aria-live="off"
        >
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}
