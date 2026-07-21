import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/base/badge";
import type { BadgeColor } from "@/components/base/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/base/button";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatStartDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const deptColors: Record<Department, BadgeColor> = {
  engineering: "mint",
  product: "blue",
  design: "purple",
  operations: "amber",
};

const deptLabels: Record<Department, string> = {
  engineering: "Eng",
  product: "Prd",
  design: "Dsgn",
  operations: "Ops",
};

interface EmployeeTableProps {
  employees: Employee[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (employee: Employee) => void;
}

interface DepartmentGroup {
  department: Department;
  label: string;
  employees: Employee[];
}

interface EmployeeRowProps {
  emp: Employee;
  selected: boolean;
  prefix: string;
  onToggleSelect: (id: string) => void;
  onDelete: (employee: Employee) => void;
  onNavigate: (id: string) => void;
}

function EmployeeRow({ emp, selected, prefix, onToggleSelect, onDelete, onNavigate }: EmployeeRowProps) {
  const avatarSrc = useSignedAvatarUrl(emp.avatar_url);
  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-4 px-4 py-2 transition-colors hover:bg-muted/60"
        onClick={() => onNavigate(emp.id)}
      >
        <div className="w-8" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(emp.id)}
            aria-label={`Select ${emp.full_name}`}
          />
        </div>
        <Avatar className="h-10 w-10">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={emp.full_name} />}
          <AvatarFallback className="text-xs">
            {getInitials(emp.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {emp.full_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {emp.location}
          </p>
        </div>
        <div className="w-40 hidden md:block">
          <Badge color="gray" className="truncate max-w-full">
            {emp.role}
          </Badge>
        </div>
        <div className="w-20 hidden lg:block">
          <Badge color={deptColors[emp.department]}>
            {deptLabels[emp.department]}
          </Badge>
        </div>
        <div className="w-24 hidden lg:block text-right">
          <span className="text-sm text-muted-foreground">
            {formatStartDate(emp.start_date)}
          </span>
        </div>
        <div className="w-8" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconDots className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`${prefix}/employees/${emp.id}`}>
                  <IconPencil className="size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(emp)}
              >
                <IconTrash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-b border-dashed border-border" />
    </div>
  );
}

export function EmployeeTable({
  employees,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onDelete,
}: EmployeeTableProps) {
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

  const allSelected =
    employees.length > 0 && employees.every((e) => selectedIds.has(e.id));

  return (
    <div>
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground">
          <div className="w-8">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleAll}
              aria-label="Select all"
            />
          </div>
          <div className="w-10" />
          <div className="flex-1">Name</div>
          <div className="w-40 hidden md:block">Role</div>
          <div className="w-20 hidden lg:block">Dept</div>
          <div className="w-24 hidden lg:block text-right">Joined</div>
          <div className="w-8" />
        </div>
      </div>
      <div className="border-b border-dashed border-border" />

      {groups.map((group) => (
        <div key={group.department}>
          <div className="px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label} &middot; {group.employees.length}
            </span>
          </div>
          <div className="border-b border-dashed border-border" />

          {group.employees.map((emp) => (
            <EmployeeRow
              key={emp.id}
              emp={emp}
              selected={selectedIds.has(emp.id)}
              prefix={prefix}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onNavigate={(id) => navigate(`${prefix}/employees/${id}`)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
