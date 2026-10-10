"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Smile,
  Activity,
  Moon,
  Pill,
  BookOpen,
  LineChart,
  Calendar,
  Sparkles,
  FileText,
  Settings,
} from "lucide-react";

const PRIMARY = [
  { href: "/", label: "Today", icon: Home },
  { href: "/mood", label: "Mood", icon: Smile },
  { href: "/symptoms", label: "Symptoms", icon: Activity },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/diary", label: "Diary", icon: BookOpen },
];

const SECONDARY = [
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/companion", label: "Companion", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const all = [...PRIMARY, ...SECONDARY];
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col gap-1 p-4 border-r border-lavender shrink-0">
      <div className="px-2 py-3 mb-2">
        <p className="text-xl font-semibold text-primary">K?</p>
        <p className="text-xs text-text-secondary">Kumusta ka?</p>
      </div>
      {all.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
              active ? "bg-lavender text-primary-deep font-medium" : "text-text-secondary hover:bg-lavender/60"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-lavender safe-bottom z-20">
      <div className="flex justify-between px-2">
        {PRIMARY.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[44px] text-[11px] ${
                active ? "text-primary" : "text-text-secondary"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MoreMenu() {
  return (
    <div className="md:hidden flex flex-wrap gap-2 px-4 pb-24">
      {SECONDARY.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-lavender/60 text-primary-deep"
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </div>
  );
}
