/**
 * Local-first data layer for K?.
 *
 * IMPORTANT: This is a development/demo persistence layer using
 * localStorage so the app is fully usable without any backend
 * configured. It is NOT the production data store described in the
 * spec (section 13). Before shipping to real users, replace the
 * functions below with calls to Supabase (see supabase/schema.sql
 * and src/lib/supabase.ts) so that:
 *   - data survives across devices,
 *   - Row Level Security enforces per-user ownership,
 *   - diary text is never kept only in the browser.
 *
 * The function signatures here are intentionally close to what the
 * Supabase-backed versions will look like, so swapping the
 * implementation later does not require rewriting every page.
 */

export type ID = string;

export interface MoodEntry {
  id: ID;
  date: string; // YYYY-MM-DD, local day
  timestamp: string; // ISO
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  emotions: string[];
  note?: string;
}

export interface SymptomDefinition {
  id: ID;
  name: string;
  category: "emotional" | "cognitive" | "physical" | "behavioral" | "custom";
}

export interface SymptomObservation {
  id: ID;
  date: string;
  timestamp: string;
  symptomId: ID;
  severity: number; // 0-10
  durationMinutes?: number;
  note?: string;
}

export interface SleepEntry {
  id: ID;
  date: string; // the day the user woke up
  bedtime: string; // ISO
  wakeTime: string; // ISO
  quality: number; // 1-10
  minutesToFallAsleep?: number;
  awakenings?: number;
  nap?: boolean;
  note?: string;
}

export interface Medication {
  id: ID;
  name: string;
  dosage?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  scheduleTimes: string[]; // "08:00", "20:00"
}

export type DoseStatus = "taken" | "skipped" | "unrecorded";

export interface DoseRecord {
  id: ID;
  medicationId: ID;
  date: string;
  scheduledTime: string;
  status: DoseStatus;
  timestamp?: string;
  note?: string;
}

export interface DiaryEntry {
  id: ID;
  date: string;
  updatedAt: string;
  title?: string;
  body: string;
  tags?: string[];
  moodId?: ID;
}

export interface EncouragementMessage {
  id: ID;
  date: string;
  text: string;
  type: "original" | "quote";
  source?: string;
  favorited?: boolean;
  feedback?: "helpful" | "not_relevant";
}

const KEYS = {
  mood: "kk_mood_entries",
  symptomDefs: "kk_symptom_defs",
  symptomObs: "kk_symptom_obs",
  sleep: "kk_sleep_entries",
  meds: "kk_medications",
  doses: "kk_dose_records",
  diary: "kk_diary_entries",
  encouragement: "kk_encouragement",
  settings: "kk_settings",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(): ID {
  return crypto.randomUUID();
}

export function todayLocalISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------- Mood ----------
export const moodStore = {
  list: (): MoodEntry[] => read<MoodEntry>(KEYS.mood).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  forDate: (date: string) => moodStore.list().filter((m) => m.date === date),
  create: (entry: Omit<MoodEntry, "id">): MoodEntry => {
    const item: MoodEntry = { ...entry, id: uid() };
    write(KEYS.mood, [...read<MoodEntry>(KEYS.mood), item]);
    return item;
  },
  update: (id: ID, patch: Partial<MoodEntry>) => {
    const items = read<MoodEntry>(KEYS.mood).map((m) => (m.id === id ? { ...m, ...patch } : m));
    write(KEYS.mood, items);
  },
  remove: (id: ID) => write(KEYS.mood, read<MoodEntry>(KEYS.mood).filter((m) => m.id !== id)),
};

// ---------- Symptoms ----------
export const DEFAULT_SYMPTOMS: SymptomDefinition[] = [
  { id: "anxiety", name: "Anxiety", category: "emotional" },
  { id: "low-mood", name: "Low mood", category: "emotional" },
  { id: "irritability", name: "Irritability", category: "emotional" },
  { id: "racing-thoughts", name: "Racing thoughts", category: "cognitive" },
  { id: "concentration", name: "Trouble concentrating", category: "cognitive" },
  { id: "fatigue", name: "Fatigue", category: "physical" },
  { id: "headache", name: "Headache", category: "physical" },
  { id: "appetite-change", name: "Appetite change", category: "physical" },
  { id: "social-withdrawal", name: "Social withdrawal", category: "behavioral" },
];

export const symptomStore = {
  definitions: (): SymptomDefinition[] => {
    const custom = read<SymptomDefinition>(KEYS.symptomDefs);
    return [...DEFAULT_SYMPTOMS, ...custom];
  },
  addDefinition: (name: string): SymptomDefinition => {
    const def: SymptomDefinition = { id: uid(), name, category: "custom" };
    write(KEYS.symptomDefs, [...read<SymptomDefinition>(KEYS.symptomDefs), def]);
    return def;
  },
  list: (): SymptomObservation[] => read<SymptomObservation>(KEYS.symptomObs),
  forDate: (date: string) => symptomStore.list().filter((s) => s.date === date),
  create: (entry: Omit<SymptomObservation, "id">): SymptomObservation => {
    const item: SymptomObservation = { ...entry, id: uid() };
    write(KEYS.symptomObs, [...read<SymptomObservation>(KEYS.symptomObs), item]);
    return item;
  },
  remove: (id: ID) => write(KEYS.symptomObs, read<SymptomObservation>(KEYS.symptomObs).filter((s) => s.id !== id)),
};

// ---------- Sleep ----------
export const sleepStore = {
  list: (): SleepEntry[] => read<SleepEntry>(KEYS.sleep).sort((a, b) => b.date.localeCompare(a.date)),
  forDate: (date: string) => sleepStore.list().find((s) => s.date === date),
  create: (entry: Omit<SleepEntry, "id">): SleepEntry => {
    const item: SleepEntry = { ...entry, id: uid() };
    write(KEYS.sleep, [...read<SleepEntry>(KEYS.sleep), item]);
    return item;
  },
  remove: (id: ID) => write(KEYS.sleep, read<SleepEntry>(KEYS.sleep).filter((s) => s.id !== id)),
};

export function sleepDurationMinutes(bedtimeISO: string, wakeTimeISO: string): number {
  const bed = new Date(bedtimeISO).getTime();
  let wake = new Date(wakeTimeISO).getTime();
  if (wake <= bed) {
    // wake time is on the next calendar day relative to bedtime
    wake += 24 * 60 * 60 * 1000;
  }
  return Math.round((wake - bed) / 60000);
}

// ---------- Medications ----------
export const medicationStore = {
  list: (): Medication[] => read<Medication>(KEYS.meds),
  create: (med: Omit<Medication, "id">): Medication => {
    const item: Medication = { ...med, id: uid() };
    write(KEYS.meds, [...read<Medication>(KEYS.meds), item]);
    return item;
  },
  remove: (id: ID) => write(KEYS.meds, read<Medication>(KEYS.meds).filter((m) => m.id !== id)),
};

export const doseStore = {
  list: (): DoseRecord[] => read<DoseRecord>(KEYS.doses),
  forDate: (date: string) => doseStore.list().filter((d) => d.date === date),
  upsert: (record: Omit<DoseRecord, "id"> & { id?: ID }): DoseRecord => {
    const items = read<DoseRecord>(KEYS.doses);
    if (record.id) {
      const updated = items.map((d) => (d.id === record.id ? { ...d, ...record, id: record.id! } : d));
      write(KEYS.doses, updated);
      return updated.find((d) => d.id === record.id)!;
    }
    const item: DoseRecord = { ...record, id: uid() };
    write(KEYS.doses, [...items, item]);
    return item;
  },
};

// ---------- Diary ----------
export const diaryStore = {
  list: (): DiaryEntry[] => read<DiaryEntry>(KEYS.diary).sort((a, b) => b.date.localeCompare(a.date)),
  forDate: (date: string) => diaryStore.list().find((d) => d.date === date),
  upsert: (entry: Omit<DiaryEntry, "id"> & { id?: ID }): DiaryEntry => {
    const items = read<DiaryEntry>(KEYS.diary);
    if (entry.id) {
      const updated = items.map((d) => (d.id === entry.id ? ({ ...d, ...entry, id: entry.id! } as DiaryEntry) : d));
      write(KEYS.diary, updated);
      return updated.find((d) => d.id === entry.id)!;
    }
    const item: DiaryEntry = { ...entry, id: uid() };
    write(KEYS.diary, [...items, item]);
    return item;
  },
  remove: (id: ID) => write(KEYS.diary, read<DiaryEntry>(KEYS.diary).filter((d) => d.id !== id)),
};

// ---------- Daily encouragement ----------
export const encouragementStore = {
  forDate: (date: string): EncouragementMessage | undefined =>
    read<EncouragementMessage>(KEYS.encouragement).find((m) => m.date === date),
  save: (msg: Omit<EncouragementMessage, "id"> & { id?: ID }): EncouragementMessage => {
    const items = read<EncouragementMessage>(KEYS.encouragement);
    const withoutSameDate = items.filter((m) => m.date !== msg.date || m.id === msg.id);
    const item: EncouragementMessage = { ...msg, id: msg.id ?? uid() };
    write(KEYS.encouragement, [...withoutSameDate.filter((m) => m.id !== item.id), item]);
    return item;
  },
};

// ---------- Settings ----------
export interface AppSettings {
  nickname?: string;
  timezone?: string;
  encouragementMode: "personalized" | "private" | "off";
  diaryAIConsent: boolean;
  companionName: string;
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: AppSettings = {
  encouragementMode: "private",
  diaryAIConsent: false,
  companionName: "Kuya Shark",
  theme: "system",
};

export const settingsStore = {
  get: (): AppSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = window.localStorage.getItem(KEYS.settings);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  save: (patch: Partial<AppSettings>) => {
    const current = settingsStore.get();
    const next = { ...current, ...patch };
    write<AppSettings>(KEYS.settings, [next as unknown as AppSettings]);
    window.localStorage.setItem(KEYS.settings, JSON.stringify(next));
    return next;
  },
};
