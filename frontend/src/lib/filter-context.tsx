import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Department } from '@/data/seed';

export type SortOption =
  | 'first_name_asc'
  | 'last_name_asc'
  | 'start_date_newest'
  | 'start_date_oldest'
  | 'date_added_newest';

export interface EmployeeFilters {
  department?: Department;
  location?: string;
  search?: string;
  sort?: SortOption;
}

export interface CalendarFilters {
  view: 'month' | 'week' | 'year';
  year: number;
  month?: number;
  weekStart?: string;
}

interface FilterContextValue {
  filters: EmployeeFilters;
  setFilters: (updates: Partial<EmployeeFilters>) => void;
  resetFilters: () => void;
  calendarFilters: CalendarFilters;
  setCalendarFilters: (updates: Partial<CalendarFilters>) => void;
}

const defaultFilters: EmployeeFilters = {
  sort: 'first_name_asc',
};

const now = new Date();
const defaultCalendarFilters: CalendarFilters = {
  view: 'month',
  year: now.getFullYear(),
  month: now.getMonth() + 1,
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<EmployeeFilters>(defaultFilters);
  const [calendarFilters, setCalendarFiltersState] = useState<CalendarFilters>(defaultCalendarFilters);

  const setFilters = useCallback((updates: Partial<EmployeeFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const setCalendarFilters = useCallback((updates: Partial<CalendarFilters>) => {
    setCalendarFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, resetFilters, calendarFilters, setCalendarFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be inside FilterProvider');
  return ctx;
}
