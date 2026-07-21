import { Button } from "@/components/base/button";
import { IconX } from "@tabler/icons-react";

interface BatchToolbarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export function BatchToolbar({ count, onDelete, onClear }: BatchToolbarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={onDelete}
      >
        Delete selected
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <IconX className="size-4" />
        Clear
      </Button>
    </div>
  );
}
