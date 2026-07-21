import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFilters } from "@/lib/filter-context";
import { useDataProvider } from "@/lib/data-provider";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatBirthdayLabel(birthday: string): string {
  const [mm, dd] = birthday.split("-").map(Number);
  return `${MONTH_NAMES[mm! - 1]!.slice(0, 3)} ${dd}`;
}

interface BirthdayRowProps {
  entry: { id: string; full_name: string; birthday: string; avatar_url: string | null };
  prefix: string;
}

function BirthdayRow({ entry, prefix }: BirthdayRowProps) {
  const avatarSrc = useSignedAvatarUrl(entry.avatar_url);
  return (
    <Link
      to={`${prefix}/employees/${entry.id}`}
      className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
    >
      <Avatar className="h-8 w-8">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={entry.full_name} />}
        <AvatarFallback className="text-xs">
          {getInitials(entry.full_name)}
        </AvatarFallback>
      </Avatar>
      <span>
        {entry.full_name} ({formatBirthdayLabel(entry.birthday)})
      </span>
    </Link>
  );
}

export function ThisMonthPanel() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const { calendarFilters } = useFilters();
  const { useBirthdaysByPeriod } = useDataProvider();

  const monthFilters = {
    view: "month" as const,
    year: calendarFilters.year,
    month: calendarFilters.month ?? 1,
  };
  const { data: birthdays } = useBirthdaysByPeriod(monthFilters);

  const sorted = [...birthdays].sort((a, b) =>
    a.birthday.localeCompare(b.birthday),
  );

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground">
        This month
      </p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No birthdays this month.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {sorted.map((entry) => (
            <BirthdayRow key={entry.id} entry={entry} prefix={prefix} />
          ))}
        </div>
      )}
    </div>
  );
}

