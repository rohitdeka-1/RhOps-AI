import { IconUsers } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters, type SortOption } from "@/lib/filter-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sortLabels: Record<SortOption, string> = {
  first_name_asc: "First name A–Z",
  last_name_asc: "Last name A–Z",
  start_date_newest: "Start date (newest)",
  start_date_oldest: "Start date (oldest)",
  date_added_newest: "Date added (newest)",
};

interface PageHeaderProps {
  selectedCount?: number;
  onClearSelection?: () => void;
}

export function PageHeader({ selectedCount = 0, onClearSelection }: PageHeaderProps = {}) {
  const { useEmployees } = useDataProvider();
  const { filters, setFilters } = useFilters();
  const { data: employees } = useEmployees(filters);

  const totalEmployees = employees.length;
  const totalDepartments = new Set(employees.map((e) => e.department)).size;
  const currentSort = filters.sort ?? "first_name_asc";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconUsers className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Employees
          </h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm text-primary hover:underline">
            by {sortLabels[currentSort]} &#9662;
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={currentSort}
              onValueChange={(v) => setFilters({ sort: v as SortOption })}
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {selectedCount > 0 ? (
        <p className="text-sm font-medium text-foreground">
          {selectedCount} selected
          {onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-3 text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Clear
            </button>
          )}
        </p>
      ) : totalEmployees > 0 ? (
        <p className="text-sm text-muted-foreground">
          {totalEmployees} employee{totalEmployees === 1 ? "" : "s"} &middot;{" "}
          {totalDepartments} department{totalDepartments === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
