import { useEffect, useState } from "react";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    const region = document.querySelector<HTMLElement>("[data-hero-region]");
    if (!region) {
      setOnHero(false);
      return;
    }
    const check = () => {
      const rect = region.getBoundingClientRect();
      // Header (h-14 = 56px) is over the hero region while its bottom sits
      // below the header baseline.
      setOnHero(rect.bottom > 56);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        onHero
          ? "bg-primary text-primary-foreground"
          : "bg-background text-foreground",
      )}
    >
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <a
          href="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight"
        >
          RhOps AI
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            asChild
            className={cn(
              "hidden sm:inline-flex",
              onHero &&
                "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            <a href="/demo/overview">View demo</a>
          </Button>
          <Button
            variant="ghost"
            asChild
            className={cn(
              onHero &&
                "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            <a href="/auth">Sign in</a>
          </Button>
          <Button asChild variant={onHero ? "secondary" : "default"}>
            <a href="/auth">Get started</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
