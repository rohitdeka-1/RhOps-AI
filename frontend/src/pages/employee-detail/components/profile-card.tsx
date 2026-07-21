import { useMemo } from "react";
import { IconMail, IconPhone, IconCake } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/base/badge";
import type { BadgeColor } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Separator } from "@/components/ui/separator";
import { FunFactsGrid } from "./fun-facts-grid";
import type { Employee, Department } from "@/data/seed";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function computeTenure(startDate: string): { label: string; years: number } {
  const start = new Date(startDate);
  const now = new Date();
  const formatted = start.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const years = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return {
    label: `Joined ${formatted} · ${years} yr${years === 1 ? "" : "s"}`,
    years,
  };
}

function formatBirthday(mmdd: string): string {
  const [mm, dd] = mmdd.split("-").map(Number);
  const date = new Date(2000, mm - 1, dd);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

const deptColors: Record<Department, BadgeColor> = {
  engineering: "mint",
  product: "blue",
  design: "purple",
  operations: "amber",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface ProfileCardProps {
  employee: Employee;
  onEdit: () => void;
  onRemove: () => void;
}

export function ProfileCard({ employee, onEdit, onRemove }: ProfileCardProps) {
  const tenure = useMemo(
    () => computeTenure(employee.start_date),
    [employee.start_date]
  );
  const firstName = employee.full_name.split(" ")[0];
  const hasContact = employee.email || employee.phone || employee.birthday;
  const avatarUrl = useSignedAvatarUrl(employee.avatar_url);

  return (
    <div className="mx-auto max-w-[600px] space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-32 w-32">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={employee.full_name} />}
            <AvatarFallback className="text-2xl">
              {getInitials(employee.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              {employee.full_name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Badge color="gray">{employee.role}</Badge>
              <Badge color={deptColors[employee.department]}>
                {capitalize(employee.department)}
              </Badge>
              {employee.location && (
                <span className="text-sm text-muted-foreground">
                  · {employee.location}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tenure.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              Remove
            </Button>
          </div>
      </div>

        {hasContact && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Contact</h3>
              <div className="space-y-3">
                {employee.email && (
                  <div className="flex items-center gap-3">
                    <IconMail className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {employee.email}
                    </span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <IconPhone className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {employee.phone}
                    </span>
                  </div>
                )}
                {employee.birthday && (
                  <div className="flex items-center gap-3">
                    <IconCake className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {formatBirthday(employee.birthday)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />
        <FunFactsGrid funFacts={employee.fun_facts} firstName={firstName} />
    </div>
  );
}
