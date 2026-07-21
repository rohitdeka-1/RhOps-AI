import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth/auth-provider';
import * as seed from '@/data/seed';
import type {
  Employee,
  Profile,
  TeamMember,
  Invitation,
  FunFacts,
  Department,
} from '@/data/seed';

export type { Employee, Profile, TeamMember, Invitation, FunFacts, Department };
import type { EmployeeFilters, CalendarFilters } from '@/lib/filter-context';

// ── Shared types ──────────────────────────────────────────────────

export interface OverviewStats {
  totalEmployees: number;
  totalDepartments: number;
  newHireCount: number;
}

export interface UpcomingBirthday {
  id: string;
  full_name: string;
  birthday: string;
  daysUntil: number;
}

export interface BirthdayEntry {
  id: string;
  full_name: string;
  birthday: string;
  avatar_url: string | null;
}

export interface CreateEmployeeInput {
  full_name: string;
  role: string;
  department: Department;
  start_date: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  birthday?: string | null;
  fun_facts?: FunFacts;
  avatar_url?: string | null;
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {}

export interface UpdateProfileInput {
  full_name: string;
  new_password?: string;
}

export interface CreateInvitationInput {
  email: string;
  role: 'admin' | 'member';
}

// ── Provider interface ────────────────────────────────────────────

export interface DirectoryDataProvider {
  useOverviewStats(): { data: OverviewStats; isLoading: boolean };
  useRecentHires(limit?: number): { data: Employee[]; isLoading: boolean };
  useUpcomingBirthdays(withinDays?: number): { data: UpcomingBirthday[]; isLoading: boolean };
  useEmployees(filters: EmployeeFilters): { data: Employee[]; isLoading: boolean };
  useEmployee(id: string): { data: Employee | null; isLoading: boolean };
  useBirthdaysByPeriod(filters: CalendarFilters): { data: BirthdayEntry[]; isLoading: boolean };
  useProfile(): { data: Profile | null; isLoading: boolean };
  useTeamMembers(): { data: TeamMember[]; isLoading: boolean };
  useInvitations(): { data: Invitation[]; isLoading: boolean };
  useCreateEmployee(): {
    mutate: (
      input: CreateEmployeeInput,
      options?: { onSuccess?: (data: unknown) => void; onError?: (err: unknown) => void }
    ) => void;
    mutateAsync: (input: CreateEmployeeInput) => Promise<unknown>;
    isPending: boolean;
  };
  useCreateEmployeesBulk(): { mutate: (rows: CreateEmployeeInput[]) => void; isPending: boolean };
  useUpdateEmployee(): { mutate: (args: { id: string; input: UpdateEmployeeInput }) => void; isPending: boolean };
  useDeleteEmployee(): { mutate: (id: string) => void; isPending: boolean };
  useDeleteEmployees(): { mutate: (ids: string[]) => void; isPending: boolean };
  useUpdateProfile(): { mutate: (input: UpdateProfileInput) => void; isPending: boolean };
  useCreateInvitation(): { mutate: (input: CreateInvitationInput) => void; isPending: boolean };
  useUpdateUserRole(): { mutate: (args: { userId: string; role: 'admin' | 'member' }) => void; isPending: boolean };
  useRevokeInvitation(): { mutate: (id: string) => void; isPending: boolean };
  useRemoveTeamMember(): { mutate: (userId: string) => void; isPending: boolean };
  useDeleteAccount(): { mutate: () => void; isPending: boolean };
}

const DataProviderContext = createContext<DirectoryDataProvider | null>(null);

export function useDataProvider(): DirectoryDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error('useDataProvider must be inside a DataProvider');
  return ctx;
}

// ── Shared helpers ────────────────────────────────────────────────

function computeDaysUntilBirthday(mmdd: string): number {
  const now = new Date();
  const [mm, dd] = mmdd.split('-').map(Number);
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, mm - 1, dd);
  if (next < now) {
    next = new Date(thisYear + 1, mm - 1, dd);
  }
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function applyEmployeeFilters(list: Employee[], filters: EmployeeFilters): Employee[] {
  let result = list;

  if (filters.department) {
    result = result.filter((e) => e.department === filters.department);
  }
  if (filters.location) {
    result = result.filter((e) => e.location === filters.location);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        (e.location?.toLowerCase().includes(q) ?? false),
    );
  }

  const sort = filters.sort ?? 'first_name_asc';
  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'first_name_asc':
        return a.full_name.localeCompare(b.full_name);
      case 'last_name_asc': {
        const aLast = a.full_name.split(' ').pop() ?? '';
        const bLast = b.full_name.split(' ').pop() ?? '';
        return aLast.localeCompare(bLast);
      }
      case 'start_date_newest':
        return b.start_date.localeCompare(a.start_date);
      case 'start_date_oldest':
        return a.start_date.localeCompare(b.start_date);
      case 'date_added_newest':
        return b.created_at.localeCompare(a.created_at);
      default:
        return 0;
    }
  });

  return result;
}

function filterBirthdaysByPeriod(list: Employee[], filters: CalendarFilters): BirthdayEntry[] {
  const withBirthday = list.filter((e) => e.birthday);

  if (filters.view === 'year') {
    return withBirthday.map((e) => ({
      id: e.id,
      full_name: e.full_name,
      birthday: e.birthday!,
      avatar_url: e.avatar_url,
    }));
  }

  if (filters.view === 'month' && filters.month) {
    const monthPad = String(filters.month).padStart(2, '0');
    return withBirthday
      .filter((e) => e.birthday!.startsWith(monthPad))
      .map((e) => ({
        id: e.id,
        full_name: e.full_name,
        birthday: e.birthday!,
        avatar_url: e.avatar_url,
      }))
      .sort((a, b) => a.birthday.localeCompare(b.birthday));
  }

  if (filters.view === 'week' && filters.weekStart) {
    const start = new Date(filters.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return withBirthday
      .filter((e) => {
        const [mm, dd] = e.birthday!.split('-').map(Number);
        const bdayThisYear = new Date(filters.year, mm - 1, dd);
        return bdayThisYear >= start && bdayThisYear <= end;
      })
      .map((e) => ({
        id: e.id,
        full_name: e.full_name,
        birthday: e.birthday!,
        avatar_url: e.avatar_url,
      }));
  }

  return [];
}

// ── SeedDataProvider ──────────────────────────────────────────────

export function SeedDataProvider({ children }: { children: ReactNode }) {
  const demoToast = () => toast('Sign in to save changes');

  const provider: DirectoryDataProvider = {
    useOverviewStats: () => {
      const data = useMemo(() => {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const departments = new Set(seed.employees.map((e) => e.department));
        const newHires = seed.employees.filter(
          (e) => new Date(e.start_date) >= sixtyDaysAgo,
        );
        return {
          totalEmployees: seed.employees.length,
          totalDepartments: departments.size,
          newHireCount: newHires.length,
        };
      }, []);
      return { data, isLoading: false };
    },

    useRecentHires: (limit = 3) => {
      const data = useMemo(
        () =>
          [...seed.employees]
            .sort((a, b) => b.start_date.localeCompare(a.start_date))
            .slice(0, limit),
        [limit],
      );
      return { data, isLoading: false };
    },

    useUpcomingBirthdays: (withinDays = 30) => {
      const data = useMemo(() => {
        return seed.employees
          .filter((e) => e.birthday)
          .map((e) => ({
            id: e.id,
            full_name: e.full_name,
            birthday: e.birthday!,
            daysUntil: computeDaysUntilBirthday(e.birthday!),
          }))
          .filter((b) => b.daysUntil <= withinDays)
          .sort((a, b) => a.daysUntil - b.daysUntil);
      }, [withinDays]);
      return { data, isLoading: false };
    },

    useEmployees: (filters) => {
      const data = useMemo(
        () => applyEmployeeFilters(seed.employees, filters),
        [filters.department, filters.location, filters.search, filters.sort],
      );
      return { data, isLoading: false };
    },

    useEmployee: (id) => {
      const data = useMemo(
        () => seed.employees.find((e) => e.id === id) ?? null,
        [id],
      );
      return { data, isLoading: false };
    },

    useBirthdaysByPeriod: (filters) => {
      const data = useMemo(
        () => filterBirthdaysByPeriod(seed.employees, filters),
        [filters.view, filters.year, filters.month, filters.weekStart],
      );
      return { data, isLoading: false };
    },

    useProfile: () => ({ data: seed.profile, isLoading: false }),

    useTeamMembers: () => {
      const data = useMemo(
        () =>
          [...seed.teamMembers].sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (a.role !== 'admin' && b.role === 'admin') return 1;
            return a.full_name.localeCompare(b.full_name);
          }),
        [],
      );
      return { data, isLoading: false };
    },

    useInvitations: () => {
      const data = useMemo(
        () =>
          seed.invitations
            .filter((i) => i.status === 'pending')
            .sort((a, b) => b.created_at.localeCompare(a.created_at)),
        [],
      );
      return { data, isLoading: false };
    },

    useCreateEmployee: () => ({
      mutate: demoToast,
      mutateAsync: async (..._args: unknown[]) => { demoToast(); },
      isPending: false,
    }),
    useCreateEmployeesBulk: () => ({ mutate: demoToast, isPending: false }),
    useUpdateEmployee: () => ({ mutate: demoToast, isPending: false }),
    useDeleteEmployee: () => ({ mutate: demoToast, isPending: false }),
    useDeleteEmployees: () => ({ mutate: demoToast, isPending: false }),
    useUpdateProfile: () => ({ mutate: demoToast, isPending: false }),
    useCreateInvitation: () => ({ mutate: demoToast, isPending: false }),
    useUpdateUserRole: () => ({ mutate: demoToast, isPending: false }),
    useRevokeInvitation: () => ({ mutate: demoToast, isPending: false }),
    useRemoveTeamMember: () => ({ mutate: demoToast, isPending: false }),
    useDeleteAccount: () => ({ mutate: demoToast, isPending: false }),
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

// ── SupabaseDataProvider ──────────────────────────────────────────

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const provider: DirectoryDataProvider = {
    useOverviewStats: () => {
      const { data, isLoading } = useQuery({
        queryKey: ['overviewStats', user?.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('employees')
            .select('department, start_date')
            .eq('user_id', user!.id);
          const rows = data ?? [];
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          return {
            totalEmployees: rows.length,
            totalDepartments: new Set(rows.map((e) => e.department)).size,
            newHireCount: rows.filter((e) => new Date(e.start_date) >= sixtyDaysAgo).length,
          };
        },
        enabled: !!user,
      });
      return {
        data: data ?? { totalEmployees: 0, totalDepartments: 0, newHireCount: 0 },
        isLoading,
      };
    },

    useRecentHires: (limit = 3) => {
      const { data, isLoading } = useQuery({
        queryKey: ['recentHires', user?.id, limit],
        queryFn: async () => {
          const { data } = await supabase
            .from('employees')
            .select('id, full_name, role, department, location, start_date, avatar_url, user_id, email, phone, birthday, fun_facts, created_at, updated_at')
            .eq('user_id', user!.id)
            .order('start_date', { ascending: false })
            .limit(limit);
          return (data ?? []) as Employee[];
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useUpcomingBirthdays: (withinDays = 30) => {
      const { data, isLoading } = useQuery({
        queryKey: ['upcomingBirthdays', user?.id, withinDays],
        queryFn: async () => {
          const { data } = await supabase
            .from('employees')
            .select('id, full_name, birthday')
            .eq('user_id', user!.id)
            .not('birthday', 'is', null);
          return (data ?? [])
            .map((e) => ({
              id: e.id,
              full_name: e.full_name,
              birthday: e.birthday!,
              daysUntil: computeDaysUntilBirthday(e.birthday!),
            }))
            .filter((b) => b.daysUntil <= withinDays)
            .sort((a, b) => a.daysUntil - b.daysUntil);
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useEmployees: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ['employees', user?.id, filters],
        queryFn: async () => {
          let query = supabase
            .from('employees')
            .select('id, full_name, role, department, email, location, start_date, avatar_url, user_id, phone, birthday, fun_facts, created_at, updated_at')
            .eq('user_id', user!.id);

          if (filters.department) {
            query = query.eq('department', filters.department);
          }
          if (filters.location) {
            query = query.eq('location', filters.location);
          }
          if (filters.search) {
            // Strip PostgREST operator characters to prevent filter injection.
            const safeSearch = filters.search.replace(/[,()*\\%]/g, ' ').trim();
            if (safeSearch) {
            query = query.or(
              `full_name.ilike.%${safeSearch}%,role.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`,
            );
            }
          }

          const sortMap: Record<string, { column: string; ascending: boolean }> = {
            first_name_asc: { column: 'full_name', ascending: true },
            last_name_asc: { column: 'full_name', ascending: true },
            start_date_newest: { column: 'start_date', ascending: false },
            start_date_oldest: { column: 'start_date', ascending: true },
            date_added_newest: { column: 'created_at', ascending: false },
          };
          const sort = sortMap[filters.sort ?? 'first_name_asc'];
          query = query.order(sort.column, { ascending: sort.ascending });

          const { data } = await query;
          return (data ?? []) as Employee[];
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useEmployee: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ['employee', id, user?.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .eq('user_id', user!.id)
            .single();
          return (data as Employee) ?? null;
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? null, isLoading };
    },

    useBirthdaysByPeriod: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ['birthdaysByPeriod', user?.id, filters],
        queryFn: async () => {
          const { data } = await supabase
            .from('employees')
            .select('id, full_name, birthday, avatar_url')
            .eq('user_id', user!.id)
            .not('birthday', 'is', null);
          return filterBirthdaysByPeriod(
            (data ?? []).map((e) => ({ ...e, user_id: user!.id, role: '', department: 'engineering' as Department, email: null, phone: null, location: null, start_date: '', fun_facts: {}, created_at: '', updated_at: '' })),
            filters,
          );
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useProfile: () => {
      const { data, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, created_at, updated_at')
            .eq('id', user!.id)
            .single();
          return (data as Profile) ?? null;
        },
        enabled: !!user,
      });
      return { data: data ?? null, isLoading };
    },

    useTeamMembers: () => {
      const { data, isLoading } = useQuery({
        queryKey: ['teamMembers', user?.id],
        queryFn: async () => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('user_id, role');
          if (!roles) return [];

          const userIds = roles.map((r) => r.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
          return roles
            .map((r) => {
              const prof = profileMap.get(r.user_id);
              return {
                user_id: r.user_id,
                full_name: prof?.full_name ?? '',
                email: '',
                role: r.role as 'admin' | 'member',
                avatar_url: prof?.avatar_url ?? null,
              };
            })
            .sort((a, b) => {
              if (a.role === 'admin' && b.role !== 'admin') return -1;
              if (a.role !== 'admin' && b.role === 'admin') return 1;
              return a.full_name.localeCompare(b.full_name);
            });
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useInvitations: () => {
      const { data, isLoading } = useQuery({
        queryKey: ['invitations', user?.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('invitations')
            .select('id, email, role, status, created_at, invited_by')
            .eq('invited_by', user!.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
          return (data ?? []) as Invitation[];
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateEmployee: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateEmployeeInput) => {
          const { data, error } = await supabase
            .from('employees')
            .insert({
              user_id: user!.id,
              full_name: input.full_name,
              role: input.role,
              department: input.department,
              start_date: input.start_date,
              email: input.email ?? null,
              phone: input.phone ?? null,
              location: input.location ?? null,
              birthday: input.birthday ?? null,
              fun_facts: input.fun_facts ?? {},
              avatar_url: null,
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, input) => {
          queryClient.invalidateQueries({ queryKey: ['employees', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['overviewStats', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['recentHires', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays', user?.id] });
          toast.success(`${input.full_name} added to ${input.department.charAt(0).toUpperCase() + input.department.slice(1)}`);
        },
        onError: (err: any) => {
          if (err?.message?.includes('employees_birthday_check')) {
            toast.error('Birthday must be MM-DD (e.g. 03-14).');
          } else {
            toast.error('Failed to add employee.');
          }
        },
      });
      return { mutate: mutation.mutate, mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
    },

    useCreateEmployeesBulk: () => {
      const mutation = useMutation({
        mutationFn: async (rows: CreateEmployeeInput[]) => {
          const { data, error } = await supabase
            .from('employees')
            .insert(
              rows.map((r) => ({
                user_id: user!.id,
                full_name: r.full_name,
                role: r.role,
                department: r.department,
                start_date: r.start_date,
                email: r.email ?? null,
                phone: r.phone ?? null,
                location: r.location ?? null,
                birthday: r.birthday ?? null,
                fun_facts: {},
                avatar_url: null,
              })),
            )
            .select();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, rows) => {
          queryClient.invalidateQueries({ queryKey: ['employees', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['overviewStats', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['recentHires', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays', user?.id] });
          toast.success(`${rows.length} employees imported.`);
        },
        onError: () => toast.error('Failed to import employees.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateEmployee: () => {
      const mutation = useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateEmployeeInput }) => {
          const { data, error } = await supabase
            .from('employees')
            .update({
              full_name: input.full_name,
              role: input.role,
              department: input.department,
              start_date: input.start_date,
              email: input.email ?? null,
              phone: input.phone ?? null,
              location: input.location ?? null,
              birthday: input.birthday ?? null,
              fun_facts: input.fun_facts ?? {},
              ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user!.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['employees', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['employee', id] });
          queryClient.invalidateQueries({ queryKey: ['recentHires', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['birthdaysByPeriod', user?.id] });
          toast.success('Changes saved.');
        },
        onError: (err: any) => {
          if (err?.message?.includes('employees_birthday_check')) {
            toast.error('Birthday must be MM-DD (e.g. 03-14).');
          } else {
            toast.error('Failed to save changes.');
          }
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useDeleteEmployee: () => {
      const mutation = useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id)
            .eq('user_id', user!.id);
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['employees', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['overviewStats', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['recentHires', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['birthdaysByPeriod', user?.id] });
        },
        onError: () => toast.error('Failed to remove employee.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useDeleteEmployees: () => {
      const mutation = useMutation({
        mutationFn: async (ids: string[]) => {
          const { error } = await supabase
            .from('employees')
            .delete()
            .in('id', ids)
            .eq('user_id', user!.id);
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['employees', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['overviewStats', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['recentHires', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['birthdaysByPeriod', user?.id] });
        },
        onError: () => toast.error('Failed to delete selected employees.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (input: UpdateProfileInput) => {
          const { error } = await supabase
            .from('profiles')
            .update({
              full_name: input.full_name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user!.id);
          if (error) throw error;

          if (input.new_password) {
            const { error: pwError } = await supabase.auth.updateUser({
              password: input.new_password,
            });
            if (pwError) throw pwError;
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
          toast.success('Profile updated.');
        },
        onError: () => toast.error('Failed to update profile.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useCreateInvitation: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateInvitationInput) => {
          const { data, error } = await supabase
            .from('invitations')
            .insert({
              email: input.email,
              role: input.role,
              invited_by: user!.id,
              status: 'pending',
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, input) => {
          queryClient.invalidateQueries({ queryKey: ['invitations', user?.id] });
          toast.success(`Invite sent to ${input.email}.`);
        },
        onError: () => toast.error('Failed to send invitation.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateUserRole: () => {
      const mutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'member' }) => {
          const { error } = await supabase.rpc('update_member_role', {
            _user_id: userId,
            _role: role,
          });
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['teamMembers', user?.id] });
          toast.success('Role updated.');
        },
        onError: () => toast.error('Failed to update role.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useRevokeInvitation: () => {
      const mutation = useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase
            .from('invitations')
            .update({ status: 'revoked' })
            .eq('id', id)
            .eq('invited_by', user!.id);
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['invitations', user?.id] });
          toast.success('Invitation revoked.');
        },
        onError: () => toast.error('Failed to revoke invitation.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useRemoveTeamMember: () => {
      const mutation = useMutation({
        mutationFn: async (userId: string) => {
          const { error } = await supabase.rpc('remove_team_member', {
            _user_id: userId,
          });
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['teamMembers', user?.id] });
          toast.success('Team member removed.');
        },
        onError: (err: any) => toast.error(err?.message ?? 'Failed to remove member.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useDeleteAccount: () => {
      const mutation = useMutation({
        mutationFn: async () => {
          const { error } = await supabase.functions.invoke('delete-account', {
            body: { user_id: user!.id },
          });
          if (error) throw error;
          await supabase.auth.signOut();
          queryClient.clear();
        },
        onError: () => toast.error('Failed to delete account. Please try again.'),
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}
