import { useState, useMemo } from "react";
import type { BaseEvent, InstanceEvent } from "../types";
import { format12h, minuteOptions, to24h } from "../lib/date";
import ColorSwatch from "./ColorSwatch";

export default function DayPanel({
  date,
  items,
  notes,
  onAdd,
  onDelete,
  onChangeNotes,
  compact,
}: {
  date: string;                      // YYYY-MM-DD (día seleccionado)
  items: InstanceEvent[];            // instancias de ese día
  notes: string;                     // notas del día
  onAdd: (payload: BaseEvent) => void;
  onDelete: (id: string) => void;
  onChangeNotes: (text: string) => void;
  compact?: boolean;
}) {
  // --- Estado del formulario agregar ---
  const [title, setTitle] = useState("");
  const [h12, setH12] = useState("");
  const [m12, setM12] = useState("");
  const [ampm, setAmPm] = useState<"AM" | "PM">("AM");
  const [color, setColor] = useState("#0ea5e9");
  const [repeat, setRepeat] = useState(false);
  const [durationValue, setDurationValue] = useState(4);
  const [durationUnit, setDurationUnit] = useState<"weeks" | "months">("weeks");

  const isToday = useMemo(() => {
    const today = new Date();
    const ymd = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    return ymd === date;
  }, [date]);

  const prettyDate = useMemo(() => formatDateLong(date), [date]);

  function handleAdd() {
    const time24 = h12 && m12 ? to24h(h12, m12, ampm) : undefined;
    const base: BaseEvent = {
      id: `ev_${Date.now()}`,
      title: (title || "").trim() || "Sin título",
      date,
      time: time24,
      color,
      repeat: repeat
        ? {
            freq: "WEEKLY",
            duration: { value: Math.max(1, Number(durationValue) || 1), unit: durationUnit },
          }
        : undefined,
    };
    onAdd(base);
    setTitle("");
    setH12(""); setM12(""); setAmPm("AM");
    setRepeat(false); setDurationValue(4); setDurationUnit("weeks");
  }

  return (
    <div className={`mt-5 ${compact ? "" : ""}`}>
      {/* === Encabezado de fecha seleccionada === */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="mt-0.5 text-base font-semibold text-slate-900">{prettyDate}</div>
        </div>
        {isToday && (
          <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-sky-100 text-sky-700 ring-1 ring-sky-200">
            Hoy
          </span>
        )}
      </div>

      {/* === Tarjeta Agregar === */}
      <div className="p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
        <div className="text-sm font-semibold mb-2">Agregar actividad</div>

        {/* Título */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (Evaluación, tarea...)"
          className="w-full px-3 py-2 h-9 rounded-xl ring-1 ring-slate-200 focus:outline-none focus:ring-sky-300
                     bg-white text-sm text-slate-800 placeholder:text-slate-400"
        />

        {/* HH / MM / AMPM / Color / + */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={h12}
            onChange={(e) => setH12(e.target.value)}
            className="px-2 h-9 rounded-lg ring-1 ring-slate-200 bg-white text-slate-900 text-sm w-[64px] shrink-0"
            title="Hora"
          >
            <option value="">HH</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={String(h)}>
                {h}
              </option>
            ))}
          </select>

          <select
            value={m12}
            onChange={(e) => setM12(e.target.value)}
            className="px-2 h-9 rounded-lg ring-1 ring-slate-200 bg-white text-slate-900 text-sm w-[64px] shrink-0"
            title="Minutos"
          >
            <option value="">MM</option>
            {minuteOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={ampm}
            onChange={(e) => setAmPm(e.target.value as "AM" | "PM")}
            className="px-2 h-9 rounded-lg ring-1 ring-slate-200 bg-white text-slate-900 text-sm w-[72px] shrink-0"
            title="AM/PM"
          >
            <option>AM</option>
            <option>PM</option>
          </select>

          <div className="h-9 flex items-center shrink-0 ml-1">
            <ColorSwatch value={color} onChange={setColor} size={36} />
          </div>

          <button
            onClick={handleAdd}
            aria-label="Agregar"
            className="w-9 h-9 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center shadow hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Repetición */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            Repetir semanal por
          </label>
          <input
            type="number"
            min={1}
            value={durationValue}
            onChange={(e) => setDurationValue(Number(e.target.value))}
            className="w-16 px-2 py-1 h-9 rounded-lg ring-1 ring-slate-200"
          />
          <select
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value as "weeks" | "months")}
            className="px-2 py-1 h-9 rounded-lg ring-1 ring-slate-200"
          >
            <option value="weeks">semanas</option>
            <option value="months">meses</option>
          </select>
        </div>
      </div>

      {/* Lista del día */}
      <ul className="mt-4 space-y-2">
        {items.length === 0 && (
          <li className="text-sm text-slate-500">Nada aún para este día.</li>
        )}
        {items.map((ev) => (
          <li
            key={ev.id}
            className="p-2 rounded-xl ring-1 ring-slate-200 bg-white flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ev.color }}
              />
              <div className="truncate">
                <div className="text-sm font-medium truncate">
                  {ev.time ? `${format12h(ev.time)} · ` : ""}
                  {ev.title}
                </div>
                {ev.repeat && (
                  <div className="text-[11px] text-slate-500">
                    Repite semanal, {ev.repeat.duration.value}{" "}
                    {ev.repeat.duration.unit === "weeks" ? "sem." : "meses"}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(ev.id)}
              className="text-xs px-2 py-1 rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {/* Notas */}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Notas</div>
        <textarea
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          rows={compact ? 4 : 6}
          placeholder="Escribe ideas, pendientes o links..."
          className="w-full px-3 py-2 rounded-xl ring-1 ring-slate-200 focus:outline-none focus:ring-sky-300 bg-white"
        />
      </div>
    </div>
  );
}

/* ========== helpers locales ========== */
function formatDateLong(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekday = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ][dt.getDay()];
  const MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${capitalize(weekday)} ${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
