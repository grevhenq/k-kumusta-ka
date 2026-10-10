"use client";

import { useEffect, useState } from "react";
import { diaryStore, todayLocalISODate, type DiaryEntry } from "@/lib/storage";

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const today = todayLocalISODate();

  function refresh() {
    setEntries(diaryStore.list());
  }

  useEffect(() => {
    refresh();
    const existing = diaryStore.forDate(today);
    if (existing) {
      setTitle(existing.title ?? "");
      setBody(existing.body);
      setCurrentId(existing.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave, debounced.
  useEffect(() => {
    if (!body && !title) return;
    const handle = setTimeout(() => {
      const saved = diaryStore.upsert({
        id: currentId,
        date: today,
        updatedAt: new Date().toISOString(),
        title: title.trim() || undefined,
        body,
      });
      setCurrentId(saved.id);
      setSavedAt(new Date().toLocaleTimeString());
      refresh();
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Diary</h1>

      <div className="card space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full rounded-xl border border-lavender px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write whatever is on your mind. This stays private by default."
          className="w-full rounded-xl border border-lavender p-3 text-sm min-h-[220px]"
        />
        <p className="text-xs text-text-secondary">{savedAt ? `Saved at ${savedAt}` : "Not saved yet"}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Past entries</p>
        {entries
          .filter((e) => e.date !== today)
          .map((e) => (
            <div key={e.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{e.title || e.date}</p>
                  <p className="text-xs text-text-secondary">{e.date}</p>
                </div>
                <button
                  onClick={() => {
                    diaryStore.remove(e.id);
                    refresh();
                  }}
                  className="text-negative text-xs"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap">{e.body}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
