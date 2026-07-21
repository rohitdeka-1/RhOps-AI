import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/base/button";
import { IconPlus, IconCake } from "@tabler/icons-react";

function SkeletonGrid() {
  return (
    <div className="space-y-2 p-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 w-8 rounded bg-muted mx-auto" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, col) => (
            <div key={col} className="h-14 rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Blankslate() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-lg border border-border">
      <div className="pointer-events-none" aria-hidden>
        <SkeletonGrid />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <IconCake className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No birthdays on record yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Add team members to see their birthdays here.
              </p>
            </div>
            <Button asChild>
              <Link to={`${prefix}/employees/new`}>
                <IconPlus className="size-4" />
                Add your first team member
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
