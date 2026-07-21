import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/base/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFilters } from "@/lib/filter-context";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getWeekStart(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  return d;
}

function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    `${MONTH_NAMES[d.getMonth()]!.slice(0, 3)} ${d.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export function CalendarControls() {
  const { calendarFilters, setCalendarFilters } = useFilters();
  const { view, year, month } = calendarFilters;

  const handleViewChange = (value: string) => {
    if (!value) return;
    const newView = value as "month" | "week" | "year";
    if (newView === "week") {
      const now = new Date();
      const ws = getWeekStart(now.getFullYear(), now.getMonth() + 1, now.getDate());
      setCalendarFilters({
        view: newView,
        year: ws.getFullYear(),
        month: ws.getMonth() + 1,
        weekStart: ws.toISOString().split("T")[0],
      });
    } else {
      setCalendarFilters({ view: newView });
    }
  };

  const handlePrev = () => {
    if (view === "month") {
      const m = (month ?? 1) - 1;
      if (m < 1) {
        setCalendarFilters({ month: 12, year: year - 1 });
      } else {
        setCalendarFilters({ month: m });
      }
    } else if (view === "week" && calendarFilters.weekStart) {
      const ws = new Date(calendarFilters.weekStart);
      ws.setDate(ws.getDate() - 7);
      setCalendarFilters({
        weekStart: ws.toISOString().split("T")[0],
        year: ws.getFullYear(),
        month: ws.getMonth() + 1,
      });
    } else if (view === "year") {
      setCalendarFilters({ year: year - 1 });
    }
  };

  const handleNext = () => {
    if (view === "month") {
      const m = (month ?? 1) + 1;
      if (m > 12) {
        setCalendarFilters({ month: 1, year: year + 1 });
      } else {
        setCalendarFilters({ month: m });
      }
    } else if (view === "week" && calendarFilters.weekStart) {
      const ws = new Date(calendarFilters.weekStart);
      ws.setDate(ws.getDate() + 7);
      setCalendarFilters({
        weekStart: ws.toISOString().split("T")[0],
        year: ws.getFullYear(),
        month: ws.getMonth() + 1,
      });
    } else if (view === "year") {
      setCalendarFilters({ year: year + 1 });
    }
  };

  let periodLabel = "";
  if (view === "month") {
    periodLabel = `${MONTH_NAMES[(month ?? 1) - 1]} ${year}`;
  } else if (view === "week" && calendarFilters.weekStart) {
    periodLabel = formatWeekLabel(calendarFilters.weekStart);
  } else if (view === "year") {
    periodLabel = String(year);
  }

  return (
    <div className="flex items-center justify-between">
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={handleViewChange}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handlePrev}>
          <IconChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[180px] text-center text-sm font-medium">
          {periodLabel}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
