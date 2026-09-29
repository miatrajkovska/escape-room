// Сопствени SVG икони – ги користиме наместо емоџи.
// Сите се 24x24, цртани со currentColor за да ја земат бојата од текстот.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const KeyholeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="9.5" r="2.6" fill="currentColor" stroke="none" />
    <path d="M10.8 11.5 9.8 17h4.4l-1-5.5" fill="currentColor" stroke="none" />
  </Svg>
);

export const KeyIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7.5" cy="12" r="4" />
    <circle cx="7.5" cy="12" r="1.3" fill="currentColor" />
    <path d="M11.5 12H21M17.5 12v3M20.5 12v2.2" />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    <path d="M12 16.2v1.8" />
  </Svg>
);

export const HourglassIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M7.5 3c0 4.5 4.5 5.5 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 5.5-4.5 9s4.5 4.5 4.5 9" />
    <path d="M9.5 18.5c1-1 4-1 5 0l.5 2.5H9z" fill="currentColor" stroke="none" opacity="0.8" />
    <path d="M9.6 6.5h4.8L12 9z" fill="currentColor" stroke="none" opacity="0.8" />
  </Svg>
);

export const StopwatchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M10 2.5h4M12 2.5v3.5M18.5 6.5l1.5-1.5" />
    <path d="M12 13.5V9.5" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16.5 14.2c2.6.2 4.5 2.3 4.5 5.3" />
  </Svg>
);

export const TrophyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11" />
    <path d="M12 14v3.5M8.5 21h7M9.5 17.5h5l.5 3.5H9z" />
    <path d="m12 5.8.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" fill="currentColor" stroke="none" />
  </Svg>
);

export const SkullIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5c-4.7 0-8 3.2-8 7.6 0 2.6 1.2 4.4 3 5.4V19a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19v-3.5c1.8-1 3-2.8 3-5.4 0-4.4-3.3-7.6-8-7.6z" />
    <circle cx="8.8" cy="11" r="2" fill="currentColor" />
    <circle cx="15.2" cy="11" r="2" fill="currentColor" />
    <path d="M12 13.5 11 15.5h2zM10 20.5V18M14 20.5V18" />
  </Svg>
);

export const FlaskIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3h6M10 3v6L4.8 18.2A1.9 1.9 0 0 0 6.5 21h11a1.9 1.9 0 0 0 1.7-2.8L14 9V3" />
    <path d="M7.2 15h9.6l2.4 3.2a1.9 1.9 0 0 1-1.7 2.8h-11a1.9 1.9 0 0 1-1.7-2.8z" fill="currentColor" stroke="none" opacity="0.35" />
    <circle cx="10.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="13.8" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const BarsIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3" width="17" height="18" rx="1.5" />
    <path d="M8 3v18M12 3v18M16 3v18M3.5 8.5h17" />
  </Svg>
);

export const PyramidIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 3 9 20" />
    <path d="M12 3l9.5 17H9z" fill="currentColor" stroke="none" opacity="0.25" />
    <circle cx="19" cy="5" r="1.8" />
  </Svg>
);

export const EyeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 11.5C5 7.5 8.3 5.5 12 5.5s7 2 9.5 6c-2.5 4-5.8 6-9.5 6s-7-2-9.5-6z" />
    <circle cx="12" cy="11.5" r="3" fill="currentColor" />
    <path d="M9.5 17.3 8 21M12 17.5v3.5" />
  </Svg>
);

export const MagnifierIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="m15 15 6 6" strokeWidth={2.6} />
    <path d="M7 8.2a3.4 3.4 0 0 1 3-2.2" />
  </Svg>
);

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="currentColor" />
  </Svg>
);

export const MoonIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" fill="currentColor" fillOpacity="0.25" />
    <path d="m17 4 .6 1.4L19 6l-1.4.6L17 8l-.6-1.4L15 6l1.4-.6z" fill="currentColor" stroke="none" />
  </Svg>
);

export const PuzzleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h3.5a2 2 0 1 1 4 0H15v3.5a2 2 0 1 1 0 4V18h-3.5a2 2 0 1 0-4 0H4v-3.5a2 2 0 1 0 0-4z" />
  </Svg>
);

export const BulbIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 17.5h6M10 21h4" />
    <path d="M8.5 14.5a6 6 0 1 1 7 0c-.7.6-1 1.3-1 2V17.5h-5V16.5c0-.7-.3-1.4-1-2z" />
    <path d="M12 7.5v3l1.5 1.5" />
  </Svg>
);

export const GiftIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
    <path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21" />
    <path d="M12 8.5C10.5 4 6.5 4.5 7 7c.3 1.2 2.5 1.5 5 1.5zM12 8.5c1.5-4.5 5.5-4 5-1.5-.3 1.2-2.5 1.5-5 1.5z" />
  </Svg>
);

export const CakeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
    <path d="M5 16c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0" />
    <path d="M12 12V8.5" />
    <path d="M12 3.5c1 1.2 1.2 2.3 0 3.2-1.2-.9-1-2 0-3.2z" fill="currentColor" />
  </Svg>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 12.5h18" />
    <rect x="10.5" y="11" width="3" height="3" rx="0.6" fill="currentColor" />
  </Svg>
);

export const TicketIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3z" />
    <path d="M14 6v2M14 11v2M14 16v2" strokeDasharray="0" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" fill="currentColor" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5z" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" />
  </Svg>
);

export const DoorIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21" />
    <circle cx="15" cy="12.5" r="1" fill="currentColor" />
    <path d="M9 7h6" opacity="0.5" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </Svg>
);

export const CookieIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 12.5A8.5 8.5 0 1 1 11.5 3.5a3 3 0 0 0 4 3.5 3 3 0 0 0 5 5.5z" />
    <circle cx="8.5" cy="10" r="1.1" fill="currentColor" />
    <circle cx="14" cy="15.5" r="1.1" fill="currentColor" />
    <circle cx="9" cy="15.5" r="0.8" fill="currentColor" />
  </Svg>
);

export const BrainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5A3 3 0 0 0 6.5 4a3 3 0 0 0-3 4.5 3.5 3.5 0 0 0 .5 6 3 3 0 0 0 3.5 4.5A3 3 0 0 0 12 19z" />
    <path d="M12 5.5A3 3 0 0 1 17.5 4a3 3 0 0 1 3 4.5 3.5 3.5 0 0 1-.5 6 3 3 0 0 1-3.5 4.5A3 3 0 0 1 12 19z" />
    <path d="M12 5.5V19M8 9.5c1 0 2 .5 2 1.5M16 9.5c-1 0-2 .5-2 1.5M8 14.5h2M14 14.5h2" />
  </Svg>
);

export const QuoteIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 17.5c0-4.5 1.5-8 5.5-10l.8 1.4C8 10.5 7.5 12 7.5 13.2H10v4.3zM13.5 17.5c0-4.5 1.5-8 5.5-10l.8 1.4c-2.3 1.6-2.8 3.1-2.8 4.3h2.5v4.3z" fill="currentColor" stroke="none" />
  </Svg>
);

export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" fill="currentColor" />
    <path d="M19 16c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5z" fill="currentColor" stroke="none" />
  </Svg>
);

export const CipherIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.9 2.9M15.5 15.5l2.9 2.9" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);

export const CardsIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="10" height="14" rx="1.5" transform="rotate(-8 8 13)" />
    <rect x="11" y="4" width="10" height="14" rx="1.5" />
    <path d="m16 8.5 1.4 2.5L16 13.5 14.6 11z" fill="currentColor" />
  </Svg>
);

export const ScrollIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2-2v-1h3" />
    <path d="M7 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2V7" />
    <path d="M11 9h5M11 12.5h5M11 16h3" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.7 2.7L16.2 9.5" />
  </Svg>
);

export const MedalIcon = ({ place, ...p }: IconProps & { place: 1 | 2 | 3 }) => {
  const color = { 1: "#f3c93f", 2: "#c9ced6", 3: "#d08a4e" }[place];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path d="M7 2h4l2 6H9z" fill="#b33a3a" />
      <path d="M17 2h-4l-2 6h4z" fill="#8e2a2a" />
      <circle cx="12" cy="15" r="7" fill={color} />
      <circle cx="12" cy="15" r="5.2" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="1" />
      <text x="12" y="18.3" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#2a1f05" fontFamily="sans-serif">
        {place}
      </text>
    </svg>
  );
};

// Логото: клучалка во златен круг
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7dc8c" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logo-gold)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="url(#logo-gold)" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="20" cy="16.5" r="4.2" fill="url(#logo-gold)" />
      <path d="M18 19.5 16.5 28h7L22 19.5z" fill="url(#logo-gold)" />
    </svg>
  );
}

// Иконата што одговара на темата на собата
export const themeIcon = {
  lab: FlaskIcon,
  prison: BarsIcon,
  tomb: PyramidIcon,
  detective: MagnifierIcon,
  other: PuzzleIcon, // за нови соби без посебна илустрација
} as const;
