import { IconHome, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/base/button";

export function PageHeader({ onCreate, showCreate }: { onCreate: () => void; showCreate: boolean }) {
  return (
    <div className="flex items-center justify-between space-y-1">
      <div className="flex items-center gap-2">
        <IconHome className="size-6 text-muted-foreground" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
      </div>
      {showCreate && (
        <Button onClick={onCreate} size="sm">
          <IconPlus className="size-4 mr-2" />
          New Project
        </Button>
      )}
    </div>
  );
}
