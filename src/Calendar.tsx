import { useMemo, useState } from "react";

/**
 * Calendario de Evaluaciones — II Ciclo 2025 (versión aesthetic + responsive)
 */

// ====== Tipos ======
interface EvalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  course: CourseKey;
  percent?: string;
  note?: string;
}

type CourseKey = "ADB" | "IS2" | "DI" | "PP" | "SI";

// ====== Cursos (colores + nombres) ======
const COURSES: Record<CourseKey, { name: string; color: string; ring: string }> = {
  ADB: { name: "Administración de bases de datos (EIF402)", color: "bg-sky-500", ring: "ring-sky-300" },
  IS2: { name: "Ingeniería en Sistemas 2", color: "bg-emerald-500", ring: "ring-emerald-300" },
  DI:  { name: "Diseño de Interfaces (EIF422O)", color: "bg-fuchsia-500", ring: "ring-fuchsia-300" },
  PP:  { name: "Paradigmas de Programación", color: "bg-amber-500", ring: "ring-amber-300" },
  SI:  { name: "Seguridad Informática (EIF440O)", color: "bg-indigo-500", ring: "ring-indigo-300" },
};

// ====== Datos ======
const EVENTS: EvalEvent[] = [
  // ADB
  { id: "adb-quiz1", date: "2025-08-28", title: "Quiz #1", course: "ADB", percent: "(quices = 20% total)" },
  { id: "adb-hito1", date: "2025-09-11", title: "Avance 1 (Hito #1) — Parte escrita", course: "ADB", percent: "(escrita = 8% del total)" },
  { id: "adb-parcial1", date: "2025-09-18", title: "Examen Parcial #1", course: "ADB", percent: "20%" },
  { id: "adb-hito2", date: "2025-10-16", title: "Avance 2 (Hito #2) — Parte escrita", course: "ADB", percent: "(escrita = 8% del total)" },
  { id: "adb-quiz2", date: "2025-10-23", title: "Quiz #2", course: "ADB", percent: "(quices = 20% total)" },
  { id: "adb-ts5", date: "2025-10-30", title: "Tarea Supervisada 05", course: "ADB", percent: "(5 tareas = 10% total)" },
  { id: "adb-hito3-exp", date: "2025-11-06", title: "Exposición Final de Grupos (Hito #3)", course: "ADB", percent: "5% (dentro del Proyecto)" },
  { id: "adb-hito3-dev", date: "2025-11-06", title: "Entregable Parte #3 — Desarrollo operativo", course: "ADB", percent: "12% (del Proyecto)" },
  { id: "adb-final", date: "2025-11-13", title: "Examen Final", course: "ADB", percent: "25%" },
  // IS2
  { id: "is2-seg1", date: "2025-09-05", title: "Seguimiento #1 (fin Sprint 1)", course: "IS2", percent: "5%" },
  { id: "is2-parcial", date: "2025-09-12", title: "Examen Parcial", course: "IS2", percent: "15%" },
  { id: "is2-seg2", date: "2025-09-19", title: "Seguimiento #2 (fin Sprint 2)", course: "IS2", percent: "5%" },
  { id: "is2-expo1", date: "2025-09-26", title: "Exposición #1 (UI propuesta)", course: "IS2", percent: "7.5%" },
  { id: "is2-expo2seg3", date: "2025-10-10", title: "Exposición #2 + Seguimiento #3 (fin Sprint 3)", course: "IS2", percent: "7.5% + 5%" },
  { id: "is2-release1", date: "2025-10-17", title: "Release 1 publicado en la nube", course: "IS2", percent: "15%" },
  { id: "is2-docseg4", date: "2025-10-31", title: "Doc. Usabilidad/Integración + Seguimiento #4 (fin Sprint 4)", course: "IS2", percent: "10% + 5%" },
  { id: "is2-finalpres", date: "2025-11-07", title: "Presentación final del proyecto", course: "IS2", percent: "5%" },
  { id: "is2-finalexam", date: "2025-11-14", title: "Evaluación Final (examen)", course: "IS2", percent: "15%" },
  // DI
  { id: "di-parcial", date: "2025-09-19", title: "Examen Parcial", course: "DI", percent: "15%" },
  { id: "di-inv1", date: "2025-08-08", title: "Presentación Investigación #1", course: "DI", percent: "5%" },
  { id: "di-inv2", date: "2025-08-29", title: "Presentación Investigación #2", course: "DI", percent: "5%" },
  { id: "di-inv3", date: "2025-09-05", title: "Presentación Investigación #3", course: "DI", percent: "5%" },
  { id: "di-inv4", date: "2025-09-12", title: "Presentación Investigación #4", course: "DI", percent: "5%" },
  { id: "di-inv5", date: "2025-09-26", title: "Presentación Investigación #5", course: "DI", percent: "5%" },
  { id: "di-inv6", date: "2025-10-03", title: "Presentación Investigación #6", course: "DI", percent: "5%" },
  { id: "di-inv7", date: "2025-10-10", title: "Presentación Investigación #7", course: "DI", percent: "5%" },
  { id: "di-inv8", date: "2025-10-17", title: "Presentación Investigación #8", course: "DI", percent: "5%" },
  { id: "di-inv9", date: "2025-10-24", title: "Presentación Investigación #9", course: "DI", percent: "5%" },
  { id: "di-inv10", date: "2025-10-31", title: "Presentación Investigación #10", course: "DI", percent: "5%" },
  { id: "di-defensa", date: "2025-11-07", title: "Defensa Proyecto Final", course: "DI", percent: "20% (15% proyecto + 5% expo)" },
  { id: "di-final", date: "2025-11-14", title: "Evaluación Final", course: "DI", percent: "15%" },
  // PP
  { id: "pp-inv1", date: "2025-08-12", title: "Presentación Investigación #1", course: "PP", percent: "5%" },
  { id: "pp-inv2", date: "2025-09-09", title: "Presentación Investigación #2", course: "PP", percent: "5%" },
  { id: "pp-proy1", date: "2025-09-23", title: "Presentación Proyecto 1", course: "PP", note: "(porcentaje indicado en anexo)" },
  { id: "pp-proy2", date: "2025-11-18", title: "Exposición Proyecto 2", course: "PP", note: "(porcentaje indicado en anexo)" },
  // SI
  { id: "si-inv1", date: "2025-08-30", title: "Entrega Investigación I", course: "SI", percent: "(2 trabajos = 10% total)" },
  { id: "si-inv2", date: "2025-09-06", title: "Entrega Investigación II + presentaciones", course: "SI", percent: "(2 trabajos = 10% total)" },
  { id: "si-ex1", date: "2025-09-13", title: "Examen 1", course: "SI", percent: "15%", note: "El cronograma marca 20%, la tabla oficial indica 15%." },
  { id: "si-ex2", date: "2025-11-08", title: "Examen 2", course: "SI", percent: "15%", note: "El cronograma marca 20%, la tabla oficial indica 15%." },
  { id: "si-proy", date: "2025-11-15", title: "Proyecto Final — entrega/defensa", course: "SI", percent: "30%" },
];

// ====== Utilidades fecha ======
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEK_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function firstDayOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function lastDayOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth()+1, 0); }
function addMonths(date: Date, n: number) { return new Date(date.getFullYear(), date.getMonth()+n, 1); }
function isSameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

const MIN_MONTH = new Date(2025, 6, 1);  // Jul
const MAX_MONTH = new Date(2025, 10, 1); // Nov

// ====== Componente principal ======
export default function CalendarEvaluaciones() {
  const today = new Date();
  const initial = clampMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMonth, setViewMonth] = useState<Date>(initial);
  const [activeCourses, setActiveCourses] = useState<Record<CourseKey, boolean>>({ ADB:true, IS2:true, DI:true, PP:true, SI:true });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const visibleEvents = useMemo(() => {
    const activeKeys = Object.keys(activeCourses).filter(k => (activeCourses as any)[k]);
    return EVENTS.filter(ev => activeKeys.includes(ev.course));
  }, [activeCourses]);

  const monthMatrix = useMemo(() => buildMonthMatrix(viewMonth), [viewMonth]);

  const dayMap = useMemo(() => {
    const map = new Map<string, EvalEvent[]>();
    for (const ev of visibleEvents) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return map;
  }, [visibleEvents]);

  const upcoming = useMemo(() => {
    const nowYMD = toYMD(today);
    return visibleEvents.filter(ev => ev.date >= nowYMD).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 12);
  }, [visibleEvents]);

  const selectedEvents = selectedDate ? (dayMap.get(selectedDate) ?? []) : [];

  return (
    <div className="min-h-screen w-full antialiased text-slate-800
  bg-gradient-to-br from-rose-50 via-indigo-50 to-sky-50">

      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="pr-2">
            <h1 className="text-[clamp(1.4rem,2.2vw,2.1rem)] font-extrabold tracking-tight">
              Calendario de Evaluaciones — II Ciclo 2025
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-[0.95rem]">
              Filtra por curso, navega por meses y exporta a tu calendario (.ics) con recordatorio 7 días antes.
            </p>
          </div>

          {/* Navegación de mes — compacta, solo íconos */}
          <div className="flex items-center gap-3">
            <IconBtn
              title="Mes anterior"
              disabled={viewMonth.getTime() === MIN_MONTH.getTime()}
              onClick={() => setViewMonth(prev => clampMonth(addMonths(prev, -1)))}
              direction="left"
            />
            <div className="px-4 py-2 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-sm font-semibold">
              {MONTHS_ES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <IconBtn
              title="Mes siguiente"
              disabled={viewMonth.getTime() === MAX_MONTH.getTime()}
              onClick={() => setViewMonth(prev => clampMonth(addMonths(prev, 1)))}
              direction="right"
            />
          </div>
        </header>

        {/* Filtros */}
        <section className="mt-6 flex flex-wrap gap-2">
          {Object.entries(COURSES).map(([key, cfg]) => (
            <label
              key={key}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl
              bg-white/70 backdrop-blur ring-2 ${activeCourses[key as CourseKey] ? cfg.ring : "ring-slate-200"} shadow-sm cursor-pointer`}>
              <input
                type="checkbox"
                className="hidden"
                checked={activeCourses[key as CourseKey]}
                onChange={() => setActiveCourses(s => ({ ...s, [key]: !s[key as CourseKey] }))}
              />
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`}></span>
              <span className="text-sm font-medium">{COURSES[key as CourseKey].name}</span>
            </label>
          ))}
          <button
            onClick={() => setActiveCourses({ ADB:true, IS2:true, DI:true, PP:true, SI:true })}
            className="ml-auto px-3 py-2 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-sm text-sm hover:ring-slate-300">
            Seleccionar todo
          </button>
        </section>

        {/* Layout principal */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="xl:col-span-2">
            <CalendarGrid
              month={viewMonth}
              matrix={monthMatrix}
              eventsByDay={dayMap}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Próximos */}
          <aside className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur rounded-2xl ring-1 ring-slate-200 shadow p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-800">Próximos</h2>
                <button
                  onClick={() => downloadICS(visibleEvents)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 shadow">
                  Descargar .ics
                </button>
              </div>
              <ul className="mt-3 space-y-3">
                {upcoming.length === 0 && (
                  <li className="text-sm text-slate-500">No hay eventos futuros en los filtros actuales.</li>
                )}
                {upcoming.map(ev => (
                  <li key={ev.id} className="flex gap-3 items-start">
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full ${COURSES[ev.course].color}`}></span>
                    <div>
                      <div className="text-sm font-medium">{formatDateLong(ev.date)}</div>
                      <div className="text-sm">{ev.title}</div>
                      <div className="text-xs text-slate-500">
                        {COURSES[ev.course].name}{ev.percent ? ` — ${ev.percent}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Legend />
            </div>
          </aside>
        </div>

        {/* Modal */}
        {selectedDate && (
          <DayModal date={selectedDate} events={selectedEvents} onClose={() => setSelectedDate(null)} />
        )}

        <footer className="mt-10 text-center text-xs text-slate-500 px-2">
          Horarios de referencia: ADB (Jue 5–9 pm), IS2 (Vie 8–12 m), DI (Vie 5–8 pm), SI (Sáb 8–12 m).
        </footer>
      </div>
    </div>
  );
}

/* ================= Subcomponentes ================= */

function IconBtn({
  title, onClick, disabled, direction,
}: { title: string; onClick: () => void; disabled?: boolean; direction: "left" | "right" }) {
  return (
    <button
      aria-label={title}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-9 h-9 sm:w-10 sm:h-10
      rounded-full shadow-sm ring-1 ring-slate-200
      bg-white/70 backdrop-blur
      hover:bg-white disabled:opacity-40
      flex items-center justify-center group`}
    >
      {/* Glow decorativo */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
      {/* Chevron */}
      <svg viewBox="0 0 24 24" className={`w-4 h-4 text-slate-700 ${direction === "right" ? "rotate-180" : ""}`}>
        <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function CalendarGrid({
  month, matrix, eventsByDay, onSelectDate,
}: {
  month: Date;
  matrix: Date[][];
  eventsByDay: Map<string, EvalEvent[]>;
  onSelectDate: (ymd: string) => void;
}) {
  const today = new Date();
  const monthIdx = month.getMonth();
  const year = month.getFullYear();

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl ring-1 ring-slate-200 shadow overflow-hidden">
      {/* Cabecera de días */}
      <div className="grid grid-cols-7 text-center bg-slate-50/70 text-slate-600 text-[11px] sm:text-xs font-semibold">
        {WEEK_ES.map((d) => (
          <div key={d} className="py-2 tracking-wide">{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {matrix.flat().map((date, i) => {
          const isOtherMonth = date.getMonth() !== monthIdx || date.getFullYear() !== year;
          const ymd = toYMD(date);
          const events = eventsByDay.get(ymd) || [];
          const hasEvents = events.length > 0;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={i}
              onClick={() => hasEvents && onSelectDate(ymd)}
              className={`relative text-left p-2 bg-white
                min-h-[90px] xs:min-h-[96px] sm:min-h-[104px] md:min-h-[112px]
                ${isOtherMonth ? "bg-slate-50 text-slate-400" : ""}
                hover:bg-slate-50 focus:outline-none`}
            >
              {/* Fila 1: número del día + badge Hoy */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[13.5px] sm:text-[14.5px] font-semibold ${
                    isOtherMonth ? "text-slate-400" : "text-slate-800"
                  }`}
                >
                  {date.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                    Hoy
                  </span>
                )}
              </div>

              {/* Fila 2: puntos (siempre reserva espacio para que no se muevan) */}
              <div className="mt-1 flex flex-wrap items-center gap-1 min-h-[12px]" aria-hidden="true">
                {events.slice(0, 5).map((ev) => (
                  <span
                    key={ev.id}
                    className={`inline-block w-2.5 h-2.5 rounded-full ${COURSES[ev.course].color}`}
                  />
                ))}
                {events.length > 5 && (
                  <span className="text-[10px] text-slate-500">+{events.length - 5}</span>
                )}
              </div>

              {/* Fila 3: títulos (flujo normal, sin absolute) */}
              {hasEvents && (
                <div className="mt-2 pr-1 text-[12px] sm:text-[12.5px] leading-snug text-slate-800 font-medium line-clamp-2">
                  {events.slice(0, 2).map((ev) => ev.title).join(" • ")}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayModal({ date, events, onClose }: { date: string; events: EvalEvent[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-2xl ring-1 ring-slate-200 shadow-xl p-5"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{formatDateLong(date)}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200">Cerrar</button>
        </div>
        <ul className="mt-4 space-y-3">
          {events.map(ev => (
            <li key={ev.id} className="p-3 rounded-xl ring-1 ring-slate-200 shadow-sm bg-white flex gap-3">
              <span className={`mt-1 w-2.5 h-2.5 rounded-full ${COURSES[ev.course].color}`}></span>
              <div>
                <div className="font-medium">{ev.title}</div>
                <div className="text-sm text-slate-600">{COURSES[ev.course].name}{ev.percent ? ` — ${ev.percent}` : ""}</div>
                {ev.note && <div className="text-xs text-amber-600 mt-1">Nota: {ev.note}</div>}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={() => downloadICS(events)} className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 shadow">
            Exportar este día (.ics)
          </button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-slate-100 ring-1 ring-slate-200 hover:bg-slate-200">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200">
      <div className="text-xs font-semibold text-slate-500 mb-2">Leyenda</div>
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(COURSES).map(([k, c]) => (
          <div key={k} className="inline-flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${c.color}`}></span>
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Helpers ================= */

function buildMonthMatrix(forMonth: Date) {
  const first = firstDayOfMonth(forMonth);
  const last = lastDayOfMonth(forMonth);

  // cuadrícula desde lunes
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startOffset);

  const endOffset = (7 - ((last.getDay() + 6) % 7) - 1 + 7) % 7;
  const end = new Date(last);
  end.setDate(last.getDate() + endOffset);

  const days: Date[] = [];
  let cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

function clampMonth(m: Date) {
  if (m < MIN_MONTH) return new Date(MIN_MONTH);
  if (m > MAX_MONTH) return new Date(MAX_MONTH);
  return m;
}

function formatDateLong(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m-1, d);
  const weekday = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][date.getDay()];
  return `${capitalize(weekday)} ${d} de ${MONTHS_ES[m-1]} de ${y}`;
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ====== Exportador ICS ======
function downloadICS(events: EvalEvent[]) {
  if (!events || events.length === 0) return;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calendario Evaluaciones//RonaldoMD//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of events) {
    const uid = `${ev.id}@evales2025`;
    const dt = ev.date.replace(/-/g, "");
    const title = escapeICS(`${ev.title} — ${COURSES[ev.course].name}${ev.percent ? ` (${ev.percent})` : ""}`);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(dt)}`);
    lines.push(`SUMMARY:${title}`);
    if (ev.note) lines.push(`DESCRIPTION:${escapeICS(ev.note)}`);
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push("DESCRIPTION:Recordatorio — Evaluación");
    lines.push("TRIGGER:-P7D");
    lines.push("END:VALARM");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `evaluaciones_IIciclo2025.ics`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeICS(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function nextDay(yyyymmdd: string) {
  const y = Number(yyyymmdd.slice(0,4));
  const m = Number(yyyymmdd.slice(4,6));
  const d = Number(yyyymmdd.slice(6,8));
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate()+1);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth()+1).padStart(2, "0");
  const d2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}${m2}${d2}`;
}
