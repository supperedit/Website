export interface CalendarMoment {
  day: number;
  label: string;
}

/**
 * Curated "fun world days" per month (1 = Januar … 12 = Dezember).
 * Kept intentionally short and food/lifestyle-leaning rather than
 * exhaustive — this is decorative, not a reference calendar. Dates are
 * sourced from kuriose-feiertage.de and similar trackers; extend freely,
 * just double check a date before adding it so nothing made-up sneaks in.
 */
export const funHolidays: Record<number, CalendarMoment[]> = {
  1: [
    { day: 1, label: "Neujahr" },
    { day: 4, label: "Weltbraille-Tag" },
  ],
  2: [
    { day: 14, label: "Valentinstag" },
    { day: 20, label: "Weltnutellatag" },
  ],
  3: [
    { day: 8, label: "Weltfrauentag" },
    { day: 14, label: "Pi Day" },
    { day: 20, label: "Frühlingsanfang" },
  ],
  4: [
    { day: 22, label: "Tag der Erde" },
  ],
  5: [
    { day: 1, label: "Tag der Arbeit" },
    { day: 5, label: "Cinco de Mayo" },
    { day: 20, label: "Weltbienentag" },
  ],
  6: [
    { day: 21, label: "Sommeranfang" },
  ],
  7: [
    { day: 17, label: "World Emoji Day" },
  ],
  8: [
    { day: 1, label: "Weltverpeiltag" },
    { day: 8, label: "Weltkatzentag" },
    { day: 9, label: "Tag des Buchliebhabers" },
    { day: 10, label: "Weltlöwentag" },
    { day: 13, label: "Internationaler Linkshändertag" },
    { day: 16, label: "Tag der Bratwurst" },
    { day: 19, label: "Weltfototag" },
    { day: 26, label: "Internationaler Tag des Hundes" },
  ],
  9: [
    { day: 21, label: "Weltfriedenstag" },
  ],
  10: [
    { day: 31, label: "Halloween" },
  ],
  11: [
    { day: 1, label: "Weltvegan-Tag" },
    { day: 11, label: "Martinstag" },
  ],
  12: [
    { day: 6, label: "Nikolaus" },
    { day: 24, label: "Heiligabend" },
    { day: 25, label: "Weihnachten" },
    { day: 31, label: "Silvester" },
  ],
};

/** Gauss's Easter algorithm — Ostersonntag varies each year, so it can't be hardcoded. */
export function getEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/** Returns the fun-holiday + Easter/Karfreitag/Ostermontag moments for a given month, sorted by day. */
export function getMomentsForMonth(year: number, monthIndex0: number): CalendarMoment[] {
  const month = monthIndex0 + 1;
  const moments = [...(funHolidays[month] ?? [])];

  const easter = getEasterSunday(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);
  const addRelative = (offsetDays: number, label: string) => {
    const d = new Date(easterDate);
    d.setDate(d.getDate() + offsetDays);
    if (d.getMonth() === monthIndex0) {
      moments.push({ day: d.getDate(), label });
    }
  };
  addRelative(-2, "Karfreitag");
  addRelative(0, "Ostersonntag");
  addRelative(1, "Ostermontag");

  return moments.sort((a, b) => a.day - b.day);
}
