import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/base/badge";
import { useDataProvider } from "@/lib/data-provider";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatStartDate(iso: string): string {
  const d = new Date(iso);
  return `Started ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

interface HireRowProps {
  hire: {
    id: string;
    full_name: string;
    role: string;
    department: string;
    start_date: string;
    avatar_url: string | null;
  };
  prefix: string;
}

function HireRow({ hire, prefix }: HireRowProps) {
  const avatarSrc = useSignedAvatarUrl(hire.avatar_url);
  return (
    <Link
      to={`${prefix}/employees/${hire.id}`}
      className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
    >
      <Avatar className="h-10 w-10">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={hire.full_name} />}
        <AvatarFallback className="text-xs">
          {getInitials(hire.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">
          {hire.full_name}
        </p>
        <div className="flex items-center gap-2">
          <Badge color="gray">{hire.role}</Badge>
          <span className="text-sm text-muted-foreground">
            {hire.department.charAt(0).toUpperCase() + hire.department.slice(1)}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        {formatStartDate(hire.start_date)}
      </p>
    </Link>
  );
}

export function RecentHires() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const { useRecentHires } = useDataProvider();
  const { data: hires, isLoading } = useRecentHires(3);

  if (isLoading) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Recent hires</h2>
        <div className="border-b border-dashed border-border" />
      </div>

      <div className="space-y-1">
        {hires.map((hire) => (
          <HireRow key={hire.id} hire={hire} prefix={prefix} />
        ))}
      </div>

      <Link
        to={`${prefix}/employees`}
        className="inline-block text-sm text-primary hover:underline"
      >
        View all employees &rarr;
      </Link>
    </section>
  );
}
