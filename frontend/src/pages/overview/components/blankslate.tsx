import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/base/button";
import { IconPlus, IconUsers } from "@tabler/icons-react";

function SkeletonRows() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-2.5 w-48 rounded bg-muted" />
          </div>
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function Blankslate({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-lg border border-border">
      <div className="pointer-events-none" aria-hidden>
        <SkeletonRows />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <IconPlus className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your first project to get started.
              </p>
            </div>
            <Button onClick={onCreate}>
              <IconPlus className="size-4 mr-2" />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
