"use client";

import { useEffect, useState } from "react";
import { sleepStore, sleepDurationMinutes, todayLocalISODate, type SleepEntry } from "@/lib/storage";

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState(5);
  const [minutesToFallAsleep, setMinutesToFallAsleep] = useState<string>("");
  const [awakenings, setAwakenings] = useState<string>("");
  const [note, setNote] = useState("");

  function refresh() {
    setEntries(sleepStore.list());
  }

  useEffect(() => {
    refresh();
    const now = new Date();
    const defaultBed = new Date(now);
    defaultBed.setDate(defaultBed.getDate() - 1);
    defaultBed.setHours(23, 0, 0, 0);
    setBedtime(toLocalInputValue(defaultBed));
    const defaultWake = new Date(now);
    defaultWake.setHours(7, 0, 0, 0);
    setWakeTime(toLocalInputValue(defaultWake));
  }, []);

  const durationMinutes = bedtime && wakeTime ? sleepDurationMinutes(new Date(bedtime).toISOString(), new Date(wakeTime).toISOString()) : 0;

  function save() {
    if (!bedtime || !wakeTime) return;
    sleepStore.create({
      date: todayLocalISODate(),
      bedtime: new Date(bedtime).toISOString(),
      wakeTime: new Date(wakeTime).toISOString(),
      quality,
      minutesToFallAsleep: minutesToFallAsleep ? Number(minutesToFallAsleep) : undefined,
      awakenings: awakenings ? Number(awakenings) : undefined,
      note: note.trim() || undefined,
    });
    setNote("");
    refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Sleep</h1>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Bedtime
            <input
              type="datetime-local"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Wake time
            <input
              type="datetime-local"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm"
            />
          </label>
        </div>

        {bedtime && wakeTime && (
          <p className="text-sm text-text-secondary">
            Duration: {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
          </p>
        )}

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Sleep quality</span>
            <span className="text-text-secondary">{quality}/10</span>
          </div>
          <input type="range" min={1} max={10} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Minutes to fall asleep
            <input
              type="number"
              value={minutesToFallAsleep}
              onChange={(e) => setMinutesToFallAsleep(e.target.value)}
              className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Awakenings
            <input
              type="number"
              value={awakenings}
              onChange={(e) => setAwakenings(e.target.value)}
              className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm"
            />
          </label>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes about sleep conditions..."
          className="w-full rounded-xl border border-lavender p-3 text-sm min-h-[60px]"
        />

        <button onClick={save} className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium">
          Save sleep entry
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">History</p>
        {entries.length === 0 && <p className="text-sm text-text-secondary">No sleep entries yet.</p>}
        {entries.slice(0, 20).map((e) => {
          const mins = sleepDurationMinutes(e.bedtime, e.wakeTime);
          return (
            <div key={e.id} className="card flex items-center justify-between py-2">
              <div>
                <p className="text-sm">{e.date}</p>
                <p className="text-xs text-text-secondary">
                  {Math.floor(mins / 60)}h {mins % 60}m · quality {e.quality}/10
                </p>
              </div>
              <button
                onClick={() => {
                  sleepStore.remove(e.id);
                  refresh();
                }}
                className="text-negative text-xs"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
