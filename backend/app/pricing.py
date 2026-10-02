# Цени и термини (едно место за да лесно се менуваат)
from datetime import date, datetime, time as dtime, timedelta
from zoneinfo import ZoneInfo

from .config import TIMEZONE

# Вкупна цена во денари според број на играчи
PRICE_TABLE = {2: 2400, 3: 3000, 4: 3600, 5: 4000, 6: 4500}
WEEKEND_SURCHARGE = 300  # сабота и недела

# Бесплатно откажување најдоцна толку часа пред терминот
CANCEL_HOURS = 24

# Најмногу претстојни резервации со ист телефонски број (заштита од лажни резервации)
MAX_ACTIVE_PER_PHONE = 3

# Термини секој ден
SLOT_TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30", "22:00"]

# Колку дена однапред може да се резервира
BOOKING_WINDOW_DAYS = 60


def calc_price(players: int, day: date) -> int:
    price = PRICE_TABLE[players]
    if day.weekday() >= 5:
        price += WEEKEND_SURCHARGE
    return price


def local_now() -> datetime:
    return datetime.now(ZoneInfo(TIMEZONE))


def is_slot_in_past(day: date, time: str) -> bool:
    now = local_now()
    if day < now.date():
        return True
    if day > now.date():
        return False
    hour, minute = map(int, time.split(":"))
    return (hour, minute) <= (now.hour, now.minute)


def can_cancel(day: date, time: str) -> bool:
    # Дали до терминот има уште најмалку CANCEL_HOURS часа
    hour, minute = map(int, time.split(":"))
    start = datetime.combine(day, dtime(hour, minute), tzinfo=ZoneInfo(TIMEZONE))
    return start - local_now() >= timedelta(hours=CANCEL_HOURS)


def digits(phone: str) -> str:
    # „070 123-456“ и „070123456“ се ист број
    return "".join(c for c in phone if c.isdigit())
