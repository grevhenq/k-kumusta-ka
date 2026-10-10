import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function QuickEntryCard({
  href,
  label,
  icon: Icon,
  recorded,
  hint,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  recorded: boolean;
  hint?: string;
}) {
  return (
    <Link href={href} className="card flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center text-primary-deep shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-text-secondary truncate">{hint}</p>}
      </div>
      {recorded ? (
        <CheckCircle2 size={18} className="text-positive shrink-0" />
      ) : (
        <Circle size={18} className="text-text-secondary/40 shrink-0" />
      )}
    </Link>
  );
}
