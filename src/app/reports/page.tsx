"use client";

import { useState } from "react";
import { moodStore, sleepStore, sleepDurationMinutes, medicationStore, doseStore, symptomStore } from "@/lib/storage";

/**
 * Report builder.
 *
 * This generates a print-ready, A4-styled HTML view (see the
 * @media print rules below) that the user can "Print to PDF" from
 * the browser. It uses only real stored data — nothing fabricated.
 *
 * It is NOT yet the dedicated A4 PDF pipeline the spec calls for
 * (section 12) — wiring a real library such as @react-pdf/renderer
 * or pdf-lib for a one-click downloadable PDF (with page numbers,
 * guaranteed pagination, etc.) is tracked in the README checklist.
 */
export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [includeMood, setIncludeMood] = useState(true);
  const [includeSleep, setIncludeSleep] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeSymptoms, setIncludeSymptoms] = useState(true);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState(false);

  const inRange = (date: string) => (!start || date >= start) && (!end || date <= end);

  const moods = moodStore.list().filter((m) => inRange(m.date));
  const sleeps = sleepStore.list().filter((s) => inRange(s.date));
  const symptomObs = symptomStore.list().filter((s) => inRange(s.date));
  const symptomDefs = symptomStore.definitions();
  const meds = medicationStore.list();

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-xl font-semibold mb-4">Reports</h1>
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Start date
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm" />
            </label>
            <label className="text-sm">
              End date
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full mt-1 rounded-xl border border-lavender px-2 py-2 text-sm" />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Toggle label="Mood" checked={includeMood} onChange={setIncludeMood} />
            <Toggle label="Sleep" checked={includeSleep} onChange={setIncludeSleep} />
            <Toggle label="Medications" checked={includeMeds} onChange={setIncludeMeds} />
            <Toggle label="Symptoms" checked={includeSymptoms} onChange={setIncludeSymptoms} />
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Consultation notes / questions for your psychiatrist..."
            className="w-full rounded-xl border border-lavender p-3 text-sm min-h-[80px]"
          />

          <button onClick={() => setPreview(true)} className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium">
            Build report preview
          </button>
        </div>
      </div>

      {preview && (
        <div className="bg-white text-black p-8 print:p-0 mx-auto" style={{ maxWidth: "210mm" }}>
          <div className="flex justify-end print:hidden mb-4">
            <button onClick={() => window.print()} className="text-sm px-4 py-2 rounded-xl bg-primary text-white">
              Print / Save as PDF
            </button>
          </div>

          <h2 className="text-lg font-semibold">K? — Self-Tracking Summary</h2>
          <p className="text-xs text-gray-500 mb-4">
            Period: {start || "(no start selected)"} to {end || "(no end selected)"} · Generated {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mb-4 italic">
            This is a self-tracking summary, not a clinical diagnosis. All values below come directly from entries
            the user recorded in K?.
          </p>

          {includeMood && (
            <section className="mb-4">
              <h3 className="font-medium text-sm mb-1">Mood ({moods.length} entries)</h3>
              {moods.length === 0 ? (
                <p className="text-xs text-gray-500">No mood entries in this period.</p>
              ) : (
                <p className="text-xs">
                  Average mood: {(moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1)}/10 · Average
                  stress: {(moods.reduce((s, m) => s + m.stress, 0) / moods.length).toFixed(1)}/10
                </p>
              )}
            </section>
          )}

          {includeSleep && (
            <section className="mb-4">
              <h3 className="font-medium text-sm mb-1">Sleep ({sleeps.length} entries)</h3>
              {sleeps.length === 0 ? (
                <p className="text-xs text-gray-500">No sleep entries in this period.</p>
              ) : (
                <p className="text-xs">
                  Average duration:{" "}
                  {(sleeps.reduce((s, e) => s + sleepDurationMinutes(e.bedtime, e.wakeTime), 0) / sleeps.length / 60).toFixed(1)}{" "}
                  hours · Average quality: {(sleeps.reduce((s, e) => s + e.quality, 0) / sleeps.length).toFixed(1)}/10
                </p>
              )}
            </section>
          )}

          {includeSymptoms && (
            <section className="mb-4">
              <h3 className="font-medium text-sm mb-1">Symptoms ({symptomObs.length} observations)</h3>
              {symptomObs.length === 0 ? (
                <p className="text-xs text-gray-500">No symptoms logged in this period.</p>
              ) : (
                <ul className="text-xs list-disc pl-4">
                  {Array.from(new Set(symptomObs.map((o) => o.symptomId))).map((id) => {
                    const name = symptomDefs.find((d) => d.id === id)?.name ?? "Unknown";
                    const items = symptomObs.filter((o) => o.symptomId === id);
                    const avg = items.reduce((s, o) => s + o.severity, 0) / items.length;
                    return (
                      <li key={id}>
                        {name}: {items.length}x, average severity {avg.toFixed(1)}/10
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {includeMeds && (
            <section className="mb-4">
              <h3 className="font-medium text-sm mb-1">Medications</h3>
              {meds.length === 0 ? (
                <p className="text-xs text-gray-500">No medications configured.</p>
              ) : (
                <ul className="text-xs list-disc pl-4">
                  {meds.map((m) => (
                    <li key={m.id}>
                      {m.name} {m.dosage ? `— ${m.dosage}` : ""} · scheduled at {m.scheduleTimes.join(", ")}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Adherence is only reported for doses explicitly marked taken or skipped; unrecorded doses are
                excluded from any adherence percentage, never counted as missed.
              </p>
            </section>
          )}

          {notes && (
            <section className="mb-4">
              <h3 className="font-medium text-sm mb-1">Consultation notes</h3>
              <p className="text-xs whitespace-pre-wrap">{notes}</p>
            </section>
          )}
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          nav, aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-primary" />
      {label}
    </label>
  );
}
