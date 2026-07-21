import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/base/button";
import { IconUpload, IconCheck, IconAlertTriangle, IconFileSpreadsheet } from "@tabler/icons-react";
import { useDataProvider, type CreateEmployeeInput } from "@/lib/data-provider";
import type { Department } from "@/data/seed";

const VALID_DEPARTMENTS = new Set<string>([
  "engineering",
  "product",
  "design",
  "operations",
]);

const TEMPLATE_CSV =
  "name,role,department,email,phone,location,start_date,birthday\nJamie Lin,Senior Engineer,engineering,jamie@acme.co,+1 415 555 0101,SF,2021-06-14,01-04";

interface ParsedRow {
  input: CreateEmployeeInput;
  warnings: string[];
  valid: boolean;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? "";
    });

    const warnings: string[] = [];
    if (!record.name) warnings.push("Missing name");
    if (!record.role) warnings.push("Missing role");
    if (!record.department) warnings.push("Missing department");
    if (record.department && !VALID_DEPARTMENTS.has(record.department.toLowerCase())) {
      warnings.push("Unrecognized department");
    }
    if (!record.start_date) warnings.push("Missing start date");

    const dept = record.department?.toLowerCase() as Department;

    rows.push({
      input: {
        full_name: record.name || "",
        role: record.role || "",
        department: VALID_DEPARTMENTS.has(dept) ? dept : "engineering",
        start_date: record.start_date || new Date().toISOString().slice(0, 10),
        email: record.email || null,
        phone: record.phone || null,
        location: record.location || null,
        birthday: record.birthday || null,
      },
      warnings,
      valid: !!record.name && !!record.role && !!record.start_date,
    });
  }

  return rows;
}

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { useCreateEmployeesBulk } = useDataProvider();
  const { mutate: bulkCreate, isPending } = useCreateEmployeesBulk();

  const warningCount = rows.filter((r) => r.warnings.length > 0).length;

  const reset = useCallback(() => {
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-directory-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const inputs = rows.filter((r) => r.valid).map((r) => r.input);
    if (inputs.length === 0) return;
    bulkCreate(inputs);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <IconFileSpreadsheet className="size-5 text-muted-foreground" />
          </div>
          <DialogTitle>Import team members</DialogTitle>
          <DialogDescription>
            Upload a CSV to add multiple team members at once.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <IconUpload className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {fileName || "Drop a CSV file here, or click to browse"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Expected columns: name, role, department, email, phone, location,
          start_date, birthday
        </p>
        <button
          className="text-xs text-primary hover:underline text-left"
          onClick={handleDownloadTemplate}
        >
          Download template CSV
        </button>

        {rows.length > 0 && (
          <>
            <div className="border-t border-border" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <div className="max-h-[200px] overflow-auto rounded-lg border border-border">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0 text-sm"
                  >
                    {row.warnings.length > 0 ? (
                      <IconAlertTriangle className="size-4 shrink-0 text-amber-500" />
                    ) : (
                      <IconCheck className="size-4 shrink-0 text-green-500" />
                    )}
                    <span className="flex-1 truncate text-foreground">
                      {row.input.full_name}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {row.input.role}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {row.input.department}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {rows.length} row{rows.length === 1 ? "" : "s"}
                {warningCount > 0 && ` · ${warningCount} warning${warningCount === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isPending}>
                Import {rows.filter((r) => r.valid).length} employees
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
