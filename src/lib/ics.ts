import type { InstanceEvent } from "../types";
import { format12h } from "./date";

export function downloadICS(instances: InstanceEvent[]) {
  if (!instances?.length) return;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calendario Editable//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of instances) {
    const uid = `${ev.id}-${ev.instanceDate}@caleditable`;
    const dt = ev.instanceDate.replace(/-/g, "");
    const summary = escapeICS(`${format12h(ev.time)} ${ev.title}`.trim());

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(dt)}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "calendario.ics";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeICS(t: string) {
  return t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function nextDay(yyyymmdd: string) {
  const y = +yyyymmdd.slice(0, 4), m = +yyyymmdd.slice(4, 6), d = +yyyymmdd.slice(6, 8);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}${m2}${d2}`;
}
