import { IconLoader2 } from "@tabler/icons-react";

export function ArchitectureTab() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-8 animate-spin" />
        <p>Loading architecture graph...</p>
      </div>
    </div>
  );
}
