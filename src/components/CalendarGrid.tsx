import type { InstanceEvent } from "../types";
import { isSameDay, toYMD, format12h } from "../lib/date";

const WEEK_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarGrid({
  month,
  matrix,
  eventsByDay,
  onSelectDate,
  bgUrl,
  dayAlpha,
  selectedDate,   // <-- nuevo
}: {
  month: Date;
  matrix: Date[][];
  eventsByDay: Map<string, InstanceEvent[]>;
  onSelectDate: (d: string) => void;
  /** Imagen de fondo (solo del calendario) */
  bgUrl?: string;
  /** Transparencia de las celdas (0=transparente, 1=sólido) */
  dayAlpha?: number;
  /** Día seleccionado en formato YYYY-MM-DD */
  selectedDate?: string;        // <-- nuevo
}) {
  const today = new Date();
  const monthIdx = month.getMonth();
  const year = month.getFullYear();
  const alpha = dayAlpha ?? 0.85;

  return (
    <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow">
      {/* Fondo dentro del calendario - nítido */}
      {bgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      <div className="relative">
        {/* Encabezado de semana: sin gris, sin blur */}
        <div className="grid grid-cols-7 text-center bg-white/20 text-slate-700 text-[11px] sm:text-xs font-semibold">
          {WEEK_ES.map((d) => (
            <div key={d} className="py-2 tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Líneas del grid suaves */}
        <div className="grid grid-cols-7 gap-px bg-white/40">
          {matrix.flat().map((date, i) => {
            const isOther =
              date.getMonth() !== monthIdx || date.getFullYear() !== year;
            const ymd = toYMD(date);
            const items = eventsByDay.get(ymd) || [];
            const has = items.length > 0;
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate === ymd; // <-- nuevo

            return (
              <button
                key={i}
                onClick={() => onSelectDate(ymd)}
                aria-selected={isSelected}
                className={`relative text-left p-2 min-h-[82px] xs:min-h-[92px] sm:min-h-[104px]
                            ${isOther ? "text-slate-400" : "text-slate-800"}
                            hover:shadow-sm focus:outline-none
                            ${isSelected ? "ring-2 ring-sky-400/60 shadow-md" : ""}`}  // borde/halo al seleccionado
                style={{
                  // si está seleccionada, subimos un poco la opacidad para que se note más
                  backgroundColor: `rgba(255,255,255,${
                    isSelected ? Math.max(alpha, 0.92) : alpha
                  })`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] sm:text-[14.5px] font-semibold">
                    {date.getDate()}
                  </span>
                  {isToday && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1 min-h-[12px]">
                  {items.slice(0, 6).map((ev) => (
                    <span
                      key={ev.id}
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ev.color }}
                    />
                  ))}
                  {items.length > 6 && (
                    <span className="text-[10px] text-slate-500">
                      +{items.length - 6}
                    </span>
                  )}
                </div>

                {has && (
                  <div className="mt-2 pr-1 text-[12px] sm:text-[12.5px] leading-snug text-slate-800 font-medium line-clamp-2">
                    {items
                      .slice(0, 2)
                      .map(
                        (ev) =>
                          `${ev.time ? format12h(ev.time) + " · " : ""}${
                            ev.title
                          }`
                      )
                      .join(" • ")}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
