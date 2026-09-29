"use client";

// Рачно цртани SVG илустрации за секоја соба (и насловни слики за блогот)
import { useId } from "react";
import { cn } from "@/lib/utils";
import { BulbIcon, PuzzleIcon, TrophyIcon } from "./icons";

type Props = { theme: string; className?: string };
type SceneProps = { id: string; theme: string };

export function RoomArt({ theme, className }: Props) {
  const id = useId().replace(/:/g, "");
  const Scene = scenes[theme as keyof typeof scenes] ?? IconScene;
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={theme}
    >
      <Scene id={id} theme={theme} />
    </svg>
  );
}

function Lab({ id }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2226" />
          <stop offset="1" stopColor="#081013" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.65" r="0.5">
          <stop offset="0" stopColor="#5dff9a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5dff9a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}liq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dffb0" />
          <stop offset="1" stopColor="#1f9e57" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}bg)`} />
      <rect width="400" height="240" fill={`url(#${id}glow)`} />
      {/* полици */}
      <g stroke="#1f4a4f" strokeWidth="3">
        <path d="M20 70h110M270 60h110M270 120h110" />
      </g>
      <g fill="#2f6b70" opacity="0.8">
        <rect x="30" y="45" width="12" height="25" rx="2" />
        <rect x="50" y="38" width="16" height="32" rx="3" />
        <rect x="75" y="50" width="10" height="20" rx="2" />
        <rect x="280" y="35" width="14" height="25" rx="2" />
        <rect x="300" y="42" width="10" height="18" rx="2" />
        <rect x="340" y="95" width="18" height="25" rx="3" />
        <rect x="290" y="100" width="12" height="20" rx="2" />
      </g>
      {/* биохазард знак */}
      <g transform="translate(330 175)" fill="none" stroke="#d4a017" strokeWidth="3" opacity="0.55">
        <circle r="22" />
        <circle r="6" />
        <path d="M0-6v-14M5 3l12 7M-5 3l-12 7" />
      </g>
      {/* голема колба */}
      <path d="M180 60h40v50l40 90a12 12 0 0 1-11 17H151a12 12 0 0 1-11-17l40-90z" fill="#bff5ff" fillOpacity="0.08" stroke="#9fe" strokeOpacity="0.6" strokeWidth="3" />
      <path d="M160 160h80l20 40a12 12 0 0 1-11 17H151a12 12 0 0 1-11-17z" fill={`url(#${id}liq)`} opacity="0.9" />
      <rect x="174" y="52" width="52" height="10" rx="4" fill="#9fe" opacity="0.6" />
      <g fill="#c8ffe0">
        <circle cx="185" cy="185" r="5" opacity="0.8" />
        <circle cx="210" cy="175" r="3.5" opacity="0.8" />
        <circle cx="222" cy="195" r="4" opacity="0.7" />
        <circle cx="200" cy="140" r="3" opacity="0.5" />
        <circle cx="206" cy="115" r="2.5" opacity="0.35" />
      </g>
      {/* епрувети */}
      <g transform="translate(40 150)">
        <rect x="0" y="40" width="90" height="8" rx="2" fill="#1f4a4f" />
        {[10, 35, 60].map((x, i) => (
          <g key={x}>
            <rect x={x} y="0" width="14" height="50" rx="7" fill="none" stroke="#9fe" strokeOpacity="0.5" strokeWidth="2" />
            <rect x={x + 2} y={20 + i * 6} width="10" height={28 - i * 6} rx="5" fill={["#ff6b6b", "#5dff9a", "#d4a017"][i]} opacity="0.8" />
          </g>
        ))}
      </g>
    </>
  );
}

function Prison({ id }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1d27" />
          <stop offset="1" stopColor="#0c0d12" />
        </linearGradient>
        <linearGradient id={`${id}beam`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#cfe0ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}brick`} width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 0h40M0 10h40M20 0v10M0 10v10M40 10v10" stroke="#2a2e3b" strokeWidth="1.5" fill="none" />
        </pattern>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}bg)`} />
      <rect width="400" height="240" fill={`url(#${id}brick)`} opacity="0.8" />
      {/* прозорче со месечина */}
      <rect x="250" y="30" width="80" height="60" fill="#0d1a33" stroke="#3a3f4f" strokeWidth="4" />
      <circle cx="300" cy="55" r="14" fill="#f3efd9" />
      <circle cx="306" cy="51" r="12" fill="#0d1a33" />
      <g stroke="#555b6e" strokeWidth="4">
        <path d="M270 30v60M290 30v60M310 30v60" />
      </g>
      <path d="M250 90h80l40 150H170z" fill={`url(#${id}beam)`} />
      {/* кревет */}
      <rect x="30" y="170" width="120" height="16" rx="3" fill="#3a3f4f" />
      <rect x="30" y="160" width="40" height="12" rx="5" fill="#8a8fa0" opacity="0.6" />
      {/* катанец */}
      <g transform="translate(345 150)">
        <path d="M-10 0v-10a10 10 0 0 1 20 0V0" fill="none" stroke="#d4a017" strokeWidth="4" />
        <rect x="-15" y="0" width="30" height="24" rx="4" fill="#d4a017" />
        <circle cy="10" r="3" fill="#3a2a05" />
      </g>
      {/* решетки напред */}
      <g stroke="#6b7080" strokeWidth="7" strokeLinecap="round">
        {[20, 70, 120, 170, 220, 270, 320, 370].map((x) => (
          <path key={x} d={`M${x} 0v240`} />
        ))}
      </g>
      <path d="M0 110h400" stroke="#6b7080" strokeWidth="8" />
      <text x="385" y="228" textAnchor="end" fontFamily="Oswald, sans-serif" fontSize="22" fill="#d4a017" opacity="0.8">
        13
      </text>
    </>
  );
}

function Tomb({ id }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1606" />
          <stop offset="0.6" stopColor="#5a3310" />
          <stop offset="1" stopColor="#8a5a1f" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd76a" />
          <stop offset="1" stopColor="#ffd76a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}bg)`} />
      <circle cx="200" cy="90" r="80" fill={`url(#${id}sun)`} opacity="0.5" />
      {/* пирамиди */}
      <path d="M200 40 320 190H80z" fill="#c8913e" />
      <path d="M200 40 320 190H200z" fill="#8e5f22" />
      <path d="M70 110 140 190H0z" fill="#a8742f" opacity="0.8" />
      <path d="M340 120 400 190H280z" fill="#a8742f" opacity="0.8" />
      {/* око на Хорус */}
      <g transform="translate(200 120)" fill="none" stroke="#2b1606" strokeWidth="3.5" strokeLinecap="round">
        <path d="M-24 0c10-12 38-12 48 0-10 10-38 10-48 0z" />
        <circle r="6" fill="#2b1606" />
        <path d="M-4 8-8 22M8 7c6 6 10 6 16 2" />
      </g>
      {/* хиероглифи */}
      <g fill="#d4a017" opacity="0.7">
        {[20, 50, 350, 375].map((x, i) => (
          <g key={x} transform={`translate(${x} 30)`}>
            <circle cx="0" cy={i * 3} r="5" />
            <rect x="-5" y={16 + i * 2} width="10" height="3" />
            <path d={`M-6 ${32} l6 -8 6 8z`} />
            <rect x="-2" y="44" width="4" height="14" />
          </g>
        ))}
      </g>
      {/* песок */}
      <path d="M0 200c60-20 120-10 200 0s150 10 200-5v45H0z" fill="#d6a55a" />
      <path d="M0 220c80-15 160 5 250-5s110-5 150 5v20H0z" fill="#b8843f" />
    </>
  );
}

function Detective({ id }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1510" />
          <stop offset="1" stopColor="#0f0a07" />
        </linearGradient>
        <linearGradient id={`${id}lamp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}bg)`} />
      {/* табла со докази */}
      <rect x="30" y="20" width="200" height="120" rx="4" fill="#6b4a2b" />
      <rect x="36" y="26" width="188" height="108" fill="#8a6440" />
      <g fill="#efe6d2">
        <rect x="50" y="36" width="40" height="32" transform="rotate(-5 70 52)" />
        <rect x="120" y="40" width="36" height="44" transform="rotate(4 138 62)" />
        <rect x="175" y="45" width="36" height="28" transform="rotate(-3 193 59)" />
        <rect x="70" y="88" width="46" height="34" transform="rotate(3 93 105)" />
        <rect x="150" y="96" width="40" height="30" transform="rotate(-6 170 111)" />
      </g>
      <path d="M70 50 138 60 193 58 170 110 93 104z" fill="none" stroke="#c0392b" strokeWidth="2" />
      <g fill="#c0392b">
        <circle cx="70" cy="50" r="4" />
        <circle cx="138" cy="60" r="4" />
        <circle cx="193" cy="58" r="4" />
        <circle cx="170" cy="110" r="4" />
        <circle cx="93" cy="104" r="4" />
      </g>
      <text x="130" y="68" fontFamily="Oswald, sans-serif" fontSize="16" fill="#2b1d10" textAnchor="middle">?</text>
      {/* ламба */}
      <path d="M300 50 250 200h120z" fill={`url(#${id}lamp)`} />
      <path d="M285 38h30l12 16h-54z" fill="#1f5c3a" />
      <path d="M300 38V10" stroke="#555" strokeWidth="3" />
      {/* маса */}
      <rect x="0" y="195" width="400" height="45" fill="#3a2515" />
      <rect x="0" y="195" width="400" height="5" fill="#5a3a22" />
      {/* шапка */}
      <g transform="translate(90 185)">
        <ellipse cx="0" cy="8" rx="46" ry="9" fill="#2a2a2a" />
        <path d="M-28 8c0-26 6-34 28-34s28 8 28 34z" fill="#3a3a3a" />
        <rect x="-28" y="-4" width="56" height="7" fill="#7a1f1f" />
      </g>
      {/* лупа */}
      <g transform="translate(300 175) rotate(-30)">
        <circle r="24" fill="#ffd98a" fillOpacity="0.15" stroke="#d4a017" strokeWidth="6" />
        <rect x="-5" y="24" width="10" height="38" rx="4" fill="#5a3a22" />
      </g>
    </>
  );
}

// За блог насловни што немаат своја сцена: градиент + голема икона
function IconScene({ id, theme }: SceneProps) {
  const Icon = { tips: BulbIcon, team: TrophyIcon, games: PuzzleIcon }[theme] ?? PuzzleIcon;
  return (
    <>
      <defs>
        <radialGradient id={`${id}bg`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#3a2c08" />
          <stop offset="1" stopColor="#0f0f14" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}bg)`} />
      <g stroke="#d4a017" strokeOpacity="0.12">
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx="200" cy="120" r={30 + i * 22} fill="none" />
        ))}
      </g>
      <Icon x="140" y="60" width="120" height="120" color="#d4a017" strokeWidth={1.2} />
    </>
  );
}

const scenes = { lab: Lab, prison: Prison, tomb: Tomb, detective: Detective };
