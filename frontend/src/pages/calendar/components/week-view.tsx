import { useMemo } from "react";
import { useFilters } from "@/lib/filter-context";
import { useDataProvider } from "@/lib/data-provider";
import type { BirthdayEntry } from "@/lib/data-provider";
import { BirthdayAvatar } from "./birthday-avatar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekView() {
  const { calendarFilters } = useFilters();
  const { useBirthdaysByPeriod } = useDataProvider();
  const { data: birthdays } = useBirthdaysByPeriod(calendarFilters);

  const weekStart = calendarFilters.weekStart
    ? new Date(calendarFilters.weekStart)
    : new Date();

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      result.push(d);
    }
    return result;
  }, [weekStart.toISOString()]);

  const birthdaysByDayOfWeek = useMemo(() => {
    const map = new Map<number, BirthdayEntry[]>();
    for (const b of birthdays) {
      const [mm, dd] = b.birthday.split("-").map(Number);
      for (let i = 0; i < days.length; i++) {
        const day = days[i]!;
        if (day.getMonth() + 1 === mm && day.getDate() === dd) {
          const existing = map.get(i) ?? [];
          existing.push(b);
          map.set(i, existing);
        }
      }
    }
    return map;
  }, [birthdays, days]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex h-full flex-col border-t border-border">
      <div className="grid flex-1 grid-cols-7 gap-0">
        {days.map((day, i) => {
          const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
          const isToday = dayStr === todayStr;
          const entries = birthdaysByDayOfWeek.get(i) ?? [];

          return (
            <div
              key={i}
              className="h-full min-h-0 overflow-auto border-b border-r border-border p-2 last:border-r-0 [&:nth-child(7)]:border-r-0"
            >
              <div className="mb-2 text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {DAY_LABELS[i]}
                </div>
                <span
                  className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                {entries.map((entry) => (
                  <BirthdayAvatar key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


