"use client";

import { useEffect, useState } from "react";
import { Smile, Activity, Moon, Pill, BookOpen } from "lucide-react";
import { EncouragementCard } from "@/components/EncouragementCard";
import { QuickEntryCard } from "@/components/QuickEntryCard";
import {
  moodStore,
  symptomStore,
  sleepStore,
  doseStore,
  diaryStore,
  medicationStore,
  todayLocalISODate,
} from "@/lib/storage";

export default function HomePage() {
  const [today, setToday] = useState<string>("");
  const [completion, setCompletion] = useState({
    mood: false,
    symptoms: false,
    sleep: false,
    medications: false,
    diary: false,
  });

  useEffect(() => {
    const date = todayLocalISODate();
    setToday(date);
    const hasMeds = medicationStore.list().length > 0;
    const doseRecorded = doseStore.forDate(date).some((d) => d.status !== "unrecorded");
    setCompletion({
      mood: moodStore.forDate(date).length > 0,
      symptoms: symptomStore.forDate(date).length > 0,
      sleep: Boolean(sleepStore.forDate(date)),
      medications: hasMeds ? doseRecorded : true,
      diary: Boolean(diaryStore.forDate(date)),
    });
  }, []);

  const completedCount = Object.values(completion).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Kumusta ka?</h1>
        <p className="text-text-secondary text-sm">
          {today ? new Date(today).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
        </p>
      </div>

      <p className="text-sm text-text-secondary">
        {completedCount} of 5 check-ins so far today. No streaks, no pressure — skip anything you don&apos;t need.
      </p>

      <EncouragementCard />

      <div className="grid grid-cols-1 gap-3">
        <QuickEntryCard href="/mood" label="Mood" icon={Smile} recorded={completion.mood} hint="How are you feeling?" />
        <QuickEntryCard href="/symptoms" label="Symptoms" icon={Activity} recorded={completion.symptoms} hint="Anything to log?" />
        <QuickEntryCard href="/sleep" label="Sleep" icon={Moon} recorded={completion.sleep} hint="Last night's rest" />
        <QuickEntryCard href="/medications" label="Medications" icon={Pill} recorded={completion.medications} hint="Today's doses" />
        <QuickEntryCard href="/diary" label="Diary" icon={BookOpen} recorded={completion.diary} hint="Write a little, or a lot" />
      </div>

      <div className="flex gap-3 text-sm">
        <a href="/calendar" className="text-primary-deep underline">
          View calendar
        </a>
        <a href="/reports" className="text-primary-deep underline">
          Build a report
        </a>
      </div>
    </div>
  );
}
