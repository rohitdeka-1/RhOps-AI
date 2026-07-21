import { IconCalendar } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";

export function PageHeader() {
  const { useUpcomingBirthdays } = useDataProvider();
  const { data: upcoming } = useUpcomingBirthdays(30);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <IconCalendar className="size-6 text-muted-foreground" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Birthdays
        </h1>
      </div>
      {upcoming.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {upcoming.length} upcoming
        </p>
      )}
    </div>
  );
}
