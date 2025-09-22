import { useEffect, useMemo, useState } from "react";
import type { BaseEvent } from "./types";
import { MONTHS_ES, MONTH_BG } from "./constants/backgrounds";
import {
  buildMonthMatrix,
  expandInstances,
  firstDayOfMonth,
  lastDayOfMonth,
  toYMD,
  capitalize,
} from "./lib/date";
import {
  loadEvents,
  loadNotes,
  saveEvents,
  saveNotes,
  loadBgMap,
  saveBgMap,
  getBgForMonth,
  loadDayAlpha,
  saveDayAlpha,
  loadPageBg,
  savePageBg,
  type BgMap,
} from "./lib/storage";
import { downloadICS } from "./lib/ics";
import IconBtn from "./components/IconBtn";
import CalendarGrid from "./components/CalendarGrid";
import DayPanel from "./components/DayPanel";
import Modal from "./components/Modal";

export default function App() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [events, setEvents] = useState<BaseEvent[]>(loadEvents());
  const [notes, setNotes] = useState<Record<string, string>>(loadNotes());
  const [selectedDate, setSelectedDate] = useState<string>(toYMD(today));

  // Personalización visual
  const [bgMap, setBgMap] = useState<BgMap>(loadBgMap());   // imagen del calendario por mes
  const [dayAlpha, setDayAlpha] = useState<number>(loadDayAlpha()); // transparencia de celdas (global)
  const [pageBg, setPageBg] = useState<string>(loadPageBg());        // color fondo página
  const [showBgModal, setShowBgModal] = useState(false);
  const [editMonth, setEditMonth] = useState<number>(viewMonth.getMonth()); // mes que se edita en el modal

  useEffect(() => saveBgMap(bgMap), [bgMap]);
  useEffect(() => saveDayAlpha(dayAlpha), [dayAlpha]);
  useEffect(() => savePageBg(pageBg), [pageBg]);

  useEffect(() => saveEvents(events), [events]);
  useEffect(() => saveNotes(notes), [notes]);

  const monthMatrix = useMemo(() => buildMonthMatrix(viewMonth), [viewMonth]);
  const monthStart = useMemo(() => firstDayOfMonth(viewMonth), [viewMonth]);
  const monthEnd = useMemo(() => lastDayOfMonth(viewMonth), [viewMonth]);

  const instances = useMemo(() => {
    const list = events.flatMap((e) => expandInstances(e, monthStart, monthEnd));
    return list.sort((a, b) =>
      (a.instanceDate + (a.time || "")).localeCompare(
        b.instanceDate + (b.time || "")
      )
    );
  }, [events, monthStart, monthEnd]);

  const eventsByDay = useMemo(() => {
    const m = new Map<string, typeof instances>();
    for (const ev of instances) {
      if (!m.has(ev.instanceDate)) m.set(ev.instanceDate, []);
      m.get(ev.instanceDate)!.push(ev);
    }
    return m;
  }, [instances]);

  const upcomingDays = useMemo(() => {
    const now = toYMD(new Date());
    const days = Array.from(
      new Set(instances.filter((i) => i.instanceDate >= now).map((i) => i.instanceDate))
    );
    return days.slice(0, 14);
  }, [instances]);

  const dayItems = eventsByDay.get(selectedDate) || [];

  const monthIdx = viewMonth.getMonth();
  const bgUrl = getBgForMonth(bgMap, monthIdx) || MONTH_BG[monthIdx] || "";

  /* ========= helpers edición de fondo por mes ========= */
  const urlForEditMonth = getBgForMonth(bgMap, editMonth);
  const setUrlForEditMonth = (url: string) =>
    setBgMap((prev) => ({ ...prev, [String(editMonth)]: url }));

  const applyUrlToAll = () => {
    const u = urlForEditMonth;
    if (!u) return;
    const next: BgMap = {};
    for (let i = 0; i < 12; i++) next[String(i)] = u;
    setBgMap(next);
  };

  return (
    <div
      className="min-h-screen w-full antialiased text-slate-800"
      style={{ backgroundColor: pageBg }}
    >
      <div className="w-full px-3 sm:px-6 lg:px-10 py-5 sm:py-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="pr-2">
            <h1 className="text-[clamp(1.3rem,2.2vw,2rem)] font-extrabold tracking-tight">
              Calendario
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <IconBtn
              title="Mes anterior"
              onClick={() =>
                setViewMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))
              }
              direction="left"
            />
            <div className="px-4 py-2 rounded-2xl bg-white/70 ring-1 ring-slate-200 shadow-sm font-semibold">
              {MONTHS_ES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <IconBtn
              title="Mes siguiente"
              onClick={() =>
                setViewMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))
              }
              direction="right"
            />
            <button
              onClick={() => {
                setEditMonth(viewMonth.getMonth());
                setShowBgModal(true);
              }}
              className="ml-1 px-3 py-1.5 rounded-xl bg-white/80 ring-1 ring-slate-200 hover:bg-white flex items-center gap-2"
              title="Personalizar fondos/colores"
            >
              <span className="text-slate-800 text-sm">🎨 Fondos</span>
            </button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <CalendarGrid
              month={viewMonth}
              matrix={monthMatrix}
              eventsByDay={eventsByDay}
              onSelectDate={(d) => setSelectedDate(d)}
              bgUrl={bgUrl}
              dayAlpha={dayAlpha}
            />
          </div>

          <aside className="xl:col-span-1">
            <div className="bg-white/90 rounded-2xl ring-1 ring-slate-200 shadow p-4">
              <DayPanel
                date={selectedDate}
                items={dayItems}
                notes={notes[selectedDate] || ""}
                onAdd={(p) => setEvents((prev) => [...prev, p])}
                onDelete={(id) =>
                  setEvents((prev) => prev.filter((e) => e.id !== id))
                }
                onChangeNotes={(t) =>
                  setNotes((prev) => ({ ...prev, [selectedDate]: t }))
                }
              />

              <div className="my-4 border-t border-slate-200" />

              {/* Próximos */}
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-800">Próximos</h2>
                <button
                  onClick={() => downloadICS(instances)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 shadow"
                >
                  .ics
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {upcomingDays.length === 0 && (
                  <li className="text-sm text-slate-500">
                    No hay actividades próximas.
                  </li>
                )}
                {upcomingDays.map((d) => (
                  <li key={d}>
                    <button
                      onClick={() => setSelectedDate(d)}
                      className={`w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 ${
                        selectedDate === d ? "ring-1 ring-slate-200 bg-slate-50" : ""
                      }`}
                    >
                      <div className="text-sm font-medium">{formatDateLong(d)}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(eventsByDay.get(d) || [])
                          .slice(0, 4)
                          .map((ev) => (
                            <span
                              key={ev.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ring-1 ring-slate-200"
                              style={{ backgroundColor: ev.color + "1a" }}
                            >
                              <i
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: ev.color }}
                              />
                              {ev.title}
                            </span>
                          ))}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal: imagen por mes + alpha celdas + color de página */}
      <Modal
        open={showBgModal}
        title="Personalizar fondos por mes y colores"
        onClose={() => setShowBgModal(false)}
      >
        <div className="space-y-4">
          {/* Mes a editar */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Mes a editar</span>
            <select
              value={editMonth}
              onChange={(e) => setEditMonth(Number(e.target.value))}
              className="px-2 py-1 h-9 rounded-lg ring-1 ring-slate-200 bg-white text-sm"
            >
              {MONTHS_ES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* URL del mes seleccionado */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              URL de imagen para {MONTHS_ES[editMonth]}
            </label>
            <input
              value={urlForEditMonth}
              onChange={(e) => setUrlForEditMonth(e.target.value)}
              placeholder="https://… (vacío = usar imagen por defecto del mes)"
              className="w-full px-3 py-2 rounded-xl ring-1 ring-slate-200 bg-white text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={applyUrlToAll}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:opacity-90"
                disabled={!urlForEditMonth}
                title="Aplica esta misma imagen a todos los meses"
              >
                Usar en todos los meses
              </button>
              {urlForEditMonth && (
                <button
                  onClick={() => setUrlForEditMonth("")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  Volver a imagen por defecto
                </button>
              )}
            </div>
          </div>

          {/* Transparencia de celdas */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Transparencia de celdas</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={dayAlpha}
              onChange={(e) => setDayAlpha(Number(e.target.value))}
              className="flex-1 accent-slate-900"
            />
            <span className="tabular-nums w-12 text-right">
              {dayAlpha.toFixed(2)}
            </span>
          </div>

          {/* Color de fondo de la página */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">Color de fondo de la página</span>
              <input
                type="color"
                value={pageBg}
                onChange={(e) => setPageBg(e.target.value)}
                className="w-10 h-10 rounded-md border border-slate-300"
                title="Elegir color"
              />
            </div>
            <div className="flex items-center gap-2">
              {["#f8fafc","#ffffff","#fdf2f8","#ecfeff","#f0fdf4"].map((hex) => (
                <button
                  key={hex}
                  onClick={() => setPageBg(hex)}
                  className="w-8 h-8 rounded-md border border-slate-300"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* Preview simple del mes en edición */}
          <div className="rounded-xl overflow-hidden ring-1 ring-slate-200">
            <div
              className="h-28 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  getBgForMonth(bgMap, editMonth) || MONTH_BG[editMonth] || ""
                })`,
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function formatDateLong(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekday = [
    "domingo","lunes","martes","miércoles","jueves","viernes","sábado",
  ][dt.getDay()];
  return `${capitalize(weekday)} ${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}
