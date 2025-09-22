export interface RepeatRule {
    freq: "WEEKLY";
    duration: { value: number; unit: "weeks" | "months" };
  }
  
  export interface BaseEvent {
    id: string;
    title: string;
    date: string;     // YYYY-MM-DD (fecha base)
    time?: string;    // HH:MM (24h interno)
    color: string;    // hex
    course?: string;
    repeat?: RepeatRule;
  }
  
  export interface InstanceEvent extends BaseEvent {
    instanceDate: string; // fecha concreta
  }
  