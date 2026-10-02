// Типови на податоците што ги враќа backend-от

export type Lang = "mk" | "en";

export type User = { id: number; name: string; email: string; phone: string; is_admin: boolean };

export type Room = {
  id: number;
  slug: string;
  name_mk: string;
  name_en: string;
  tagline_mk: string;
  tagline_en: string;
  description_mk: string;
  description_en: string;
  highlights_mk: string[];
  highlights_en: string[];
  difficulty: 1 | 2 | 3;
  min_players: number;
  max_players: number;
  duration_min: number;
  min_age: number;
  success_rate: number;
  theme: RoomTheme;
  best_time: number | null;
};

export type RoomTheme = "lab" | "prison" | "tomb" | "detective" | "other";

export type Slot = { time: string; available: boolean };
export type CalendarDay = { date: string; free: number; total: number };

export type Pricing = {
  table: Record<string, number>;
  weekend_surcharge: number;
  slot_times: string[];
  booking_window_days: number;
};

export type Booking = {
  id: number;
  code: string;
  room_slug: string;
  room_name_mk: string;
  room_name_en: string;
  room_theme: RoomTheme;
  date: string;
  time: string;
  players: number;
  price: number;
  customer_name: string;
  phone: string;
  email: string;
  notes: string;
  status: "confirmed" | "completed" | "cancelled";
  can_cancel: boolean; // до 24 ч. пред терминот
  created_at: string;
};

export type LeaderboardRow = {
  id: number;
  rank: number;
  team_name: string;
  players: number;
  time_seconds: number;
  hints_used: number;
  played_on: string;
  room_slug: string;
};

export type GameId = "codebreaker" | "laser" | "lights";

// Мои резултати по игра: најдобро време, број на победи и вкупно одиграни
export type MyGameStats = Record<
  GameId,
  { best: { time_seconds: number; moves: number } | null; won: number; played: number; rank: number | null }
>;

export type GameRow = {
  rank: number;
  player: string;
  user_id: number;
  time_seconds: number;
  moves: number;
  created_at: string;
};

export type Post = {
  slug: string;
  category: "news" | "tips" | "event";
  cover: string;
  title_mk: string;
  title_en: string;
  excerpt_mk: string;
  excerpt_en: string;
  published_at: string;
  body_mk?: string;
  body_en?: string;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

// Соба во админ прегледот (со статистика)
export type AdminRoom = Room & { upcoming_bookings: number; revenue: number };

export type AdminStats = {
  users: number;
  upcoming_bookings: number;
  today_bookings: number;
  revenue_completed: number;
  unread_messages: number;
  game_plays: number;
};
