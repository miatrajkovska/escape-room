# Демо податоци за тестирање.
# Се внесуваат автоматски при старт ако базата е празна.
# Рачно ресетирање:  python -m app.seed --reset
import random
import sys
from datetime import datetime, time, timedelta, timezone

from sqlalchemy import func, select

from .auth import hash_password
from .db import Base, SessionLocal, engine
from .models import BlogPost, Booking, ContactMessage, GameScore, LeaderboardEntry, Room, User
from .pricing import SLOT_TIMES, calc_price, local_now

ROOMS = [
    {
        "slug": "laboratorija",
        "theme": "lab",
        "name_mk": "Лабораторијата",
        "name_en": "The Laboratory",
        "tagline_mk": "Научникот исчезна. Вирусот е на слобода.",
        "tagline_en": "The scientist is gone. The virus is loose.",
        "description_mk": (
            "Д-р Марковски работеше на противотров кога светлата се изгаснаа. Утредента лабораторијата беше "
            "празна, а една епрувета недостасуваше. Имате 60 минути да ги следите неговите белешки, да ја "
            "составите формулата и да ја запечатите лабораторијата пред вирусот да излезе надвор."
        ),
        "description_en": (
            "Dr. Markovski was working on an antidote when the lights went out. The next morning the lab was "
            "empty and one vial was missing. You have 60 minutes to follow his notes, assemble the formula and "
            "seal the lab before the virus gets out."
        ),
        "highlights_mk": "Хемиски загатки со вистински реакции|UV светло и скриени пораки|Најтешката соба кај нас",
        "highlights_en": "Chemistry puzzles with real reactions|UV light and hidden messages|Our hardest room",
        "difficulty": 3,
        "min_players": 2,
        "max_players": 5,
        "duration_min": 60,
        "min_age": 14,
        "success_rate": 31,
        "sort_order": 1,
    },
    {
        "slug": "kelija-13",
        "theme": "prison",
        "name_mk": "Ќелија 13",
        "name_en": "Cell 13",
        "tagline_mk": "Затворени сте неправедно. Стражарите се враќаат.",
        "tagline_en": "Wrongly imprisoned. The guards are coming back.",
        "description_mk": (
            "Осудени сте за злосторство што не сте го направиле. Стариот затвореник од ќелија 12 ви остави "
            "план за бегство, но само половина од него. Стражарите ја менуваат смената за 60 минути. "
            "Дотогаш мора да бидете надвор."
        ),
        "description_en": (
            "You've been convicted of a crime you didn't commit. The old prisoner from cell 12 left you an "
            "escape plan, but only half of it. The guards change shifts in 60 minutes. By then you must be out."
        ),
        "highlights_mk": "Тимот почнува поделен во две ќелии|Катанци, тунели и тајни ѕидови|Одлична за тимбилдинг",
        "highlights_en": "The team starts split into two cells|Padlocks, tunnels and secret walls|Great for team building",
        "difficulty": 2,
        "min_players": 2,
        "max_players": 6,
        "duration_min": 60,
        "min_age": 12,
        "success_rate": 54,
        "sort_order": 2,
    },
    {
        "slug": "grobnica",
        "theme": "tomb",
        "name_mk": "Гробницата на фараонот",
        "name_en": "The Pharaoh's Tomb",
        "tagline_mk": "Древно проклетство. Скриено богатство.",
        "tagline_en": "An ancient curse. A hidden treasure.",
        "description_mk": (
            "Археолошката експедиција 1923 година никогаш не се врати. Вие сте првите што влегуваат во "
            "гробницата по 100 години. Хиероглифите чуваат тајна, а песочниот часовник веќе тече. "
            "Најдете го богатството и излезете пред гробницата да се затвори засекогаш."
        ),
        "description_en": (
            "The 1923 archaeological expedition never returned. You are the first to enter the tomb in 100 "
            "years. The hieroglyphs guard a secret and the hourglass is already running. Find the treasure and "
            "get out before the tomb seals forever."
        ),
        "highlights_mk": "Најголемата соба – 75 минути|Механички загатки без катанци|Совршена за роденденски забави",
        "highlights_en": "Our largest room – 75 minutes|Mechanical puzzles, no padlocks|Perfect for birthday parties",
        "difficulty": 2,
        "min_players": 3,
        "max_players": 6,
        "duration_min": 75,
        "min_age": 12,
        "success_rate": 47,
        "sort_order": 3,
    },
    {
        "slug": "detektivska-kancelarija",
        "theme": "detective",
        "name_mk": "Детективската канцеларија",
        "name_en": "The Detective's Office",
        "tagline_mk": "Решете го случајот пред да избега убиецот.",
        "tagline_en": "Solve the case before the killer escapes.",
        "description_mk": (
            "Скопје, 1952. Детективот Јованов исчезна една ноќ пред да го открие убиецот. Сите докази се "
            "во неговата канцеларија – писма, фотографии и еден заклучен сеф. Поврзете ги трагите и "
            "откријте кој е виновникот пред да го напушти градот."
        ),
        "description_en": (
            "Skopje, 1952. Detective Jovanov vanished the night before he could name the killer. All the "
            "evidence is in his office – letters, photos and one locked safe. Connect the clues and find the "
            "culprit before they leave town."
        ),
        "highlights_mk": "Идеална за почетници|За деца над 10 години со возрасен|Класична детективска атмосфера",
        "highlights_en": "Ideal for first-timers|Kids 10+ with an adult|Classic noir atmosphere",
        "difficulty": 1,
        "min_players": 2,
        "max_players": 4,
        "duration_min": 60,
        "min_age": 10,
        "success_rate": 78,
        "sort_order": 4,
    },
]

POSTS = [
    {
        "slug": "nova-soba-grobnica",
        "category": "news",
        "cover": "tomb",
        "days_ago": 6,
        "title_mk": "Отворена е новата соба: Гробницата на фараонот",
        "title_en": "New room now open: The Pharaoh's Tomb",
        "excerpt_mk": "Нашата најголема соба досега – 75 минути, механички загатки и древно проклетство.",
        "excerpt_en": "Our biggest room yet – 75 minutes, mechanical puzzles and an ancient curse.",
        "body_mk": (
            "По шест месеци градење, Гробницата на фараонот е конечно отворена!\n\n"
            "Ова е нашата прва соба без ниту еден катанец. Сите загатки се механички – ќе туркате, "
            "вртите и подредувате древни предмети за да ги отворите тајните врати.\n\n"
            "Собата е за 3 до 6 играчи и трае 75 минути. Во првиот месец секој тим добива бесплатна "
            "фотографија од излегувањето."
        ),
        "body_en": (
            "After six months of building, The Pharaoh's Tomb is finally open!\n\n"
            "This is our first room without a single padlock. Every puzzle is mechanical – you will push, "
            "turn and arrange ancient objects to open the secret doors.\n\n"
            "The room is for 3 to 6 players and lasts 75 minutes. During the first month every team gets a "
            "free exit photo."
        ),
    },
    {
        "slug": "5-soveti-za-pocetnici",
        "category": "tips",
        "cover": "tips",
        "days_ago": 18,
        "title_mk": "5 совети за вашата прва escape room",
        "title_en": "5 tips for your first escape room",
        "excerpt_mk": "Разговарајте, пребарувајте сè и не се срамете да побарате помош.",
        "excerpt_en": "Talk, search everything and don't be shy about asking for a hint.",
        "body_mk": (
            "1. Зборувајте гласно. Кажете што сте нашле, дури и ако ви изгледа неважно.\n\n"
            "2. Поделете се. Двајца пребаруваат, двајца решаваат загатки.\n\n"
            "3. Собирајте ги предметите на едно место за да не ги барате повторно.\n\n"
            "4. Не користете сила. Ништо во собата не бара кршење.\n\n"
            "5. Побарајте совет кога ќе заглавите повеќе од 5 минути. Тоа не е срамота!"
        ),
        "body_en": (
            "1. Talk out loud. Say what you found, even if it seems unimportant.\n\n"
            "2. Split up. Two people search, two solve puzzles.\n\n"
            "3. Keep found items in one place so you don't search for them twice.\n\n"
            "4. Don't use force. Nothing in the room needs to be broken.\n\n"
            "5. Ask for a hint when you're stuck for more than 5 minutes. No shame in that!"
        ),
    },
    {
        "slug": "rekord-laboratorija",
        "category": "news",
        "cover": "lab",
        "days_ago": 27,
        "title_mk": "Нов рекорд во Лабораторијата: 38 минути!",
        "title_en": "New Laboratory record: 38 minutes!",
        "excerpt_mk": "Тимот „Бинарни Бегалци“ ја скрши лабораторијата без ниту еден совет.",
        "excerpt_en": "Team “Binary Runaways” cracked the lab without a single hint.",
        "body_mk": (
            "Само 31% од тимовите успеваат да излезат од Лабораторијата. Тимот „Бинарни Бегалци“ "
            "излезе за 38 минути и 12 секунди – без ниту еден совет!\n\n"
            "Честитки! Можете ли да го соборите рекордот? Погледнете ја табелата со најбрзи тимови."
        ),
        "body_en": (
            "Only 31% of teams escape The Laboratory. Team “Binary Runaways” got out in 38 minutes and "
            "12 seconds – without a single hint!\n\n"
            "Congratulations! Can you beat the record? Check the leaderboard."
        ),
    },
    {
        "slug": "timbilding-paketi",
        "category": "event",
        "cover": "team",
        "days_ago": 41,
        "title_mk": "Тимбилдинг пакети за фирми",
        "title_en": "Team building packages for companies",
        "excerpt_mk": "Резервирајте ги сите четири соби истовремено за тим до 21 човек.",
        "excerpt_en": "Book all four rooms at once for teams of up to 21 people.",
        "body_mk": (
            "Сè повеќе фирми не избираат за тимбилдинг. Сега нудиме пакет каде што ги резервирате "
            "сите соби истовремено, а по играта имате 30 минути во нашиот лаунџ со пијалоци.\n\n"
            "На крај тимовите ги споредуваат времињата и победникот добива пехар."
        ),
        "body_en": (
            "More and more companies choose us for team building. We now offer a package where you book "
            "every room at the same time, followed by 30 minutes in our lounge with drinks.\n\n"
            "At the end, the teams compare times and the winners get a trophy."
        ),
    },
    {
        "slug": "onlajn-igri",
        "category": "news",
        "cover": "games",
        "days_ago": 2,
        "title_mk": "Вежбајте дома: нови онлајн мини-игри",
        "title_en": "Practice at home: new online mini-games",
        "excerpt_mk": "Codebreaker, Меморија и Шифра – со листа на најдобри играчи.",
        "excerpt_en": "Codebreaker, Memory and Cipher – with a live leaderboard.",
        "body_mk": (
            "Додадовме три кратки онлајн игри на нашата страница. Направете профил, играјте и "
            "појавете се на листата на најдобри играчи.\n\n"
            "Секој месец најбрзиот играч добива ваучер за бесплатна игра!"
        ),
        "body_en": (
            "We added three short online games to our website. Create an account, play and get on the "
            "leaderboard.\n\n"
            "Every month the fastest player wins a voucher for a free game!"
        ),
    },
]

TEAM_NAMES = [
    "Бинарни Бегалци", "Шерлоковци", "Клучарите", "Тимот Б", "Код Црвено", "Загатко", "Мачките во чизми",
    "Escape Artists", "The Lockpickers", "Паника", "Колеги од ФИНКИ", "Лисиците", "Последна минута",
    "Brainstorm", "Вечни Студенти", "Хиероглифи", "Тајна Мисија", "Шифрата", "Night Owls", "Мозочна Бура",
]

FIRST_NAMES = ["Ана", "Марко", "Елена", "Стефан", "Ивана", "Никола", "Мила", "Давид", "Сара", "Филип",
               "Јована", "Петар", "Теодора", "Бојан", "Kristina", "Luka"]
LAST_NAMES = ["Петровска", "Николов", "Стојанова", "Трајковски", "Илиевска", "Георгиев", "Андонова",
              "Димитров", "Јовановска", "Костов"]

PLAYERS = [
    ("Марко Николов", "marko@example.com"),
    ("Елена Стојанова", "elena@example.com"),
    ("Стефан Георгиев", "stefan@example.com"),
    ("Ивана Илиевска", "ivana@example.com"),
    ("Никола Костов", "nikola@example.com"),
    ("Сара Андонова", "sara@example.com"),
    ("Filip Dimitrov", "filip@example.com"),
    ("Теодора Јовановска", "teodora@example.com"),
]

MESSAGES = [
    ("Бојан Петров", "bojan@example.com", "Роденден за 8 деца", "Здраво, дали може роденденска забава за 8 деца на возраст 11 години?"),
    ("Kristina Lazarova", "kristina@example.com", "Team building", "Hi, we are a team of 18 people. Can we book all rooms on a Friday afternoon?"),
    ("Мила Трајковска", "mila@example.com", "Подарок ваучер", "Колку време важи подарок ваучерот и дали може да се користи за било која соба?"),
]


def seed(db) -> None:
    rnd = random.Random(42)  # фиксен seed – секогаш исти податоци
    today = local_now().date()

    # --- Соби ---
    rooms = [Room(**r) for r in ROOMS]
    db.add_all(rooms)

    # --- Корисници ---
    admin = User(name="Администратор", email="admin@pressesc.mk", password_hash=hash_password("admin123"), is_admin=True)
    demo = User(name="Демо Корисник", email="demo@pressesc.mk", password_hash=hash_password("demo123"))
    player_hash = hash_password("demo123")
    players = [User(name=n, email=e, password_hash=player_hash) for n, e in PLAYERS]
    db.add_all([admin, demo, *players])
    db.flush()  # за да добијат id

    # --- Резервации: 30 дена наназад и 30 дена напред ---
    codes: set[str] = set()

    def code() -> str:
        while True:
            c = "PE-" + "".join(rnd.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))
            if c not in codes:
                codes.add(c)
                return c

    taken: set[tuple] = set()
    bookings = []

    def add_booking(room: Room, day, t: str, user: User | None, status: str) -> None:
        taken.add((room.id, day, t))
        n = rnd.randint(room.min_players, room.max_players)
        name = user.name if user else f"{rnd.choice(FIRST_NAMES)} {rnd.choice(LAST_NAMES)}"
        bookings.append(Booking(
            code=code(), room_id=room.id, user_id=user.id if user else None, date=day, time=t, players=n,
            price=calc_price(n, day), customer_name=name, phone=f"07{rnd.randint(0, 9)} {rnd.randint(100, 999)} {rnd.randint(100, 999)}",
            email=user.email if user else "guest@example.com", status=status,
            created_at=datetime.combine(day - timedelta(days=rnd.randint(1, 14)), time(12), tzinfo=timezone.utc),
        ))

    # Резервации на демо корисникот (2 идни, 2 минати)
    add_booking(rooms[3], today + timedelta(days=3), "19:00", demo, "confirmed")
    add_booking(rooms[0], today + timedelta(days=10), "17:30", demo, "confirmed")
    add_booking(rooms[1], today - timedelta(days=12), "20:30", demo, "completed")
    add_booking(rooms[2], today - timedelta(days=25), "16:00", demo, "completed")

    for offset in range(-30, 31):
        day = today + timedelta(days=offset)
        weekend = day.weekday() >= 5
        for room in rooms:
            for t in SLOT_TIMES:
                if (room.id, day, t) in taken:
                    continue
                evening = t >= "17:30"
                chance = 0.25 + (0.25 if weekend else 0) + (0.2 if evening else 0)
                if offset > 14:
                    chance *= 0.5  # подалечните денови се помалку полни
                if rnd.random() < chance:
                    if offset < 0:
                        status = "cancelled" if rnd.random() < 0.05 else "completed"
                    else:
                        status = "confirmed"
                    user = rnd.choice(players) if rnd.random() < 0.3 else None
                    add_booking(room, day, t, user, status)
    db.add_all(bookings)

    # --- Leaderboard (најбрзи тимови) ---
    for room in rooms:
        # потешка соба = подолги времиња
        fastest = {1: 24, 2: 33, 3: 38}[room.difficulty] * 60
        for i, team in enumerate(rnd.sample(TEAM_NAMES, 14)):
            t = fastest + rnd.randint(0, room.duration_min * 60 - fastest - 30)
            if i == 0 and room.slug == "laboratorija":
                team, t = "Бинарни Бегалци", 38 * 60 + 12
            db.add(LeaderboardEntry(
                room_id=room.id, team_name=team, players=rnd.randint(room.min_players, room.max_players),
                time_seconds=t, hints_used=rnd.choice([0, 0, 1, 1, 2, 3]),
                played_on=today - timedelta(days=rnd.randint(1, 180)),
            ))

    # --- Резултати од мини-игрите ---
    ranges = {"codebreaker": ((35, 320), (4, 10)), "memory": ((28, 140), (8, 30)), "cipher": ((15, 180), (1, 5))}
    for game, ((t_min, t_max), (m_min, m_max)) in ranges.items():
        for p in [*players, demo]:
            for _ in range(rnd.randint(1, 3)):
                db.add(GameScore(
                    user_id=p.id, game=game, time_seconds=rnd.randint(t_min, t_max), moves=rnd.randint(m_min, m_max),
                    created_at=datetime.now(timezone.utc) - timedelta(days=rnd.randint(0, 30), hours=rnd.randint(0, 23)),
                ))

    # --- Блог ---
    for p in POSTS:
        data = {k: v for k, v in p.items() if k != "days_ago"}
        db.add(BlogPost(**data, published_at=today - timedelta(days=p["days_ago"])))

    # --- Контакт пораки ---
    for i, (name, email, subject, msg) in enumerate(MESSAGES):
        db.add(ContactMessage(name=name, email=email, subject=subject, message=msg, is_read=i == 2,
                              created_at=datetime.now(timezone.utc) - timedelta(days=i * 2 + 1)))

    db.commit()
    print(f"Seed done: {len(rooms)} rooms, {len(bookings)} bookings, {2 + len(players)} users")


def ensure_admin(db) -> None:
    # Админ профилот на Миа – се додава и во постоечка база ако го нема
    email = "mia@test.com"
    if not db.scalar(select(User).where(User.email == email)):
        db.add(User(name="Миа", email=email, password_hash=hash_password("mia"), is_admin=True))
        db.commit()


def rename_demo_emails(db) -> None:
    # Фирмата се преименуваше од Enigma Escape во Press Esc – ги менуваме и демо е-поштите
    for old, new in [("demo@enigma.mk", "demo@pressesc.mk"), ("admin@enigma.mk", "admin@pressesc.mk")]:
        user = db.scalar(select(User).where(User.email == old))
        if user:
            user.email = new
            db.commit()


def seed_if_empty() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count(Room.id))) == 0:
            seed(db)
        ensure_admin(db)
        rename_demo_emails(db)


if __name__ == "__main__":
    if "--reset" in sys.argv:
        Base.metadata.drop_all(engine)
        print("All tables dropped")
    Base.metadata.create_all(engine)
    seed_if_empty()
