import { useMemo } from "react";
import { useFilters } from "@/lib/filter-context";
import { useDataProvider } from "@/lib/data-provider";
import type { BirthdayEntry } from "@/lib/data-provider";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

interface MiniMonthProps {
  year: number;
  month: number;
  birthdayDays: Set<number>;
  onMonthClick: (month: number) => void;
}

function MiniMonth({ year, month, birthdayDays, onMonthClick }: MiniMonthProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  return (
    <div>
      <button
        type="button"
        onClick={() => onMonthClick(month)}
        className="mb-2 text-sm font-medium text-primary hover:underline"
      >
        {MONTH_NAMES[month - 1]}
      </button>
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-muted-foreground"
          >
            {label}
          </div>
        ))}
        {cells.map((day, i) => {
          const hasBirthday = day !== null && birthdayDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;

          return (
            <div key={i} className="flex h-5 items-center justify-center">
              {day !== null && (
                <div className="relative flex items-center justify-center">
                  <span
                    className={`text-[10px] ${
                      isToday ? "font-medium text-primary" : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {hasBirthday && (
                    <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function YearView() {
  const { calendarFilters, setCalendarFilters } = useFilters();
  const { useBirthdaysByPeriod } = useDataProvider();
  const { data: birthdays } = useBirthdaysByPeriod(calendarFilters);
  const year = calendarFilters.year;

  const birthdaysByMonth = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const b of birthdays) {
      const [mm, dd] = b.birthday.split("-").map(Number);
      if (!map.has(mm!)) map.set(mm!, new Set());
      map.get(mm!)!.add(dd!);
    }
    return map;
  }, [birthdays]);

  const handleMonthClick = (month: number) => {
    setCalendarFilters({ view: "month", month });
  };

  return (
    <div className="grid grid-cols-3 gap-6 sm:grid-cols-4">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
        <MiniMonth
          key={month}
          year={year}
          month={month}
          birthdayDays={birthdaysByMonth.get(month) ?? new Set()}
          onMonthClick={handleMonthClick}
        />
      ))}
    </div>
  );
}
