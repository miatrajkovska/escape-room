# Цени и термини (едно место за да лесно се менуваат)
from datetime import date, datetime
from zoneinfo import ZoneInfo

from .config import TIMEZONE

# Вкупна цена во денари според број на играчи
PRICE_TABLE = {2: 2400, 3: 3000, 4: 3600, 5: 4000, 6: 4500}
WEEKEND_SURCHARGE = 300  # сабота и недела

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
