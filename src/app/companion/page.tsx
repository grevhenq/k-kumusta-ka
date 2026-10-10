"use client";

import { useEffect, useState } from "react";
import { settingsStore } from "@/lib/storage";

/**
 * Companion placeholder.
 *
 * The spec calls for a real 3D shark built with Three.js / React
 * Three Fiber / Drei (section 9). That has not been implemented in
 * this starter — adding it is listed in the README checklist. This
 * page ships a lightweight animated SVG shark instead, so the
 * Companion page is functional (tap-to-react, name customization,
 * persisted settings) while the 3D work is still pending.
 */
export default function CompanionPage() {
  const [name, setName] = useState("Kuya Shark");
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    setName(settingsStore.get().companionName);
  }, []);

  function saveName(n: string) {
    setName(n);
    settingsStore.save({ companionName: n });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Companion</h1>

      <div className="card flex flex-col items-center py-10">
        <button
          onClick={() => {
            setWiggle(true);
            setTimeout(() => setWiggle(false), 500);
          }}
          aria-label="Tap your companion"
          className={`transition-transform ${wiggle ? "scale-110 -rotate-3" : ""}`}
        >
          <SharkSVG />
        </button>
        <p className="mt-4 text-sm text-text-secondary">Tap {name} to say hi.</p>
      </div>

      <div className="card space-y-2">
        <label className="text-sm font-medium">Companion name</label>
        <input
          value={name}
          onChange={(e) => saveName(e.target.value)}
          className="w-full rounded-xl border border-lavender px-3 py-2 text-sm"
        />
      </div>

      <p className="text-xs text-text-secondary">
        {name} never reacts negatively to a difficult day — a low mood score doesn&apos;t make your companion
        disappointed, and growth doesn&apos;t depend on positive moods or low symptoms.
      </p>
    </div>
  );
}

function SharkSVG() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="80" rx="70" ry="38" fill="#7C5CFC" />
      <path d="M150 70 L178 50 L170 85 Z" fill="#5138B8" />
      <path d="M90 42 L110 10 L118 44 Z" fill="#5138B8" />
      <circle cx="140" cy="70" r="6" fill="#242033" />
      <path d="M130 95 Q145 105 160 95" stroke="#242033" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="95" rx="18" ry="8" fill="#EDE7FF" opacity="0.6" />
    </svg>
  );
}
