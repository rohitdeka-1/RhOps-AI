import { IconCookie, IconBolt, IconMicrophone2, IconPlane } from "@tabler/icons-react";
import type { FunFacts } from "@/data/seed";

interface FunFactsGridProps {
  funFacts: FunFacts;
  firstName: string;
}

const funFactConfig = [
  { key: "desk_snack" as const, icon: IconCookie, label: "DESK SNACK" },
  { key: "hidden_talent" as const, icon: IconBolt, label: "HIDDEN TALENT" },
  { key: "karaoke_song" as const, icon: IconMicrophone2, label: "KARAOKE SONG" },
  { key: "dream_vacation" as const, icon: IconPlane, label: "DREAM VACATION" },
];

export function FunFactsGrid({ funFacts, firstName }: FunFactsGridProps) {
  const hasFacts = funFactConfig.some((f) => funFacts[f.key]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">
        Get to know {firstName}
      </h3>
      {hasFacts ? (
        <div className="grid grid-cols-2 gap-4">
          {funFactConfig.map((fact) => {
            const value = funFacts[fact.key];
            if (!value) return null;
            const Icon = fact.icon;
            return (
              <div
                key={fact.key}
                className="rounded-lg p-4 transition-colors hover:bg-muted/60"
              >
                <Icon className="size-4 text-muted-foreground mb-2" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {fact.label}
                </p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No fun facts yet — add some by editing this profile.
        </p>
      )}
    </div>
  );
}
