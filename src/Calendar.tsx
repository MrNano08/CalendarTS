import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Calendario — Editable con recurrencias
 *
 * Cambios:
 * • Selector de color pequeño y circular
 * • Botón "Agregar" compacto y legible
 * • Selector de hora en formato 12h (AM/PM)
 * • Fondo por mes con transparencia
 */

// ====== Tipos ======
interface BaseEvent {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD (fecha base)
  time?: string;     // HH:MM (24h internamente)
  color: string;     // hex
  course?: string;
  repeat?: RepeatRule;
}

interface RepeatRule {
  freq: "WEEKLY";
  duration: { value: number; unit: "weeks" | "months" };
}

interface InstanceEvent extends BaseEvent { instanceDate: string; }

// ====== Utilidades ======
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEK_ES   = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]; // Lunes primero

// Fondo por mes (puedes cambiar URLs)
const MONTH_BG: Record<number, string> = {
  0:  "https://images.unsplash.com/photo-1502920917128-1aa500764ce7?q=80&w=1400&auto=format&fit=crop",
  1:  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop",
  2:  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1400&auto=format&fit=crop",
  3:  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  4:  "https://images.unsplash.com/photo-1493810329807-3b4515eeda46?q=80&w=1400&auto=format&fit=crop",
  5:  "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?q=80&w=1400&auto=format&fit=crop",
  6:  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop", // Jul
  7:  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1400&auto=format&fit=crop",
  8:  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=1400&auto=format&fit=crop",
  9:  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop",
  10: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
  11: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
};
const BG_OPACITY = 0.85; // transparencia del velo blanco encima del fondo

function toYMD(d: Date){ const y=d.getFullYear(); const m=(d.getMonth()+1+``).padStart(2,"0"); const a=(d.getDate()+``).padStart(2,"0"); return `${y}-${m}-${a}`; }
function fromYMD(s:string){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function addDays(d: Date, n:number){ const nd=new Date(d); nd.setDate(nd.getDate()+n); return nd; }
function addWeeks(d: Date, n:number){ return addDays(d, n*7); }
function addMonths(d: Date, n:number){ return new Date(d.getFullYear(), d.getMonth()+n, d.getDate()); }
function firstDayOfMonth(date: Date){ return new Date(date.getFullYear(), date.getMonth(), 1); }
function lastDayOfMonth(date: Date){ return new Date(date.getFullYear(), date.getMonth()+1, 0); }
function isSameDay(a: Date, b: Date){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function capitalize(s:string){ return s.charAt(0).toUpperCase()+s.slice(1); }

// ====== Persistencia ======
const LS_EVENTS = "cal_eval_events_v1";
const LS_NOTES  = "cal_eval_notes_v1"; // Map<string(date), string>
function loadEvents(): BaseEvent[]{ try{ const raw=localStorage.getItem(LS_EVENTS); return raw? JSON.parse(raw):[]; }catch{ return []; } }
function saveEvents(list: BaseEvent[]){ localStorage.setItem(LS_EVENTS, JSON.stringify(list)); }
function loadNotes(): Record<string,string>{ try{ const raw=localStorage.getItem(LS_NOTES); return raw? JSON.parse(raw):{}; }catch{ return {}; } }
function saveNotes(map: Record<string,string>){ localStorage.setItem(LS_NOTES, JSON.stringify(map)); }

function expandInstances(base: BaseEvent, monthStart: Date, monthEnd: Date): InstanceEvent[]{
  const instances: InstanceEvent[]=[]; const start = fromYMD(base.date);
  const pushIfInRange = (d: Date)=>{ if(d>=monthStart && d<=monthEnd){ instances.push({...base, instanceDate: toYMD(d)}); } };
  if(!base.repeat){ pushIfInRange(start); }
  else{ const { value, unit } = base.repeat.duration; const endByWeeks = unit==="weeks"? addWeeks(start, value-1): addMonths(start, value); let cur=new Date(start); while(cur<=endByWeeks){ pushIfInRange(cur); cur=addWeeks(cur,1);} }
  return instances;
}

function buildMonthMatrix(forMonth: Date){
  const first=firstDayOfMonth(forMonth); const last=lastDayOfMonth(forMonth);
  const startOffset=(first.getDay()+6)%7; const start=new Date(first); start.setDate(first.getDate()-startOffset);
  const endOffset=(7-((last.getDay()+6)%7)-1+7)%7; const end=new Date(last); end.setDate(last.getDate()+endOffset);
  const days: Date[]=[]; let cur=new Date(start); while(cur<=end){ days.push(new Date(cur)); cur.setDate(cur.getDate()+1);} const rows: Date[][]=[]; for(let i=0;i<days.length;i+=7) rows.push(days.slice(i,i+7)); return rows;
}

const MIN_MONTH = new Date(2025,6,1);
const MAX_MONTH = new Date(2025,11,1);

// ====== Componente principal ======
export default function CalendarEvaluaciones(){
  const today = new Date();
  const initial = clampMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMonth, setViewMonth] = useState<Date>(initial);
  const [events, setEvents] = useState<BaseEvent[]>(loadEvents());
  const [notes, setNotes]   = useState<Record<string,string>>(loadNotes());
  const [selectedDate, setSelectedDate] = useState<string>(toYMD(today));
  const [showDayMobile, setShowDayMobile] = useState(false);

  useEffect(()=> saveEvents(events),[events]);
  useEffect(()=> saveNotes(notes),[notes]);

  const monthMatrix = useMemo(()=> buildMonthMatrix(viewMonth), [viewMonth]);
  const monthStart  = useMemo(()=> firstDayOfMonth(viewMonth), [viewMonth]);
  const monthEnd    = useMemo(()=> lastDayOfMonth(viewMonth), [viewMonth]);

  const instances = useMemo(()=>{
    const list: InstanceEvent[]=[]; for(const ev of events){ list.push(...expandInstances(ev, monthStart, monthEnd)); }
    return list.sort((a,b)=> (a.instanceDate+(a.time||"")) .localeCompare(b.instanceDate+(b.time||"")));
  },[events, monthStart, monthEnd]);

  const eventsByDay = useMemo(()=>{
    const m = new Map<string, InstanceEvent[]>();
    for(const ev of instances){ if(!m.has(ev.instanceDate)) m.set(ev.instanceDate, []); m.get(ev.instanceDate)!.push(ev); }
    return m;
  },[instances]);

  const upcomingDays = useMemo(()=>{
    const now=toYMD(new Date()); const days=Array.from(new Set(instances.filter(i=> i.instanceDate>=now).map(i=> i.instanceDate)));
    return days.slice(0,14);
  },[instances]);

  const dayItems = eventsByDay.get(selectedDate) || [];
  const bgUrl = MONTH_BG[viewMonth.getMonth()] || "";

  return (
    <div className="min-h-screen w-full antialiased text-slate-800 relative">
      {/* Fondo por mes */}
      <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
      {/* Velo para controlar transparencia */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: `rgba(255,255,255,${BG_OPACITY})` }} />

      <div className="w-full px-3 sm:px-6 lg:px-10 py-5 sm:py-8">
        {/* Header */}
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="pr-2">
            <h1 className="text-[clamp(1.3rem,2.2vw,2rem)] font-extrabold tracking-tight">Calendario — II Ciclo 2025</h1>
            <p className="text-slate-700 mt-1 text-sm sm:text-[0.95rem]">Agrega actividades con hora, color y repeticiones. Guardado local.</p>
          </div>
          <div className="flex items-center gap-3">
            <IconBtn title="Mes anterior" disabled={viewMonth.getTime()===MIN_MONTH.getTime()} onClick={()=> setViewMonth(p=>clampMonth(addMonths(p,-1)))} direction="left"/>
            <div className="px-4 py-2 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-sm font-semibold">
              {MONTHS_ES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <IconBtn title="Mes siguiente" disabled={viewMonth.getTime()===MAX_MONTH.getTime()} onClick={()=> setViewMonth(p=>clampMonth(addMonths(p,1)))} direction="right"/>
            <button className="sm:hidden ml-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs" onClick={()=> setShowDayMobile(true)}>Día</button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="xl:col-span-2">
            <CalendarGrid month={viewMonth} matrix={monthMatrix} eventsByDay={eventsByDay} onSelectDate={(d)=>{ setSelectedDate(d); setShowDayMobile(true); }} />
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-1">
            <div className="bg-white/85 backdrop-blur rounded-2xl ring-1 ring-slate-200 shadow p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-800">Próximos</h2>
                <button onClick={()=> downloadICS(instances)} className="text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 shadow">.ics</button>
              </div>
              <ul className="mt-3 space-y-2">
                {upcomingDays.length===0 && (<li className="text-sm text-slate-500">No hay actividades próximas.</li>)}
                {upcomingDays.map(d=> (
                  <li key={d}>
                    <button onClick={()=> { setSelectedDate(d); setShowDayMobile(true); }} className={`w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 ${selectedDate===d?"ring-1 ring-slate-200 bg-slate-50":""}`}>
                      <div className="text-sm font-medium">{formatDateLong(d)}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(eventsByDay.get(d)||[]).slice(0,4).map(ev=> (
                          <span key={ev.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ring-1 ring-slate-200" style={{backgroundColor:ev.color+"1a"}}>
                            <i className="inline-block w-2 h-2 rounded-full" style={{backgroundColor:ev.color}}/>
                            {ev.title}
                          </span>
                        ))}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Día */}
              <DayPanel
                date={selectedDate}
                items={dayItems}
                notes={notes[selectedDate]||""}
                onAdd={(payload)=> setEvents(prev=>[...prev,payload])}
                onDelete={(id)=> setEvents(prev=> prev.filter(e=> e.id!==id))}
                onChangeNotes={(text)=> setNotes(prev=> ({...prev, [selectedDate]: text}))}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom sheet móvil */}
      {showDayMobile && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={()=> setShowDayMobile(false)}>
          <div className="absolute inset-0 bg-black/30"/>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 ring-1 ring-slate-200" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{formatDateLong(selectedDate)}</div>
              <button onClick={()=> setShowDayMobile(false)} className="px-2 py-1 rounded-lg bg-slate-100">Cerrar</button>
            </div>
            <DayPanel
              date={selectedDate}
              items={dayItems}
              notes={notes[selectedDate]||""}
              onAdd={(payload)=> setEvents(prev=>[...prev,payload])}
              onDelete={(id)=> setEvents(prev=> prev.filter(e=> e.id!==id))}
              onChangeNotes={(text)=> setNotes(prev=> ({...prev, [selectedDate]: text}))}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Subcomponentes ====== */
function IconBtn({ title, onClick, disabled, direction }:{ title:string; onClick:()=>void; disabled?:boolean; direction:"left"|"right"}){
  return (
    <button aria-label={title} title={title} onClick={onClick} disabled={disabled}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-sm ring-1 ring-slate-200 bg-white/70 backdrop-blur hover:bg-white disabled:opacity-40 flex items-center justify-center group`}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
      <svg viewBox="0 0 24 24" className={`w-4 h-4 text-slate-700 ${direction==="right"?"rotate-180":""}`}>
        <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function CalendarGrid({ month, matrix, eventsByDay, onSelectDate }:{ month:Date; matrix:Date[][]; eventsByDay: Map<string, InstanceEvent[]>; onSelectDate:(d:string)=>void; }){
  const today = new Date(); const monthIdx = month.getMonth(); const year=month.getFullYear();
  return (
    <div className="bg-white/85 backdrop-blur rounded-2xl ring-1 ring-slate-200 shadow overflow-hidden">
      <div className="grid grid-cols-7 text-center bg-slate-50/70 text-slate-600 text-[11px] sm:text-xs font-semibold">
        {WEEK_ES.map(d=> (<div key={d} className="py-2 tracking-wide">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {matrix.flat().map((date,i)=>{
          const isOtherMonth = date.getMonth()!==monthIdx || date.getFullYear()!==year;
          const ymd = toYMD(date); const items=eventsByDay.get(ymd)||[]; const has=items.length>0; const isToday=isSameDay(date,today);
          return (
            <button key={i} onClick={()=> onSelectDate(ymd)} className={`relative text-left p-2 bg-white min-h-[82px] xs:min-h-[92px] sm:min-h-[104px] ${isOtherMonth?"bg-slate-50 text-slate-400":""} hover:bg-slate-50`}>
              <div className="flex items-center justify-between">
                <span className={`text-[13.5px] sm:text-[14.5px] font-semibold ${isOtherMonth?"text-slate-400":"text-slate-800"}`}>{date.getDate()}</span>
                {isToday && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 ring-1 ring-sky-200">Hoy</span>)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 min-h-[12px]">
                {items.slice(0,6).map(ev=> (<span key={ev.id} className="inline-block w-2.5 h-2.5 rounded-full" style={{backgroundColor: ev.color}}/>))}
                {items.length>6 && (<span className="text-[10px] text-slate-500">+{items.length-6}</span>)}
              </div>
              {has && (<div className="mt-2 pr-1 text-[12px] sm:text-[12.5px] leading-snug text-slate-800 font-medium line-clamp-2">{items.slice(0,2).map(ev=> `${format12h(ev.time)} · ${ev.title}`).join(" • ")}</div>)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayPanel({ date, items, notes, onAdd, onDelete, onChangeNotes, compact }:{
  date: string; items: InstanceEvent[]; notes: string;
  onAdd: (payload: BaseEvent)=>void; onDelete:(id:string)=>void; onChangeNotes:(text:string)=>void; compact?: boolean;
}){
  const [title, setTitle] = useState("");
  // 12h controls
  const [h12, setH12] = useState<string>(""); // "1".."12"
  const [m12, setM12] = useState<string>(""); // "00","05",...
  const [ampm, setAmPm] = useState<"AM"|"PM">("AM");
  const [color, setColor] = useState<string>("#0ea5e9");
  const [repeat, setRepeat] = useState<boolean>(false);
  const [durationValue, setDurationValue] = useState<number>(4);
  const [durationUnit, setDurationUnit] = useState<"weeks"|"months">("weeks");
  const titleRef = useRef<HTMLInputElement>(null);

  function handleAdd(){
    const time24 = h12 && m12 ? to24h(h12, m12, ampm) : undefined;
    const base: BaseEvent = {
      id: `ev_${Date.now()}`,
      title: title.trim() || "Sin título",
      date,
      time: time24,
      color,
      repeat: repeat? { freq: "WEEKLY", duration: { value: Math.max(1, Number(durationValue)||1), unit: durationUnit } } : undefined,
    };
    onAdd(base);
    setTitle(""); setH12(""); setM12(""); setAmPm("AM"); setRepeat(false); setDurationValue(4); setDurationUnit("weeks");
    titleRef.current?.focus();
  }

  return (
    <div className={`mt-5 ${compact?"" : ""}`}>
      <div className="flex items-center justify-between"><div className="font-semibold">{formatDateLong(date)}</div></div>

      {/* Lista del día */}
      <ul className="mt-3 space-y-2">
        {items.length===0 && <li className="text-sm text-slate-500">Nada aún para este día.</li>}
        {items.map(ev=> (
          <li key={ev.id} className="p-2 rounded-xl ring-1 ring-slate-200 bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{backgroundColor: ev.color}}/>
              <div className="truncate">
                <div className="text-sm font-medium truncate">{ev.time? `${format12h(ev.time)} · `: ""}{ev.title}</div>
                {ev.repeat && <div className="text-[11px] text-slate-500">Repite semanal, {ev.repeat.duration.value} {ev.repeat.duration.unit==="weeks"?"sem." : "meses"}</div>}
              </div>
            </div>
            <button onClick={()=> onDelete(ev.id)} className="text-xs px-2 py-1 rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">Eliminar</button>
          </li>
        ))}
      </ul>

      {/* Quick add */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
        <div className="text-sm font-semibold mb-2">Agregar actividad</div>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
          <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título (Evaluación, tarea...)" className="sm:col-span-3 px-3 py-2 rounded-xl ring-1 ring-slate-200 focus:outline-none focus:ring-sky-300"/>

          {/* Hora 12h */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-1">
            <select value={h12} onChange={e=>setH12(e.target.value)} className="px-2 py-2 rounded-xl ring-1 ring-slate-200 text-sm">
              <option value="">--</option>
              {Array.from({length:12},(_,i)=>(i+1)).map(h=>(<option key={h} value={String(h)}>{h}</option>))}
            </select>
            <select value={m12} onChange={e=>setM12(e.target.value)} className="px-2 py-2 rounded-xl ring-1 ring-slate-200 text-sm">
              <option value="">--</option>
              {minuteOptions.map(m=>(<option key={m} value={m}>{m}</option>))}
            </select>
            <select value={ampm} onChange={e=>setAmPm(e.target.value as any)} className="px-2 py-2 rounded-xl ring-1 ring-slate-200 text-sm">
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>

          {/* Color: pequeño y circular */}
          <label className="sm:col-span-1 flex items-center justify-center">
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="appearance-none w-8 h-8 rounded-full p-0 border-0 ring-1 ring-slate-300 cursor-pointer"/>
          </label>

          {/* Botón agregar compacto */}
          <button onClick={handleAdd} className="sm:col-span-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:opacity-90 whitespace-nowrap">Agregar</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={repeat} onChange={e=>setRepeat(e.target.checked)} />
            Repetir semanal por
          </label>
          <input type="number" min={1} value={durationValue} onChange={e=> setDurationValue(Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg ring-1 ring-slate-200"/>
          <select value={durationUnit} onChange={e=> setDurationUnit(e.target.value as any)} className="px-2 py-1 rounded-lg ring-1 ring-slate-200">
            <option value="weeks">semanas</option>
            <option value="months">meses</option>
          </select>
        </div>
      </div>

      {/* Notas */}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Notas</div>
        <textarea value={notes} onChange={e=> onChangeNotes(e.target.value)} rows={compact?4:6} placeholder="Escribe ideas, pendientes o links..." className="w-full px-3 py-2 rounded-xl ring-1 ring-slate-200 focus:outline-none focus:ring-sky-300 bg-white"/>
      </div>
    </div>
  );
}

/* ====== Helpers restantes ====== */
function clampMonth(m: Date){ if(m<MIN_MONTH) return new Date(MIN_MONTH); if(m>MAX_MONTH) return new Date(MAX_MONTH); return m; }
function formatDateLong(ymd: string){ const [y,m,d]=ymd.split("-").map(Number); const dt=new Date(y,m-1,d); const weekday=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][dt.getDay()]; return `${capitalize(weekday)} ${d} de ${MONTHS_ES[m-1]} de ${y}`; }

// time helpers 12h/24h
const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"];
function to24h(h12:string, m:string, ampm:"AM"|"PM"){ let h = parseInt(h12,10)%12; if(ampm==="PM") h+=12; const hh=String(h).padStart(2,"0"); return `${hh}:${m.padStart(2,"0")}`; }
function format12h(time?:string){ if(!time) return ""; const [hh,mm]=time.split(":"); let h=Number(hh); const ampm = h>=12?"PM":"AM"; h = h%12 || 12; return `${h}:${mm} ${ampm}`; }

// ICS export
function downloadICS(instances: InstanceEvent[]){
  if(!instances || instances.length===0) return;
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Calendario Editable//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH"]; 
  for(const ev of instances){ const uid=`${ev.id}-${ev.instanceDate}@caleditable`; const dt=ev.instanceDate.replace(/-/g,""); const summary=escapeICS(`${format12h(ev.time)} ${ev.title}`.trim()); lines.push("BEGIN:VEVENT"); lines.push(`UID:${uid}`); lines.push(`DTSTART;VALUE=DATE:${dt}`); lines.push(`DTEND;VALUE=DATE:${nextDay(dt)}`); lines.push(`SUMMARY:${summary}`); lines.push("END:VEVENT"); }
  lines.push("END:VCALENDAR"); const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`calendario.ics`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function escapeICS(t:string){ return t.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"); }
function nextDay(yyyymmdd:string){ const y=+yyyymmdd.slice(0,4), m=+yyyymmdd.slice(4,6), d=+yyyymmdd.slice(6,8); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+1); const y2=dt.getFullYear(), m2=String(dt.getMonth()+1).padStart(2,"0"), d2=String(dt.getDate()).padStart(2,"0"); return `${y2}${m2}${d2}`; }
