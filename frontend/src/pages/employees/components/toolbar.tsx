import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/base/button";
import {
  IconList,
  IconLayoutGrid,
  IconPlus,
  IconUpload,
  IconTrash,
  IconDots,
} from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onImport: () => void;
}

export function Toolbar({
  view,
  onViewChange,
  selectedCount,
  onDeleteSelected,
  onImport,
}: ToolbarProps) {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-2">
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(v) => {
          if (v) onViewChange(v as "list" | "grid");
        }}
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem value="list" aria-label="List view">
          <IconList className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <IconLayoutGrid className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex-1" />

      {hasSelection ? (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={onDeleteSelected}
        >
          <IconTrash className="size-4" />
          Delete {selectedCount}
        </Button>
      ) : (
        <>
          <Button asChild size="sm">
            <Link to={`${prefix}/employees/new`}>
              <IconPlus className="size-4" />
              New
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onImport}>
            <IconUpload className="size-4" />
            Import
          </Button>
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDots className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onImport}>
            <IconUpload className="size-4" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
