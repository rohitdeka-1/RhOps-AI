import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/base/badge";
import { cn } from "@/lib/utils";
import type { Employee, Department } from "@/data/seed";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shortenName(name: string): string {
  const parts = name.split(" ");
  if (parts.length <= 1) return name;
  if (name.length <= 12) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function shortenRole(role: string): string {
  return role
    .replace("Senior ", "Sr. ")
    .replace("Product ", "Prod. ")
    .replace("Operations ", "Ops. ")
    .replace("Manager", "Mgr")
    .replace("Coordinator", "Coord.");
}

interface EmployeeGridProps {
  employees: Employee[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

interface DepartmentGroup {
  department: Department;
  label: string;
  employees: Employee[];
}

export function EmployeeGrid({
  employees,
  selectedIds,
  onToggleSelect,
}: EmployeeGridProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const groups = useMemo(() => {
    const deptOrder: Department[] = [
      "engineering",
      "product",
      "design",
      "operations",
    ];
    const map = new Map<Department, Employee[]>();
    for (const emp of employees) {
      const list = map.get(emp.department) ?? [];
      list.push(emp);
      map.set(emp.department, list);
    }
    const result: DepartmentGroup[] = [];
    for (const dept of deptOrder) {
      const list = map.get(dept);
      if (list && list.length > 0) {
        result.push({
          department: dept,
          label: capitalize(dept),
          employees: list,
        });
      }
    }
    return result;
  }, [employees]);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.department} className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label} &middot; {group.employees.length}
            </span>
            <div className="mt-2 border-b border-dashed border-border" />
          </div>
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
            {group.employees.map((emp) => {
              const isSelected = selectedIds.has(emp.id);
              return (
                <div
                  key={emp.id}
                  className="flex cursor-pointer flex-col items-center gap-2 text-center"
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      onToggleSelect(emp.id);
                    } else {
                      navigate(`${prefix}/employees/${emp.id}`);
                    }
                  }}
                >
                  <Avatar
                    className={cn(
                      "h-20 w-20 text-lg",
                      isSelected && "ring-2 ring-primary",
                    )}
                  >
                    <AvatarFallback>{getInitials(emp.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {shortenName(emp.full_name)}
                    </p>
                    <Badge color="gray">{shortenRole(emp.role)}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
