import { useMemo } from "react";
import { useFilters } from "@/lib/filter-context";
import { useDataProvider } from "@/lib/data-provider";
import type { BirthdayEntry } from "@/lib/data-provider";
import { BirthdayAvatar } from "./birthday-avatar";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView() {
  const { calendarFilters } = useFilters();
  const { useBirthdaysByPeriod } = useDataProvider();
  const { data: birthdays } = useBirthdaysByPeriod(calendarFilters);

  const month = calendarFilters.month ?? 1;
  const year = calendarFilters.year;

  const birthdaysByDay = useMemo(() => {
    const map = new Map<number, BirthdayEntry[]>();
    for (const b of birthdays) {
      const day = parseInt(b.birthday.split("-")[1]!, 10);
      const existing = map.get(day) ?? [];
      existing.push(b);
      map.set(day, existing);
    }
    return map;
  }, [birthdays]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex h-full flex-col border-t border-border">
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid min-h-0 flex-1 grid-cols-7 gap-0">
            {week.map((day, di) => {
              const entries = day ? (birthdaysByDay.get(day) ?? []) : [];
              const isToday = isCurrentMonth && day === todayDate;

              return (
                <div
                  key={di}
                  className="h-full min-h-0 overflow-auto border-b border-r border-border p-1.5 last:border-r-0 [&:nth-child(7)]:border-r-0"
                >
                  {day !== null && (
                    <>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          isToday
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entries.slice(0, 2).map((entry) => (
                          <BirthdayAvatar key={entry.id} entry={entry} />
                        ))}
                        {entries.length > 2 && (
                          <span className="flex h-8 items-center text-xs text-muted-foreground">
                            +{entries.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

