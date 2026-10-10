"use client";

import { useEffect, useState } from "react";
import { settingsStore, type AppSettings } from "@/lib/storage";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(settingsStore.get());
  }, []);

  function update(patch: Partial<AppSettings>) {
    const next = settingsStore.save(patch);
    setSettings(next);
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="card space-y-4">
        <p className="text-sm font-medium">Daily encouragement</p>
        <div className="flex flex-col gap-2 text-sm">
          {(
            [
              ["personalized", "Personalized — uses diary content with an AI provider (requires explicit consent below)"],
              ["private", "Private — general encouragement, nothing sent externally"],
              ["off", "Off — hide the card"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-start gap-2">
              <input
                type="radio"
                checked={settings.encouragementMode === value}
                onChange={() => update({ encouragementMode: value })}
                className="mt-1 accent-primary"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm pt-2 border-t border-lavender">
          <input
            type="checkbox"
            checked={settings.diaryAIConsent}
            onChange={(e) => update({ diaryAIConsent: e.target.checked })}
            className="accent-primary"
            disabled={settings.encouragementMode !== "personalized"}
          />
          I consent to my diary text being sent to a configured external AI provider for personalization.
        </label>
        <p className="text-xs text-text-secondary">
          This starter does not yet call an external AI provider — see the README. This toggle is wired and will
          gate that integration once it is added.
        </p>
      </div>

      <div className="card space-y-3">
        <p className="text-sm font-medium">Profile</p>
        <label className="text-sm block">
          Nickname
          <input
            value={settings.nickname ?? ""}
            onChange={(e) => update({ nickname: e.target.value })}
            className="w-full mt-1 rounded-xl border border-lavender px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm block">
          Theme
          <select
            value={settings.theme}
            onChange={(e) => update({ theme: e.target.value as AppSettings["theme"] })}
            className="w-full mt-1 rounded-xl border border-lavender px-3 py-2 text-sm"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <div className="card">
        <p className="text-sm font-medium mb-1">Data</p>
        <p className="text-xs text-text-secondary mb-2">
          Your data currently lives only in this browser&apos;s local storage (see README). Supabase
          authentication and multi-device sync are not yet connected.
        </p>
        <button
          onClick={() => {
            if (confirm("This clears all locally stored K? data on this device. Continue?")) {
              window.localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-sm px-4 py-2 rounded-xl border border-negative text-negative"
        >
          Clear local data
        </button>
      </div>
    </div>
  );
}
