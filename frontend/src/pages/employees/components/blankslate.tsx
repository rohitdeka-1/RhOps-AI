import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/base/button";
import { IconPlus, IconUsers } from "@tabler/icons-react";

function SkeletonRows() {
  return (
    <div className="space-y-6 px-4 pt-4">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="border-b border-dashed border-border" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-4 shrink-0 rounded bg-muted" />
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-2.5 w-48 rounded bg-muted" />
          </div>
          <div className="h-2.5 w-16 rounded bg-muted" />
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
      ))}
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="border-b border-dashed border-border" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-4 shrink-0 rounded bg-muted" />
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-2.5 w-48 rounded bg-muted" />
          </div>
          <div className="h-2.5 w-16 rounded bg-muted" />
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface BlankslateProps {
  onImport?: () => void;
}

export function Blankslate({ onImport }: BlankslateProps) {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

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
              <IconUsers className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No team members yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Add the first one to get started.
              </p>
            </div>
            <Button asChild>
              <Link to={`${prefix}/employees/new`}>
                <IconPlus className="size-4" />
                Add your first team member
              </Link>
            </Button>
            {onImport && (
              <button
                className="text-sm text-primary hover:underline"
                onClick={onImport}
              >
                or import from CSV
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
