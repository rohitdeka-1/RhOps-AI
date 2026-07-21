import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "@/components/base/cycler-nav";

/**
 * Autoplay play/pause toggle button. Wraps shadcn Button to inherit focus-ring
 * + disabled handling consistently. Shares PauseIcon / PlayIcon with CyclerNav.
 * Size matches CyclerNav's button (2.375rem) for visual consistency.
 */
export type AutoplayToggleProps = {
  paused: boolean;
  onToggle: () => void;
  className?: string;
};

export const AutoplayToggle = ({ paused, onToggle, className }: AutoplayToggleProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={onToggle}
    aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
    className={cn(
      "relative h-[2.375rem] w-[2.375rem] rounded-full bg-foreground/10 text-foreground hover:bg-foreground/15 hover:text-foreground",
      className,
    )}
  >
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity",
        paused ? "opacity-0" : "opacity-100",
      )}
    >
      <PauseIcon />
    </span>
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity",
        paused ? "opacity-100" : "opacity-0",
      )}
    >
      <PlayIcon />
    </span>
  </Button>
);
