"use client";

import { useEffect, useState } from "react";
import { moodStore, todayLocalISODate, type MoodEntry } from "@/lib/storage";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EMOTION_LABELS = [
  "calm", "happy", "anxious", "sad", "irritable", "numb", "overwhelmed", "hopeful", "motivated",
];

export default function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [note, setNote] = useState("");

  function refresh() {
    setEntries(moodStore.list());
  }

  useEffect(refresh, []);

  function toggleEmotion(e: string) {
    setEmotions((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]));
  }

  function save() {
    const now = new Date();
    moodStore.create({
      date: todayLocalISODate(),
      timestamp: now.toISOString(),
      mood,
      energy,
      stress,
      emotions,
      note: note.trim() || undefined,
    });
    setNote("");
    setEmotions([]);
    refresh();
  }

  const chartData = [...entries]
    .slice(0, 14)
    .reverse()
    .map((e) => ({ date: e.date.slice(5), mood: e.mood }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Mood</h1>

      <div className="card space-y-4">
        <Slider label="Mood" value={mood} onChange={setMood} />
        <Slider label="Energy" value={energy} onChange={setEnergy} />
        <Slider label="Stress / anxiety" value={stress} onChange={setStress} />

        <div>
          <p className="text-sm font-medium mb-2">Emotions (optional)</p>
          <div className="flex flex-wrap gap-2">
            {EMOTION_LABELS.map((e) => (
              <button
                key={e}
                onClick={() => toggleEmotion(e)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  emotions.includes(e) ? "bg-primary text-white border-primary" : "border-lavender text-text-secondary"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note about context..."
          className="w-full rounded-xl border border-lavender p-3 text-sm min-h-[70px]"
        />

        <button onClick={save} className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium">
          Save mood check-in
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="card">
          <p className="text-sm font-medium mb-2">Last 14 entries</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} width={24} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#7C5CFC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">History</p>
        {entries.length === 0 && <p className="text-sm text-text-secondary">No mood entries yet.</p>}
        {entries.slice(0, 20).map((e) => (
          <div key={e.id} className="card flex items-center justify-between py-2">
            <div>
              <p className="text-sm">{new Date(e.timestamp).toLocaleString()}</p>
              {e.emotions.length > 0 && <p className="text-xs text-text-secondary">{e.emotions.join(", ")}</p>}
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span>Mood {e.mood}</span>
              <button
                onClick={() => {
                  moodStore.remove(e.id);
                  refresh();
                }}
                className="text-negative text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-text-secondary">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
