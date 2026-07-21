import { useState, useCallback, useEffect } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";
import { PageHeader } from "./components/page-header";
import { Toolbar } from "./components/toolbar";
import { FilterBar } from "./components/filter-bar";
import { EmployeeTable } from "./components/employee-table";
import { EmployeeGrid } from "./components/employee-grid";
import { Blankslate } from "./components/blankslate";
import { ConfirmDeleteDialog } from "./components/confirm-delete-dialog";
import { CsvImportDialog } from "./components/csv-import-dialog";
import { toast } from "sonner";
import type { Employee } from "@/data/seed";

function usePersistedView(): ["list" | "grid", (v: "list" | "grid") => void] {
  const [view, setView] = useState<"list" | "grid">(() => {
    try {
      return (localStorage.getItem("employees-view") as "list" | "grid") || "list";
    } catch {
      return "list";
    }
  });

  const setAndPersist = useCallback((v: "list" | "grid") => {
    setView(v);
    try {
      localStorage.setItem("employees-view", v);
    } catch {
      // ignore
    }
  }, []);

  return [view, setAndPersist];
}

export default function Employees() {
  const { useEmployees, useOverviewStats, useDeleteEmployee, useDeleteEmployees } =
    useDataProvider();
  const { filters } = useFilters();
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: employees, isLoading } = useEmployees(filters);
  const { mutate: deleteOne } = useDeleteEmployee();
  const { mutate: deleteMany } = useDeleteEmployees();

  const [view, setView] = usePersistedView();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters.department, filters.location, filters.search, filters.sort]);

  const isEmpty = !statsLoading && stats.totalEmployees === 0;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === employees.length) return new Set();
      return new Set(employees.map((e) => e.id));
    });
  }, [employees]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteOne(deleteTarget.id);
      toast.success(`${deleteTarget.full_name} removed.`);
      setDeleteTarget(null);
    }
  };

  const handleBatchDeleteConfirm = () => {
    const ids = Array.from(selectedIds);
    deleteMany(ids);
    toast.success(`${ids.length} employee${ids.length === 1 ? "" : "s"} removed.`);
    setSelectedIds(new Set());
    setBatchDeleteOpen(false);
  };

  return (
    <main className="flex-1 overflow-auto">
      {isEmpty ? (
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          <PageHeader />
          <Blankslate onImport={() => setImportOpen(true)} />
        </div>
      ) : (
        <>
          <Toolbar
            view={view}
            onViewChange={setView}
            selectedCount={selectedIds.size}
            onDeleteSelected={() => setBatchDeleteOpen(true)}
            onImport={() => setImportOpen(true)}
          />
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            <PageHeader
              selectedCount={selectedIds.size}
              onClearSelection={() => setSelectedIds(new Set())}
            />
            <FilterBar />

            {!isLoading && employees.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No employees match your filters.
                </p>
              </div>
            ) : view === "list" ? (
              <EmployeeTable
                employees={employees}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                onDelete={setDeleteTarget}
              />
            ) : (
              <EmployeeGrid
                employees={employees}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            )}
          </div>
        </>
      )}

      <div className="mx-auto max-w-5xl px-6">
        <ConfirmDeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          name={deleteTarget?.full_name ?? ""}
          onConfirm={handleDeleteConfirm}
        />

        <ConfirmDeleteDialog
          open={batchDeleteOpen}
          onOpenChange={setBatchDeleteOpen}
          name=""
          count={selectedIds.size}
          onConfirm={handleBatchDeleteConfirm}
        />

        <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    </main>
  );
}
