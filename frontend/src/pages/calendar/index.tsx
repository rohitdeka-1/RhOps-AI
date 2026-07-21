import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";
import { PageHeader } from "./components/page-header";
import { CalendarControls } from "./components/calendar-controls";
import { MonthView } from "./components/month-view";
import { WeekView } from "./components/week-view";
import { YearView } from "./components/year-view";
import { ThisMonthPanel } from "./components/this-month-panel";
import { Blankslate } from "./components/blankslate";

export default function CalendarPage() {
  const { useOverviewStats } = useDataProvider();
  const { data: stats, isLoading } = useOverviewStats();
  const { calendarFilters } = useFilters();

  const isEmpty = !isLoading && stats.totalEmployees === 0;

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {isEmpty ? (
        <div className="flex flex-1 flex-col p-6">
          <PageHeader />
          <Blankslate />
        </div>
      ) : (
        <>
          <header className="space-y-4 px-6 pt-6 pb-4">
            <PageHeader />
            <CalendarControls />
          </header>
          <div className="flex-1 min-h-0">
            {calendarFilters.view === "month" && <MonthView />}
            {calendarFilters.view === "week" && <WeekView />}
            {calendarFilters.view === "year" && <YearView />}
          </div>
          <div className="border-t border-border px-6 py-4">
            <ThisMonthPanel />
          </div>
        </>
      )}
    </main>
  );
}

