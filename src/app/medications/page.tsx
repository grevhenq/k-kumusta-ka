"use client";

import { useEffect, useState } from "react";
import { medicationStore, doseStore, todayLocalISODate, type Medication, type DoseStatus } from "@/lib/storage";

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState("08:00");
  const today = todayLocalISODate();

  function refresh() {
    setMeds(medicationStore.list());
  }
  useEffect(refresh, []);

  function addMedication() {
    if (!name.trim()) return;
    medicationStore.create({
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      startDate: today,
      scheduleTimes: times.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setName("");
    setDosage("");
    setTimes("08:00");
    refresh();
  }

  function setStatus(medicationId: string, scheduledTime: string, status: DoseStatus) {
    const existing = doseStore.forDate(today).find((d) => d.medicationId === medicationId && d.scheduledTime === scheduledTime);
    doseStore.upsert({
      id: existing?.id,
      medicationId,
      date: today,
      scheduledTime,
      status,
      timestamp: new Date().toISOString(),
    });
    refresh();
  }

  const todaysDoses = doseStore.forDate(today);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Medications</h1>

      <div className="card space-y-3">
        <p className="text-sm font-medium">Add a medication</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-xl border border-lavender px-3 py-2 text-sm"
        />
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Dosage / instructions (optional)"
          className="w-full rounded-xl border border-lavender px-3 py-2 text-sm"
        />
        <input
          value={times}
          onChange={(e) => setTimes(e.target.value)}
          placeholder="Dose times, comma separated (e.g. 08:00, 20:00)"
          className="w-full rounded-xl border border-lavender px-3 py-2 text-sm"
        />
        <button onClick={addMedication} className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium">
          Add medication
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Today&apos;s doses</p>
        {meds.length === 0 && <p className="text-sm text-text-secondary">No medications configured yet.</p>}
        {meds.map((m) => (
          <div key={m.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                {m.dosage && <p className="text-xs text-text-secondary">{m.dosage}</p>}
              </div>
              <button
                onClick={() => {
                  medicationStore.remove(m.id);
                  refresh();
                }}
                className="text-negative text-xs"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              {m.scheduleTimes.map((t) => {
                const dose = todaysDoses.find((d) => d.medicationId === m.id && d.scheduledTime === t);
                const status = dose?.status ?? "unrecorded";
                return (
                  <div key={t} className="flex items-center justify-between text-sm">
                    <span>{t}</span>
                    <div className="flex gap-1">
                      {(["taken", "skipped"] as DoseStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(m.id, t, s)}
                          className={`text-xs px-3 py-1 rounded-full border ${
                            status === s
                              ? s === "taken"
                                ? "bg-positive text-white border-positive"
                                : "bg-caution text-white border-caution"
                              : "border-lavender text-text-secondary"
                          }`}
                        >
                          {s === "taken" ? "Taken" : "Skipped"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-secondary">
        Doses with no recorded status are shown as unrecorded, not as missed — K? never assumes a dose was skipped
        just because it wasn&apos;t logged.
      </p>
    </div>
  );
}
