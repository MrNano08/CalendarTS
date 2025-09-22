import type { BaseEvent, InstanceEvent } from "../types";

export function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function fromYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(d: Date, n: number) { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; }
export function addWeeks(d: Date, n: number) { return addDays(d, n * 7); }
export function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, d.getDate()); }
export function firstDayOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
export function lastDayOfMonth(date: Date)  { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }
export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function buildMonthMatrix(forMonth: Date) {
  const first = firstDayOfMonth(forMonth);
  const last  = lastDayOfMonth(forMonth);

  const startOffset = (first.getDay() + 6) % 7; // desde lunes
  const start = new Date(first); start.setDate(first.getDate() - startOffset);

  const endOffset = (7 - ((last.getDay() + 6) % 7) - 1 + 7) % 7;
  const end = new Date(last); end.setDate(last.getDate() + endOffset);

  const days: Date[] = [];
  let cur = new Date(start);
  while (cur <= end) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }

  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

export function expandInstances(
  base: BaseEvent,
  monthStart: Date,
  monthEnd: Date
): InstanceEvent[] {
  const out: InstanceEvent[] = [];
  const start = fromYMD(base.date);

  const pushIfInRange = (d: Date) => {
    if (d >= monthStart && d <= monthEnd) out.push({ ...base, instanceDate: toYMD(d) });
  };

  if (!base.repeat) {
    pushIfInRange(start);
  } else {
    const { value, unit } = base.repeat.duration;
    const endBy = unit === "weeks" ? addWeeks(start, value - 1) : addMonths(start, value);
    let cur = new Date(start);
    while (cur <= endBy) { pushIfInRange(cur); cur = addWeeks(cur, 1); }
  }
  return out;
}

// 12h/24h
export const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"];
export function to24h(h12: string, m: string, ampm: "AM" | "PM") {
  let h = parseInt(h12, 10) % 12;
  if (ampm === "PM") h += 12;
  const hh = String(h).padStart(2, "0");
  return `${hh}:${m.padStart(2, "0")}`;
}
export function format12h(time?: string) {
  if (!time) return "";
  const [hh, mm] = time.split(":");
  let h = Number(hh);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm} ${ampm}`;
}
