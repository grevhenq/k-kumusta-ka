"use client";

import { useEffect, useState } from "react";
import { Heart, RefreshCw, Info } from "lucide-react";
import {
  diaryStore,
  encouragementStore,
  settingsStore,
  todayLocalISODate,
  type EncouragementMessage,
} from "@/lib/storage";

// A small curated library of original, non-judgmental messages used
// whenever AI generation is unavailable/not configured, or the user
// has chosen "Private" mode (general encouragement, no diary text
// leaves the device). This satisfies the spec's requirement for a
// non-AI fallback (section 8.6) and for Private mode (section 6.7).
const GENERIC_LIBRARY = [
  "You don't have to solve everything today. One small step still counts.",
  "Whatever today looked like, you showed up for it. That's worth noticing.",
  "Rest is not something you have to earn. You're allowed to pause.",
  "Some days are just about getting through. That's enough today.",
  "You're allowed to take up space with however you're feeling right now.",
  "Progress doesn't always look like progress. Be patient with yourself.",
];

function pickGeneric(date: string): string {
  // Deterministic per-day pick so refreshing doesn't change it,
  // without needing to persist anything until the user interacts.
  const hash = date.split("-").reduce((acc, p) => acc + Number(p), 0);
  return GENERIC_LIBRARY[hash % GENERIC_LIBRARY.length];
}

export function EncouragementCard() {
  const [message, setMessage] = useState<EncouragementMessage | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [settings, setSettings] = useState(settingsStore.get());

  useEffect(() => {
    setSettings(settingsStore.get());
    const date = todayLocalISODate();
    const existing = encouragementStore.forDate(date);
    if (existing) {
      setMessage(existing);
      return;
    }
    generate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generate(date: string, forceGeneric = false) {
    const mode = settingsStore.get().encouragementMode;
    const diary = diaryStore.forDate(date);

    let text: string;
    let source: string | undefined;

    if (mode === "personalized" && diary && diary.body.trim().length > 0 && !forceGeneric) {
      // NOTE: true diary-informed personalization requires calling a
      // server-side AI endpoint (see section 6, 8.6) with the user's
      // explicit diary-processing consent already granted in
      // Settings. That API route is not implemented in this starter
      // — wire POST /api/encouragement (to be added) here. Until
      // then we fall back to a generic message even in this branch
      // so the app never silently sends diary text anywhere.
      text = pickGeneric(date);
      source = undefined;
    } else {
      text = pickGeneric(date);
      source = undefined;
    }

    const saved = encouragementStore.save({
      date,
      text,
      type: "original",
      source,
    });
    setMessage(saved);
  }

  if (settings.encouragementMode === "off" || !message) return null;

  return (
    <div className="card bg-lavender/70 border border-lavender relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-primary-deep uppercase tracking-wide">A little something for you</p>
        <span className="text-[10px] text-text-secondary">Today&apos;s reminder</span>
      </div>
      <p className="text-base leading-relaxed text-text-primary">{message.text}</p>
      <div className="flex items-center gap-3 mt-3 text-text-secondary">
        <button
          aria-label="Save as favorite"
          onClick={() => {
            const updated = encouragementStore.save({ ...message, favorited: !message.favorited });
            setMessage(updated);
          }}
          className="flex items-center gap-1 text-xs hover:text-primary-deep"
        >
          <Heart size={14} fill={message.favorited ? "#7C5CFC" : "none"} />
          {message.favorited ? "Saved" : "Save"}
        </button>
        <button
          aria-label="Show another reminder"
          onClick={() => generate(todayLocalISODate(), true)}
          className="flex items-center gap-1 text-xs hover:text-primary-deep"
        >
          <RefreshCw size={14} />
          Another reminder
        </button>
        <button
          aria-label="Why this message"
          onClick={() => setShowWhy((v) => !v)}
          className="flex items-center gap-1 text-xs hover:text-primary-deep"
        >
          <Info size={14} />
          Why this message?
        </button>
      </div>
      {showWhy && (
        <p className="mt-2 text-xs text-text-secondary italic">
          {diaryStore.forDate(todayLocalISODate())
            ? "This is a general reminder. Diary-informed personalization is off or not yet connected to an AI provider, so nothing from your diary was read to produce this."
            : "No diary entry was found for today, so this is a general, non-judgmental reminder rather than something tailored to today specifically."}
        </p>
      )}
    </div>
  );
}
