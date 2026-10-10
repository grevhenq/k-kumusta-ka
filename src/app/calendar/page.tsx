"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { moodStore, symptomStore, sleepStore, diaryStore, doseStore, medicationStore } from "@/lib/storage";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => setTick((t) => t + 1), [cursor]);

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();

  const recordedDates = useMemo(() => {
    const hasMeds = medicationStore.list().length > 0;
    const map = new Map<string, { mood: boolean; symptoms: boolean; sleep: boolean; diary: boolean; meds: boolean }>();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${cursor.year}-${pad(cursor.month + 1)}-${pad(d)}`;
      map.set(date, {
        mood: moodStore.forDate(date).length > 0,
        symptoms: symptomStore.forDate(date).length > 0,
        sleep: Boolean(sleepStore.forDate(date)),
        diary: Boolean(diaryStore.forDate(date)),
        meds: hasMeds ? doseStore.forDate(date).some((d2) => d2.status !== "unrecorded") : true,
      });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, tick]);

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium">
            {new Date(cursor.year, cursor.month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`;
          const rec = recordedDates.get(date);
          const count = rec ? [rec.mood, rec.symptoms, rec.sleep, rec.diary, rec.meds].filter(Boolean).length : 0;
          return (
            <button
              key={i}
              onClick={() => setSelected(date)}
              className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center border ${
                selected === date ? "border-primary" : "border-transparent"
              } ${count === 5 ? "bg-lavender" : count > 0 ? "bg-lavender/40" : "bg-transparent"}`}
            >
              <span>{day}</span>
              {count > 0 && <span className="text-[9px] text-primary-deep">{count}/5</span>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="card">
          <p className="text-sm font-medium mb-2">{selected}</p>
          {(() => {
            const rec = recordedDates.get(selected);
            if (!rec) return null;
            return (
              <ul className="text-sm space-y-1">
                <li>Mood: {rec.mood ? "recorded" : "not recorded"}</li>
                <li>Symptoms: {rec.symptoms ? "recorded" : "not recorded"}</li>
                <li>Sleep: {rec.sleep ? "recorded" : "not recorded"}</li>
                <li>Diary: {rec.diary ? "recorded" : "not recorded"}</li>
                <li>Medications: {rec.meds ? "recorded" : "not recorded"}</li>
              </ul>
            );
          })()}
          <p className="text-xs text-text-secondary mt-2">
            Not recorded means no entry was made — never treated as a zero or as a missed dose.
          </p>
        </div>
      )}
    </div>
  );
}
