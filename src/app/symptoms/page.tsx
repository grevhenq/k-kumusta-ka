"use client";

import { useEffect, useState } from "react";
import { symptomStore, todayLocalISODate, type SymptomObservation, type SymptomDefinition } from "@/lib/storage";

export default function SymptomsPage() {
  const [defs, setDefs] = useState<SymptomDefinition[]>([]);
  const [obs, setObs] = useState<SymptomObservation[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [severity, setSeverity] = useState(5);
  const [note, setNote] = useState("");
  const [newSymptom, setNewSymptom] = useState("");

  function refresh() {
    setDefs(symptomStore.definitions());
    setObs(symptomStore.list());
  }
  useEffect(refresh, []);

  function save() {
    if (!selected) return;
    symptomStore.create({
      date: todayLocalISODate(),
      timestamp: new Date().toISOString(),
      symptomId: selected,
      severity,
      note: note.trim() || undefined,
    });
    setNote("");
    refresh();
  }

  function addCustom() {
    if (!newSymptom.trim()) return;
    const def = symptomStore.addDefinition(newSymptom.trim());
    setNewSymptom("");
    refresh();
    setSelected(def.id);
  }

  const byId = Object.fromEntries(defs.map((d) => [d.id, d.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Symptoms</h1>

      <div className="card space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Symptom</p>
          <div className="flex flex-wrap gap-2">
            {defs.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  selected === d.id ? "bg-primary text-white border-primary" : "border-lavender text-text-secondary"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="Add a custom symptom..."
              className="flex-1 rounded-xl border border-lavender px-3 py-2 text-sm"
            />
            <button onClick={addCustom} className="text-sm px-3 py-2 rounded-xl bg-lavender text-primary-deep">
              Add
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Severity</span>
            <span className="text-text-secondary">{severity}/10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (duration, time of day, context)..."
          className="w-full rounded-xl border border-lavender p-3 text-sm min-h-[60px]"
        />

        <button
          onClick={save}
          disabled={!selected}
          className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
        >
          Log symptom
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">History</p>
        {obs.length === 0 && <p className="text-sm text-text-secondary">No symptoms logged yet.</p>}
        {obs
          .slice()
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 20)
          .map((o) => (
            <div key={o.id} className="card flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{byId[o.symptomId] ?? "Unknown"}</p>
                <p className="text-xs text-text-secondary">{new Date(o.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>{o.severity}/10</span>
                <button
                  onClick={() => {
                    symptomStore.remove(o.id);
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
