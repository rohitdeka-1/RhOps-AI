import { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/filter-context";
import { useDataProvider } from "@/lib/data-provider";
import type { Department } from "@/data/seed";

const departments: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "operations", label: "Operations" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function FilterBar() {
  const { filters, setFilters } = useFilters();
  const { useEmployees } = useDataProvider();

  const emptyFilters = { sort: filters.sort };
  const { data: allEmployees } = useEmployees(emptyFilters);

  const locations = Array.from(
    new Set(allEmployees.map((e) => e.location).filter(Boolean) as string[]),
  ).sort();

  const [localSearch, setLocalSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, setFilters]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, role, or location…"
          className="pl-9"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>
      <Select
        value={filters.department ?? "all"}
        onValueChange={(v) =>
          setFilters({ department: v === "all" ? undefined : (v as Department) })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((d) => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.location ?? "all"}
        onValueChange={(v) =>
          setFilters({ location: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
