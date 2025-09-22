import type { BaseEvent } from "../types";

/* =====================  Eventos  ===================== */
const KEY_EVENTS = "events_v1";
export const loadEvents = (): BaseEvent[] => {
  try { return JSON.parse(localStorage.getItem(KEY_EVENTS) || "[]"); }
  catch { return []; }
};
export const saveEvents = (evs: BaseEvent[]) =>
  localStorage.setItem(KEY_EVENTS, JSON.stringify(evs));

/* =====================  Notas por día  ===================== */
const KEY_NOTES = "notes_v1";
export const loadNotes = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(KEY_NOTES) || "{}"); }
  catch { return {}; }
};
export const saveNotes = (n: Record<string, string>) =>
  localStorage.setItem(KEY_NOTES, JSON.stringify(n));

/* =====================  Imagen del calendario por MES  ===================== */
/**
 * Guardamos un mapa { "0": "https://...", "1": "", ... } donde
 * 0=Enero, 1=Febrero, ..., 11=Diciembre.
 */
const KEY_BG_MAP = "bgMap_v1";
export type BgMap = Record<string, string>; // claves "0".."11"

export const loadBgMap = (): BgMap => {
  try {
    const raw = localStorage.getItem(KEY_BG_MAP);
    if (raw) return JSON.parse(raw);

    // --- Migración desde la clave vieja (bgUrl global) ---
    const legacy = localStorage.getItem("bgUrl"); // antigua
    if (legacy) {
      const m: BgMap = {};
      const cur = new Date().getMonth();
      m[String(cur)] = legacy;
      localStorage.setItem(KEY_BG_MAP, JSON.stringify(m));
      localStorage.removeItem("bgUrl");
      return m;
    }
    return {};
  } catch {
    return {};
  }
};

export const saveBgMap = (map: BgMap) =>
  localStorage.setItem(KEY_BG_MAP, JSON.stringify(map));

export const getBgForMonth = (map: BgMap, monthIndex: number): string =>
  map[String(monthIndex)] || "";

/* =====================  Transparencia de celdas (global)  ===================== */
const KEY_DAY_ALPHA = "dayAlpha";
export const loadDayAlpha = (): number =>
  Number(localStorage.getItem(KEY_DAY_ALPHA) ?? "0.85"); // por defecto 0.85
export const saveDayAlpha = (n: number) =>
  localStorage.setItem(KEY_DAY_ALPHA, String(n));

/* =====================  Color de fondo de la página  ===================== */
const KEY_PAGE_BG = "pageBg";
export const loadPageBg = (): string =>
  localStorage.getItem(KEY_PAGE_BG) || "#f8fafc"; // slate-50 aprox
export const savePageBg = (hex: string) =>
  localStorage.setItem(KEY_PAGE_BG, hex);
