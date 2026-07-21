import { Link, useLocation } from "react-router-dom";
import { IconCake } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";

export function BirthdayCallout() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const { useUpcomingBirthdays } = useDataProvider();
  const { data: birthdays, isLoading } = useUpcomingBirthdays(30);

  if (isLoading || birthdays.length === 0) return null;

  const next = birthdays[0];
  const label =
    next.daysUntil === 0
      ? `${next.full_name}'s birthday is today`
      : next.daysUntil === 1
        ? `${next.full_name}'s birthday is tomorrow`
        : `${next.full_name}'s birthday in ${next.daysUntil} days`;

  return (
    <Link
      to={`${prefix}/calendar`}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <IconCake className="size-4" />
      {label}
    </Link>
  );
}
