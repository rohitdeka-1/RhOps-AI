import { IconSettings } from "@tabler/icons-react";

export function PageHeader() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <IconSettings className="size-6 text-muted-foreground" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Profile &middot; Team &middot; General
      </p>
    </div>
  );
}
